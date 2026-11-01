using Microsoft.AspNetCore.SignalR;

namespace ChemicalDashboard.Api.Realtime;

/// <summary>
/// سرویس متمرکز ارسال پیام‌های بلادرنگ با SignalR به رابط کاربری
/// </summary>
public sealed class ProductionRealtimeNotifier : IProductionRealtimeNotifier
{
    private readonly IHubContext<ProductionHub> _hubContext;
    private readonly ILogger<ProductionRealtimeNotifier> _logger;

    public ProductionRealtimeNotifier(
        IHubContext<ProductionHub> hubContext,
        ILogger<ProductionRealtimeNotifier> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <summary>
    /// ارسال رویداد ورود داده جدید به تمام کلاینت‌ها (ایجاد نبض و نمایش توستر سبز)
    /// </summary>
    /// <param name="updateEvent">اطلاعات رویداد</param>
    /// <param name="cancellationToken">توکن لغو</param>
    public async Task BroadcastDataUpdateAsync(RealtimeUpdateEvent updateEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("ارسال رویداد بلادرنگ سیگنال‌آر: نوع {EventType}، پیام: {Message}",
            updateEvent.EventType, updateEvent.Message);

        // ارسال به کلیه کلاینت‌های متصل به هاب
        await _hubContext.Clients.All.SendAsync("ReceiveProductionUpdate", updateEvent, cancellationToken);
    }

    /// <summary>
    /// اعلان ورود ماده اولیه جهت فیلتر فوری و بازچینی بچ‌ها در سمت کلاینت
    /// </summary>
    /// <param name="materialName">نام ماده اضافه شده</param>
    /// <param name="reactorId">شناسه راکتور</param>
    /// <param name="batchId">شناسه بچ</param>
    /// <param name="cancellationToken">توکن لغو</param>
    public async Task NotifyMaterialEnteredAsync(string materialName, int? reactorId, int? batchId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("ورود ماده اولیه {MaterialName} در راکتور {ReactorId} و بچ {BatchId}",
            materialName, reactorId, batchId);

        var updateEvent = new RealtimeUpdateEvent
        {
            EventType = "MaterialEntered",
            Message = $"ماده اولیه {materialName} ثبت شد. فیلتر بچ‌ها بروزرسانی گردید.",
            ReactorId = reactorId,
            BatchId = batchId,
            Payload = new { MaterialName = materialName }
        };

        await _hubContext.Clients.All.SendAsync("ReceiveProductionUpdate", updateEvent, cancellationToken);
    }

    /// <summary>
    /// ارسال پالس تست ضربان قلب به کلاینت‌ها جهت تست زنده انیمیشن نبض نمودارها
    /// </summary>
    /// <param name="message">پیام پالس</param>
    /// <param name="cancellationToken">توکن لغو</param>
    public async Task BroadcastHeartbeatPulseAsync(string message = "دیتا بروز شد", CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("ارسال ضربان نبض زنده به نمودارها: {Message}", message);

        var heartbeatEvent = new RealtimeUpdateEvent
        {
            EventType = "HeartbeatPulse",
            Message = message,
            Timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients.All.SendAsync("ReceiveProductionUpdate", heartbeatEvent, cancellationToken);
    }
}
