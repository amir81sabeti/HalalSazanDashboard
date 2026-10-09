using System.ComponentModel.DataAnnotations;

namespace ChemicalDashboard.Contracts.Test;

/// <summary>
/// مدل انتقال داده (DTO) برای درخواست ثبت رکورد آزمایشی جدید
/// این کلاس ورودی‌های متناظر با پارامترهای پروسیجر dbo.sp_InsertTest را همراه با اعتبارسنجی فراهم می‌کند
/// </summary>
public sealed class CreateTestRecordRequestDto
{
    /// <summary>
    /// نام جهت درج در جدول (مطابق با پارامتر @Name NCHAR(10))
    /// </summary>
    [Required(ErrorMessage = "فیلد نام الزامی است.")]
    [StringLength(10, ErrorMessage = "طول فیلد نام نمی‌تواند بیشتر از ۱۰ کاراکتر باشد.")]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// سن جهت درج در جدول (مطابق با پارامتر @Age NVARCHAR(50))
    /// </summary>
    [Required(ErrorMessage = "فیلد سن الزامی است.")]
    [StringLength(50, ErrorMessage = "طول فیلد سن نمی‌تواند بیشتر از ۵۰ کاراکتر باشد.")]
    public string Age { get; init; } = string.Empty;
}
