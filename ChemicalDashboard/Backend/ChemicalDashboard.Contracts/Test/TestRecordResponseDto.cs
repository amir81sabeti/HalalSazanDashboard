namespace ChemicalDashboard.Contracts.Test;

/// <summary>
/// مدل انتقال داده (DTO) برای نمایش رکورد آزمایشی دریافتی از پایگاه داده
/// این کلاس متناظر با ستون‌های خروجی پروسیجر dbo.sp_SelectTest طراحی شده است
/// </summary>
public sealed class TestRecordResponseDto
{
    /// <summary>
    /// شناسه یکتای رکورد در جدول dbo.test
    /// </summary>
    public int Id { get; init; }

    /// <summary>
    /// نام ذخیره شده در رکورد (حداکثر ۱۰ کاراکتر بر اساس نوع داده NCHAR(10))
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// سن ذخیره شده در رکورد (حداکثر ۵۰ کاراکتر بر اساس نوع داده NVARCHAR(50))
    /// </summary>
    public string? Age { get; init; }
}
