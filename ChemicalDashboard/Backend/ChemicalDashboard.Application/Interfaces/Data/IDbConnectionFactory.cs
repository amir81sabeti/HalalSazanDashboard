using System.Data.Common;

namespace ChemicalDashboard.Application.Interfaces.Data;

/// <summary>
/// اینترفیس کارخانه ساخت اتصال به پایگاه داده (Connection Factory)
/// این انتزاع در لایه اپلیکیشن قرار دارد تا سرویس‌ها به پیاده‌سازی خاص پایگاه داده وابستگی مستقیم نداشته باشند
/// </summary>
public interface IDbConnectionFactory
{
    /// <summary>
    /// ایجاد و باز کردن ناهمگام (Async) یک اتصال معتبر به پایگاه داده SQL Server
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات ناهمگام</param>
    /// <returns>نمونه‌ای باز شده از شیء DbConnection که باید پس از اتمام کار Dispose شود</returns>
    Task<DbConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken = default);
}
