using ChemicalDashboard.Contracts.Test;

namespace ChemicalDashboard.Application.Interfaces.Services;

/// <summary>
/// سرویس منطق تجاری و مدیریت درخواست‌های آزمایشی
/// این لایه مسئولیت اعتبارسنجی منطقی ورودی‌ها و ارکستراسیون عملیات را بر عهده دارد
/// </summary>
public interface ITestService
{
    /// <summary>
    /// دریافت تمام رکوردهای آزمایشی موجود در دیتابیس
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>لیست رکوردهای آزمایشی تبدیل‌شده به مدل پاسخ</returns>
    Task<IReadOnlyList<TestRecordResponseDto>> GetAllRecordsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// ایجاد رکورد تستی جدید پس از بررسی و اعتبارسنجی فیلدها
    /// </summary>
    /// <param name="request">مدل ورودی شامل فیلدهای Name و Age</param>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>نتیجه موفقیت یا عدم موفقیت درج رکورد</returns>
    Task<bool> CreateRecordAsync(CreateTestRecordRequestDto request, CancellationToken cancellationToken = default);
}
