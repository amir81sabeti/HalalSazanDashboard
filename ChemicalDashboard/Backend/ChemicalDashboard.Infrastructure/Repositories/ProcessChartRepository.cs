using System.Data;
using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Contracts.Chart;
using Dapper;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Repositories;

/// <summary>
/// پیاده‌سازی ریپازیتوری دسترسی به داده‌های نمودارهای فرآیند از طریق استورد پروسیجرهای بهینه
/// </summary>
public sealed class ProcessChartRepository : IProcessChartRepository
{
    private const string SpGetBatchesForFilter = "dbo.sp_GetBatchesForFilter";
    private const string SpGetDynamicChartData = "dbo.sp_GetDynamicChartData";

    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<ProcessChartRepository> _logger;

    public ProcessChartRepository(IDbConnectionFactory connectionFactory, ILogger<ProcessChartRepository> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<IReadOnlyList<BatchFilterItemDto>> GetBatchesForFilterAsync(int? reactorId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {ProcedureName} با راکتور: {ReactorId}", SpGetBatchesForFilter, reactorId);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);

        var command = new CommandDefinition(
            commandText: SpGetBatchesForFilter,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        var rows = await connection.QueryAsync<BatchFilterItemDto>(command);
        return rows.ToList();
    }

    public async Task<IReadOnlyList<ProcessChartPointDto>> GetChartDataAsync(
        int? reactorId,
        int? batchId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {ProcedureName} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}",
            SpGetDynamicChartData, reactorId, batchId);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@FromDate", fromDate, DbType.DateTime);
        parameters.Add("@ToDate", toDate, DbType.DateTime);

        var command = new CommandDefinition(
            commandText: SpGetDynamicChartData,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        var rows = await connection.QueryAsync<ProcessChartPointDto>(command);
        return rows.ToList();
    }

    private const string SpGetDashboardSummary = "dbo.sp_GetDashboardSummary";

    public async Task<DashboardSummaryResponseDto> GetDashboardSummaryAsync(
        int? reactorId,
        int? batchId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {ProcedureName} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}",
            SpGetDashboardSummary, reactorId, batchId);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@FromDate", fromDate, DbType.DateTime);
        parameters.Add("@ToDate", toDate, DbType.DateTime);

        var command = new CommandDefinition(
            commandText: SpGetDashboardSummary,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        using var multi = await connection.QueryMultipleAsync(command);

        var kpiRow = await multi.ReadFirstOrDefaultAsync<dynamic>();
        var trendPoints = (await multi.ReadAsync<ChartSeriesPointDto>()).ToList();
        var recentLogs = (await multi.ReadAsync<RecentLogItemDto>()).ToList();
        var batchSpeeds = (await multi.ReadAsync<BatchSpeedItemDto>()).ToList();
        var reactorComparison = (await multi.ReadAsync<ReactorComparisonItemDto>()).ToList();

        var result = new DashboardSummaryResponseDto
        {
            TrendPoints = trendPoints,
            RecentLogs = recentLogs,
            BatchSpeedAverages = batchSpeeds,
            ReactorComparison = reactorComparison
        };

        if (kpiRow != null)
        {
            result.Kpis = new KpiMetricsSummaryDto
            {
                LogCount = (int)(kpiRow.LogCount ?? 0),
                TotalProductAmount = (decimal)(kpiRow.TotalProductAmount ?? 0m),
                TotalAGAmount = (decimal)(kpiRow.TotalAGAmount ?? 0m),
                AvgProductDegree = Math.Round((decimal)(kpiRow.AvgProductDegree ?? 0m), 1),
                AvgAcidNumber = Math.Round((decimal)(kpiRow.AvgAcidNumber ?? 0m), 2)
            };

            DateTime? batchStart = kpiRow.CurrentBatchStartDate;
            double elapsedHours = 0;
            if (batchStart.HasValue)
            {
                elapsedHours = Math.Max(0, Math.Round((DateTime.Now - batchStart.Value).TotalHours, 1));
            }

            result.StatusInfo = new ProductionStatusSummaryDto
            {
                IsActive = (bool)(kpiRow.IsActive ?? false),
                CurrentBatchNumber = (int)(kpiRow.CurrentBatchNumber ?? 0),
                CurrentReactorNumber = (int)(kpiRow.CurrentReactorId ?? 1) == 1 ? 3 : 4,
                ElapsedHours = elapsedHours
            };
        }

        return result;
    }

    public async Task<int> InsertBatchLogAsync(InsertBatchLogRequestDto request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("درج رکورد جدید در dbo.BatchProductionLog توسط Dapper");
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        int batchId = request.BatchId ?? 0;
        int reactorId = request.ReactorId ?? 1;

        if (batchId <= 0)
        {
            batchId = await connection.ExecuteScalarAsync<int>(
                "SELECT TOP 1 BatchId FROM dbo.Batch WHERE ReactorId = @ReactorId AND IsFinished = 0 ORDER BY BatchId DESC;",
                new { ReactorId = reactorId });

            if (batchId <= 0)
            {
                batchId = await connection.ExecuteScalarAsync<int>(
                    "SELECT TOP 1 BatchId FROM dbo.Batch WHERE ReactorId = @ReactorId ORDER BY BatchId DESC;",
                    new { ReactorId = reactorId });
            }
        }

        var batchNum = await connection.ExecuteScalarAsync<int?>(
            "SELECT BatchNum FROM dbo.Batch WHERE BatchId = @BatchId;",
            new { BatchId = batchId }) ?? 65;

        var timeStr = string.IsNullOrWhiteSpace(request.InspectionTime)
            ? DateTime.Now.ToString("HH:mm:ss")
            : request.InspectionTime;

        var sql = @"
            INSERT INTO dbo.BatchProductionLog (
                BatchId, BatchNumber, InspectionTime, ProductAmount, ProductSpeed, AGAmount, AGSpeed,
                DistillationTopTemp, ReactorPressure, AcidNumber, ProductDegree,
                CreatedDate, OperatorManualDate, IsSabt, Description
            ) VALUES (
                @BatchId, @BatchNumber, @InspectionTime, @ProductAmount, @ProductSpeed, @AGAmount, @AGSpeed,
                @DistillationTopTemp, @ReactorPressure, @AcidNumber, @ProductDegree,
                GETDATE(), GETDATE(), 1, @Description
            );
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        var newId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            BatchId = batchId,
            BatchNumber = batchNum.ToString(),
            InspectionTime = timeStr,
            ProductAmount = request.ProductAmount,
            ProductSpeed = request.ProductSpeed,
            AGAmount = request.AGAmount,
            AGSpeed = request.AGSpeed,
            DistillationTopTemp = request.DistillationTopTemp,
            ReactorPressure = request.ReactorPressure,
            AcidNumber = request.AcidNumber,
            ProductDegree = request.ProductDegree,
            Description = request.Description
        });

        _logger.LogInformation("رکورد با شناسه {NewId} در dbo.BatchProductionLog ثبت شد.", newId);
        return newId;
    }
}

