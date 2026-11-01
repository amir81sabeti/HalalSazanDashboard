using ChemicalDashboard.Api.Realtime;
using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Chart;
using ChemicalDashboard.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace ChemicalDashboard.Api.Controllers;

/// <summary>
/// مدل نتیجه وضعیت آخرین بچ فعال هر راکتور
/// </summary>
public sealed class ReactorLatestBatchDto
{
    public int ReactorId { get; set; }
    public string ReactorName { get; set; } = string.Empty;
    public int BatchId { get; set; }
    public int BatchNumber { get; set; }
    public bool IsActive { get; set; }
    public int LogCount { get; set; }
    public string StartDateShamsi { get; set; } = string.Empty;
    public string EndDateShamsi { get; set; } = string.Empty;
    public double? CurrentSpeed { get; set; }
    public double? CurrentAcidNumber { get; set; }
}

/// <summary>
/// مدل درخواست ثبت ماده اولیه
/// </summary>
public sealed class MaterialEntryRequestDto
{
    public string MaterialName { get; set; } = "الکل / اسید";
    public int ReactorId { get; set; } = 1;
    public int? BatchId { get; set; }
    public double QuantityKg { get; set; } = 1000;
}

/// <summary>
/// کنترلر مدیریت ارتباطات بلادرنگ (SignalR) و واکشی آخرین وضعیت بچ‌های فعال راکتورها
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class RealtimeController : ControllerBase
{
    private readonly IProductionRealtimeNotifier _notifier;
    private readonly IProcessChartService _chartService;
    private readonly ILogger<RealtimeController> _logger;

    public RealtimeController(
        IProductionRealtimeNotifier notifier,
        IProcessChartService chartService,
        ILogger<RealtimeController> logger)
    {
        _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
        _chartService = chartService ?? throw new ArgumentNullException(nameof(chartService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// ارسال پالس بلادرنگ سیگنال‌آر جهت تست انیمیشن ضربان قلب روی نمودارها و توستر سبز
    /// </summary>
    /// <param name="message">پیام سفارشی (اختیاری)</param>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    [HttpPost("pulse")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<string>>> TriggerHeartbeatPulse(
        [FromQuery] string message = "دیتا بروز شد",
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("ارسال دستی پالس ضربان نمودار با پیام: {Message}", message);

        await _notifier.BroadcastHeartbeatPulseAsync(message, cancellationToken);

        return Ok(ApiResponse<string>.Ok(message, "سیگنال ضربان و نبض نمودارها با موفقیت ارسال شد."));
    }

    /// <summary>
    /// شبیه‌سازی ورود ماده اولیه و ارسال سیگنال فوری به کلاینت‌ها جهت فیلتر و بازچینی خودکار بچ‌ها
    /// </summary>
    /// <param name="dto">اطلاعات ماده ورودی</param>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    [HttpPost("material-entry")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<string>>> SimulateMaterialEntry(
        [FromBody] MaterialEntryRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("شبیه‌سازی ورود ماده اولیه {MaterialName} در راکتور {ReactorId}", dto.MaterialName, dto.ReactorId);

        await _notifier.NotifyMaterialEnteredAsync(dto.MaterialName, dto.ReactorId, dto.BatchId, cancellationToken);

        return Ok(ApiResponse<string>.Ok(dto.MaterialName, $"سیگنال ورود ماده {dto.MaterialName} به کلاینت‌ها شلیک شد."));
    }

    /// <summary>
    /// واکشی اطلاعات آخرین بچ فعال هر راکتور (راکتور ۳ و راکتور ۴) جهت هدایت خودکار کاربر
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    [HttpGet("latest-active-batches")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ReactorLatestBatchDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReactorLatestBatchDto>>>> GetLatestActiveBatches(
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("واکشی آخرین بچ فعال راکتورها");

        // واکشی لیست کلیه بچ‌ها
        var allBatches = await _chartService.GetBatchesForFilterAsync(null, cancellationToken);

        var result = new List<ReactorLatestBatchDto>();

        // تفکیک بر اساس راکتورها (راکتور ۳ شناسه ۱، راکتور ۴ شناسه ۲)
        var reactors = new[]
        {
            new { Id = 1, Name = "راکتور ۳ (اصلی)" },
            new { Id = 2, Name = "راکتور ۴" }
        };

        foreach (var r in reactors)
        {
            var latest = allBatches
                .Where(b => b.ReactorId == r.Id)
                .OrderByDescending(b => b.BatchNumber)
                .FirstOrDefault();

            if (latest != null)
            {
                result.Add(new ReactorLatestBatchDto
                {
                    ReactorId = r.Id,
                    ReactorName = r.Name,
                    BatchId = latest.BatchId,
                    BatchNumber = latest.BatchNumber,
                    IsActive = latest.EndDate == null || string.IsNullOrWhiteSpace(latest.EndDateShamsi),
                    LogCount = latest.LogCount,
                    StartDateShamsi = latest.StartDateShamsi,
                    EndDateShamsi = latest.EndDateShamsi,
                    CurrentSpeed = 480.0,
                    CurrentAcidNumber = 0.31
                });
            }
            else
            {
                // در صورت نبود سابقه در دیتابیس تستی
                result.Add(new ReactorLatestBatchDto
                {
                    ReactorId = r.Id,
                    ReactorName = r.Name,
                    BatchId = 0,
                    BatchNumber = 0,
                    IsActive = false,
                    LogCount = 0,
                    StartDateShamsi = "-",
                    EndDateShamsi = "-"
                });
            }
        }

        return Ok(ApiResponse<IReadOnlyList<ReactorLatestBatchDto>>.Ok(result, "آخرین وضعیت بچ‌های فعال با موفقیت واکشی شد."));
    }
}
