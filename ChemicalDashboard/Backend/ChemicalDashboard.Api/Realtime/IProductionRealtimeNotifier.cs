namespace ChemicalDashboard.Api.Realtime;

/// <summary>
/// مدل انتقال داده برای رویدادهای زنده خط تولید
/// </summary>
public sealed class RealtimeUpdateEvent
{
    public string EventType { get; set; } = "DataUpdated";
    public string Message { get; set; } = "دیتا بروز شد";
    public int? ReactorId { get; set; }
    public int? BatchId { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public object? Payload { get; set; }
}

/// <summary>
/// اینترفیس ارسال پیام‌ها و نوتیفیکیشن‌های بلادرنگ از طریق سیگنال‌آر به کلاینت‌های داشبورد
/// </summary>
public interface IProductionRealtimeNotifier
{
    /// <summary>
    /// ارسال رویداد ورود داده جدید یا بروزرسانی به تمام کلاینت‌های متصل جهت ایجاد نبض در نمودارها
    /// </summary>
    /// <param name="updateEvent">مشخصات رویداد و داده‌های بروزرسانی</param>
    Task BroadcastDataUpdateAsync(RealtimeUpdateEvent updateEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// ارسال رویداد ورود یا تغییر مواد اولیه به تمام داشبوردها جهت فیلتر و بروزرسانی آنی بچ‌ها
    /// </summary>
    /// <param name="materialName">نام ماده اولیه</param>
    /// <param name="reactorId">شناسه راکتور</param>
    /// <param name="batchId">شناسه بچ مرتبط</param>
    Task NotifyMaterialEnteredAsync(string materialName, int? reactorId, int? batchId, CancellationToken cancellationToken = default);

    /// <summary>
    /// ارسال پالس ضربان قلب برای شبیه‌سازی و تست نبض زنده روی نمودارها
    /// </summary>
    /// <param name="message">پیام پالس ارسالی</param>
    Task BroadcastHeartbeatPulseAsync(string message = "نبض داده دریافت شد", CancellationToken cancellationToken = default);
}
