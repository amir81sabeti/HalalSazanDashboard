using System.Data.Common;
using ChemicalDashboard.Application.Interfaces.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Data;

/// <summary>
/// کارخانه ایجاد اتصالات پایگاه داده SQL Server
/// این کلاس مسئول خواندن ایمن رشته اتصال از تنظیمات و تولید اشیاء SqlConnection به صورت کوتاه‌مدت (Short-lived) است
/// </summary>
public sealed class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;
    private readonly ILogger<SqlConnectionFactory> _logger;

    /// <summary>
    /// سازنده کلاس کارخانه اتصال
    /// رشته اتصال از بخش ConnectionStrings:DefaultConnection خوانده می‌شود و هرگز هاردکد نمی‌شود
    /// </summary>
    /// <param name="configuration">ارائه‌دهنده پیکربندی برنامه</param>
    /// <param name="logger">ثبت رویدادها و خطاهای اتصال</param>
    public SqlConnectionFactory(IConfiguration configuration, ILogger<SqlConnectionFactory> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // دریافت رشته اتصال از کلید استاندار ConnectionStrings:DefaultConnection
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            _logger.LogCritical("رشته اتصال DefaultConnection در فایل‌های تنظیمات برنامه یافت نشد.");
            throw new InvalidOperationException("رشته اتصال پایگاه داده (ConnectionStrings:DefaultConnection) تنظیم نشده است.");
        }

        _connectionString = connectionString;
    }

    /// <summary>
    /// ایجاد و باز کردن اتصال ناهمگام به SQL Server
    /// نکته معماری: اتصالات به هیچ وجه در تمام طول عمر برنامه باز نگه داشته نمی‌شوند
    /// هر فراخوانی یک کانکشن جدید از Connection Pool دریافت کرده و پس از اتمام باید با using یا Dispose آزاد شود
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>یک شیء DbConnection باز شده و آماده اجرای دستورات</returns>
    public async Task<DbConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken = default)
    {
        var connection = new SqlConnection(_connectionString);

        try
        {
            await connection.OpenAsync(cancellationToken);
            return connection;
        }
        catch (Exception ex)
        {
            // بستن و آزادسازی فوری کانکشن در صورت بروز خطا در مرحله باز شدن
            await connection.DisposeAsync();
            _logger.LogError(ex, "خطا در برقراری ارتباط ناهمگام با پایگاه داده SQL Server.");
            throw;
        }
    }
}
