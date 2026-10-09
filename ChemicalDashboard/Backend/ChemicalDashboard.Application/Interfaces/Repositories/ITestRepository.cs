using ChemicalDashboard.Contracts.Test;

namespace ChemicalDashboard.Application.Interfaces.Repositories;

/// <summary>
/// قرارداد دسترسی به داده‌های تستی از طریق استورد پروسیجرهای پایگاه داده
/// پیاده‌سازی این اینترفیس در لایه زیرساخت (Infrastructure) با استفاده از Dapper قرار می‌گیرد
/// </summary>
public interface ITestRepository
{
    /// <summary>
    /// فراخوانی استورد پروسیجر dbo.sp_SelectTest جهت دریافت کلیه رکوردهای جدول dbo.test
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>لیست رکوردهای خوانده‌شده از دیتابیس</returns>
    Task<IReadOnlyList<TestRecordResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// فراخوانی استورد پروسیجر dbo.sp_InsertTest جهت درج یک رکورد جدید
    /// </summary>
    /// <param name="name">نام (حداکثر ۱۰ کاراکتر)</param>
    /// <param name="age">سن (حداکثر ۵۰ کاراکتر)</param>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>آیا درج با موفقیت انجام شد یا خیر</returns>
    Task<bool> InsertAsync(string name, string age, CancellationToken cancellationToken = default);
}
