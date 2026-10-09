namespace ChemicalDashboard.Contracts.Health;

/// <summary>
/// مدل انتقال داده برای وضعیت سلامت سرویس و ارتباط با پایگاه داده
/// این مدل به دلایل امنیتی هیچ نام سرور، رشته اتصال یا اطلاعات حساسی را افشا نمی‌کند
/// </summary>
public sealed class HealthStatusResponseDto
{
    /// <summary>
    /// عنوان وضعیت (مانند Healthy یا Degraded)
    /// </summary>
    public string Status { get; init; } = "Healthy";

    /// <summary>
    /// توضیح فارسی از وضعیت فعلی سیستم یا پایگاه داده
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// زمان ثبت وضعیت سلامت به وقت UTC
    /// </summary>
    public DateTime TimestampUtc { get; init; } = DateTime.UtcNow;
}
