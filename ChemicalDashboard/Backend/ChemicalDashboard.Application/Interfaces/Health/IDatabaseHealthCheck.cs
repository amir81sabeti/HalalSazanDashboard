using ChemicalDashboard.Contracts.Health;

namespace ChemicalDashboard.Application.Interfaces.Health;

/// <summary>
/// اینترفیس بررسی وضعیت سلامت و دسترس‌پذیری پایگاه داده
/// پیاده‌سازی این اینترفیس در لایه Infrastructure قرار دارد و صحت برقراری ارتباط با دیتابیس را ارزیابی می‌کند
/// </summary>
public interface IDatabaseHealthCheck
{
    /// <summary>
    /// بررسی اتصال به پایگاه داده بدون اجرای کوئری‌های سنگین یا افشای اطلاعات محرمانه
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>وضعیت سلامت ارتباط با پایگاه داده</returns>
    Task<HealthStatusResponseDto> CheckHealthAsync(CancellationToken cancellationToken = default);
}
