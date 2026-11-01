using Microsoft.AspNetCore.SignalR;

namespace ChemicalDashboard.Api.Realtime;

/// <summary>
/// هاب مرکزی سیگنال‌آر (SignalR Hub) جهت ارتباط زنده و بلادرنگ بین سرور و داشبوردها
/// وظیفه انتقال آنی تغییرات بچ‌ها، ورود مواد اولیه، ثبت لاگ‌های تولید و ایجاد نبض داده‌ها
/// </summary>
public sealed class ProductionHub : Hub
{
    private readonly ILogger<ProductionHub> _logger;

    public ProductionHub(ILogger<ProductionHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// رویداد اتصال کلاینت جدید به هاب سیگنال‌آر
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("کلاینت جدید با شناسه اتصال {ConnectionId} به هاب تولید متصل شد.", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// رویداد قطع اتصال کلاینت از هاب سیگنال‌آر
    /// </summary>
    /// <param name="exception">خطای احتمالی منجر به قطع اتصال</param>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("کلاینت با شناسه اتصال {ConnectionId} از هاب جدا شد. علت: {Message}",
            Context.ConnectionId, exception?.Message ?? "خروج عادی");
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// عضویت کلاینت در گروه اختصاصی یک راکتور خاص (جهت دریافت اختصاصی داده‌های آن راکتور)
    /// </summary>
    /// <param name="reactorId">شناسه راکتور مورد نظر</param>
    public async Task JoinReactorGroup(int reactorId)
    {
        var groupName = $"Reactor_{reactorId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("کلاینت {ConnectionId} به گروه {GroupName} اضافه شد.", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// خروج کلاینت از گروه اختصاصی یک راکتور
    /// </summary>
    /// <param name="reactorId">شناسه راکتور</param>
    public async Task LeaveReactorGroup(int reactorId)
    {
        var groupName = $"Reactor_{reactorId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("کلاینت {ConnectionId} از گروه {GroupName} خارج شد.", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// عضویت کلاینت در گروه اختصاصی یک بچ خاص
    /// </summary>
    /// <param name="batchId">شناسه بچ تولیدی</param>
    public async Task JoinBatchGroup(int batchId)
    {
        var groupName = $"Batch_{batchId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("کلاینت {ConnectionId} به گروه بچ {GroupName} پیوست.", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// ارسال دستی ضربان قلب (Heartbeat) از طرف کلاینت جهت تست اتصال دوطرفه
    /// </summary>
    public async Task PingHeartbeat()
    {
        await Clients.Caller.SendAsync("ReceiveHeartbeat", new
        {
            ServerTime = DateTime.UtcNow,
            Message = "پاسخ ضربان از سرور دات‌نت دریافت شد."
        });
    }
}
