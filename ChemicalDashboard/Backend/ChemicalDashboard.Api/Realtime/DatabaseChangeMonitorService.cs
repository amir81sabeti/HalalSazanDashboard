using System.Data;
using ChemicalDashboard.Application.Interfaces.Data;
using Dapper;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Api.Realtime;

/// <summary>
/// سرویس مانیتورینگ پس‌زمینه پایگاه داده جهت شناسایی بلادرنگ رکوردهای درج شده یا ویرایش شده (INSERT & UPDATE)
/// با توجه به سازوکار سامانه که ابتدا رکورد خالی ایجاد شده و سپس توسط Entry.aspx ویرایش و ذخیره (IsSabt=1) می‌شود،
/// این سرویس علاوه بر MAX(Id)، چک‌سام تجمیعی مقادیر شاخص‌ها (سرعت، دما، فشار، اسید و وضعیت IsSabt) را پایش می‌کند.
/// به محض ثبت یا ویرایش هر رکورد در دیتابیس، بدون نیاز به رفرش صفحه، سیگنال بلادرنگ به داشبورد ارسال می‌گردد.
/// </summary>
public sealed class DatabaseChangeMonitorService : BackgroundService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IProductionRealtimeNotifier _notifier;
    private readonly ILogger<DatabaseChangeMonitorService> _logger;

    private int _lastKnownBatchLogId = 0;
    private long _lastKnownBatchLogCount = 0;
    private int _lastKnownBatchLogChecksum = 0;

    private int _lastKnownTestRecordId = 0;
    private long _lastKnownTestRecordCount = 0;
    private int _lastKnownTestRecordChecksum = 0;

    private bool _isInitialized = false;

    private const string LogChecksumQuery = @"
        SELECT 
            ISNULL(MAX(Id), 0) AS MaxId, 
            COUNT_BIG(*) AS [Count],
            ISNULL(CHECKSUM_AGG(BINARY_CHECKSUM(
                Id, 
                IsSabt, 
                ProductSpeed, 
                AGSpeed, 
                ProductDegree, 
                AcidNumber, 
                DistillationTopTemp, 
                ReactorPressure, 
                InspectionTime, 
                ProductAmount, 
                AGAmount, 
                OutputType, 
                OperatorManualDate
            )), 0) AS [Checksum]
        FROM dbo.BatchProductionLog WITH (NOLOCK);";

    private const string TestChecksumQuery = @"
        SELECT 
            ISNULL(MAX(id), 0) AS MaxId, 
            COUNT_BIG(*) AS [Count],
            ISNULL(CHECKSUM_AGG(BINARY_CHECKSUM(id, Name, Age)), 0) AS [Checksum]
        FROM dbo.test WITH (NOLOCK);";

    public DatabaseChangeMonitorService(
        IDbConnectionFactory connectionFactory,
        IProductionRealtimeNotifier notifier,
        ILogger<DatabaseChangeMonitorService> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 سرویس دیده‌بان پایگاه داده (دیده‌بان درج و ویرایش لاگ‌ها) فعال شد.");

        // ۱. مقداردهی اولیه شناسه‌ها و چک‌سام جاری
        await InitializeBaselineAsync(stoppingToken);

        // ۲. حلقه پایش پیوسته با فاصله ۱ ثانیه
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(1000));

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await CheckForDatabaseChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "خطای موقت در پایش تغییرات پایگاه داده SQL Server.");
            }
        }

        _logger.LogInformation("سرویس دیده‌بان پایگاه داده متوقف گردید.");
    }

    private async Task InitializeBaselineAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

            var logBaseline = await connection.QueryFirstOrDefaultAsync<(int MaxId, long Count, int Checksum)>(LogChecksumQuery);
            _lastKnownBatchLogId = logBaseline.MaxId;
            _lastKnownBatchLogCount = logBaseline.Count;
            _lastKnownBatchLogChecksum = logBaseline.Checksum;

            var testBaseline = await connection.QueryFirstOrDefaultAsync<(int MaxId, long Count, int Checksum)>(TestChecksumQuery);
            _lastKnownTestRecordId = testBaseline.MaxId;
            _lastKnownTestRecordCount = testBaseline.Count;
            _lastKnownTestRecordChecksum = testBaseline.Checksum;

            _isInitialized = true;
            _logger.LogInformation("پایه اولیه دیده‌بان دیتابیس ثبت شد: آخرین لاگ بچ={MaxLogId}، چک‌سام={Checksum}، آخرین تست={MaxTestId}",
                _lastKnownBatchLogId, _lastKnownBatchLogChecksum, _lastKnownTestRecordId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "عدم موفقیت در ثبت پایه اولیه دیتابیس. در گام‌های بعدی تلاش خواهد شد.");
        }
    }

    private async Task CheckForDatabaseChangesAsync(CancellationToken cancellationToken)
    {
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        // الف) بررسی جدول لاگ‌های خط تولید (BatchProductionLog) - هم برای INSERT و هم برای UPDATE
        var currentLog = await connection.QueryFirstOrDefaultAsync<(int MaxId, long Count, int Checksum)>(LogChecksumQuery);

        if (!_isInitialized)
        {
            _lastKnownBatchLogId = currentLog.MaxId;
            _lastKnownBatchLogCount = currentLog.Count;
            _lastKnownBatchLogChecksum = currentLog.Checksum;
            _isInitialized = true;
            return;
        }

        bool isLogInserted = currentLog.MaxId > _lastKnownBatchLogId || currentLog.Count > _lastKnownBatchLogCount;
        bool isLogUpdated = currentLog.Checksum != _lastKnownBatchLogChecksum;

        if (isLogInserted || isLogUpdated)
        {
            _logger.LogInformation("⚡ رویداد دیتابیس در BatchProductionLog شناسایی شد! نوع: {Action} (شناسه جدید={NewId}، چک‌سام={NewChk})",
                isLogInserted ? "درج رکورد جدید" : "ویرایش / ذخیره رکورد در Entry.aspx",
                currentLog.MaxId, currentLog.Checksum);

            // استخراج مشخصات آخرین رکورد ذخیره شده یا جاری
            var targetLogRow = await connection.QueryFirstOrDefaultAsync<LogSummaryDetails>(
                @"SELECT TOP 1 
                    l.Id, 
                    l.BatchId, 
                    ISNULL(b.BatchNum, 0) AS BatchNumber, 
                    ISNULL(b.ReactorId, 1) AS ReactorId, 
                    CONVERT(VARCHAR(5), l.InspectionTime, 108) AS InspectionTime,
                    ISNULL(l.OperatorManualDate, l.CreatedDate) AS LogDate,
                    ISNULL(l.ProductSpeed, 0) AS ProductSpeed,
                    ISNULL(l.AcidNumber, 0) AS AcidNumber,
                    ISNULL(l.IsSabt, 0) AS IsSabt
                FROM dbo.BatchProductionLog l WITH (NOLOCK)
                LEFT JOIN dbo.Batch b WITH (NOLOCK) ON l.BatchId = b.BatchId
                ORDER BY l.IsSabt DESC, ISNULL(l.OperatorManualDate, l.CreatedDate) DESC, l.InspectionTime DESC, l.Id DESC;");

            _lastKnownBatchLogId = currentLog.MaxId;
            _lastKnownBatchLogCount = currentLog.Count;
            _lastKnownBatchLogChecksum = currentLog.Checksum;

            var batchNumStr = targetLogRow?.BatchNumber > 0 ? targetLogRow.BatchNumber.ToString() : "فعال";
            var reactorNum = targetLogRow?.ReactorId == 1 ? 3 : 4;
            var eventType = isLogInserted ? "BATCH_LOG_INSERTED" : "BATCH_LOG_UPDATED";
            var message = isLogInserted
                ? $"ردیف لاگ جدید برای بچ {batchNumStr} (راکتور {reactorNum}) در دیتابیس ایجاد شد."
                : $"اطلاعات لاگ بچ {batchNumStr} (راکتور {reactorNum}) ویرایش و ثبت گردید.";

            var updateEvent = new RealtimeUpdateEvent
            {
                EventType = eventType,
                Message = message,
                ReactorId = targetLogRow?.ReactorId ?? 1,
                BatchId = targetLogRow?.BatchId,
                BatchNumber = batchNumStr,
                Timestamp = DateTime.UtcNow,
                Payload = new
                {
                    LogId = targetLogRow?.Id ?? currentLog.MaxId,
                    ProductSpeed = targetLogRow?.ProductSpeed ?? 0,
                    AcidNumber = targetLogRow?.AcidNumber ?? 0,
                    InspectionTime = targetLogRow?.InspectionTime,
                    IsSabt = targetLogRow?.IsSabt == 1,
                    IsUpdate = isLogUpdated && !isLogInserted
                }
            };

            await _notifier.BroadcastDataUpdateAsync(updateEvent, cancellationToken);
        }

        // ب) بررسی جدول رکوردهای تست (dbo.test)
        var currentTest = await connection.QueryFirstOrDefaultAsync<(int MaxId, long Count, int Checksum)>(TestChecksumQuery);

        bool isTestInserted = currentTest.MaxId > _lastKnownTestRecordId || currentTest.Count > _lastKnownTestRecordCount;
        bool isTestUpdated = currentTest.Checksum != _lastKnownTestRecordChecksum;

        if (isTestInserted || isTestUpdated)
        {
            _logger.LogInformation("⚡ تغییر در جدول dbo.test شناسایی شد! نوع: {Action}", isTestInserted ? "درج" : "ویرایش");

            _lastKnownTestRecordId = currentTest.MaxId;
            _lastKnownTestRecordCount = currentTest.Count;
            _lastKnownTestRecordChecksum = currentTest.Checksum;

            var testEvent = new RealtimeUpdateEvent
            {
                EventType = isTestInserted ? "TEST_RECORD_INSERTED" : "TEST_RECORD_UPDATED",
                Message = isTestInserted ? "رکورد جدید در جدول dbo.test ثبت شد." : "رکورد جدول dbo.test ویرایش شد.",
                Timestamp = DateTime.UtcNow,
                Payload = new { TestId = currentTest.MaxId }
            };

            await _notifier.BroadcastDataUpdateAsync(testEvent, cancellationToken);
        }
    }

    private sealed class LogSummaryDetails
    {
        public int Id { get; set; }
        public int BatchId { get; set; }
        public int BatchNumber { get; set; }
        public int ReactorId { get; set; }
        public string? InspectionTime { get; set; }
        public DateTime LogDate { get; set; }
        public decimal ProductSpeed { get; set; }
        public decimal AcidNumber { get; set; }
        public byte IsSabt { get; set; }
    }
}
