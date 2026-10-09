namespace ChemicalDashboard.Contracts.Common;

/// <summary>
/// ساختار استاندارد و یکپارچه پاسخ‌های API برای ارسال نتیجه به فرانت‌اند و کلاینت‌ها
/// </summary>
/// <typeparam name="T">نوع داده موجود در بدنه پاسخ</typeparam>
public sealed class ApiResponse<T>
{
    /// <summary>
    /// وضعیت موفقیت‌آمیز بودن عملیات
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// پیام توضیحی فارسی برای کلاینت
    /// </summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// داده‌های برگشتی حاصل از عملیات در صورت وجود
    /// </summary>
    public T? Data { get; init; }

    /// <summary>
    /// زمان UTC تولید این پاسخ
    /// </summary>
    public DateTime TimestampUtc { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// ایجاد یک پاسخ موفقیت‌آمیز
    /// </summary>
    public static ApiResponse<T> Ok(T data, string message = "عملیات با موفقیت انجام شد.")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            TimestampUtc = DateTime.UtcNow
        };
    }

    /// <summary>
    /// ایجاد یک پاسخ خطای کنترل‌شده
    /// </summary>
    public static ApiResponse<T> Fail(string message, T? defaultData = default)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = defaultData,
            TimestampUtc = DateTime.UtcNow
        };
    }
}
