using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Health;
using ChemicalDashboard.Contracts.Health;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Health;

/// <summary>
/// پیاده‌سازی بررسی سلامت و اتصال به پایگاه داده به صورت عندالمطالبه (On-demand)
/// این کلاس فقط سلامت ارتباط فیزیکی و لاجیکال را تست می‌کند و هیچ اطلاعات حساسی مثل نام سرور یا رمزعبور افشا نمی‌کند
/// </summary>
public sealed class DatabaseHealthCheck : IDatabaseHealthCheck
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<DatabaseHealthCheck> _logger;

    /// <summary>
    /// سازنده سرویس بررسی سلامت اتصال به پایگاه داده
    /// </summary>
    public DatabaseHealthCheck(IDbConnectionFactory connectionFactory, ILogger<DatabaseHealthCheck> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// بررسی اتصال به پایگاه داده بدون اجرای کوئری‌های سنگین
    /// </summary>
    public async Task<HealthStatusResponseDto> CheckHealthAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("در حال بررسی برقراری ارتباط با سرور پایگاه داده...");

            // باز کردن و سپس بلافاصله بستن اتصال برای بررسی امکان تبادل داده
            await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

            _logger.LogInformation("ارتباط با سرور پایگاه داده برقرار و سالم است.");

            return new HealthStatusResponseDto
            {
                Status = "Healthy",
                Description = "ارتباط با پایگاه داده بدون مشکل برقرار است.",
                TimestampUtc = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            // لاگ کردن خطای کامل در کنسول/فایل سرور اما برگرداندن پیامی ایمن و بدون افشای جزییات محرمانه به کلاینت
            _logger.LogError(ex, "خطا در تست اتصال به پایگاه داده.");

            return new HealthStatusResponseDto
            {
                Status = "Unhealthy",
                Description = "امکان برقراری ارتباط با پایگاه داده وجود ندارد.",
                TimestampUtc = DateTime.UtcNow
            };
        }
    }
}
