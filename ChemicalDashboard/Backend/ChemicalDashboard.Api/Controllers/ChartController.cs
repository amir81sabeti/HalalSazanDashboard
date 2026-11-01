using ChemicalDashboard.Api.Realtime;
using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Chart;
using ChemicalDashboard.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace ChemicalDashboard.Api.Controllers;

/// <summary>
/// کنترلر مدیریت داده‌های نمودارها و گزارشات فرآیند خط تولید (Process Charts)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class ChartController : ControllerBase
{
    private readonly IProcessChartService _chartService;
    private readonly IProductionRealtimeNotifier _notifier;
    private readonly ILogger<ChartController> _logger;

    public ChartController(
        IProcessChartService chartService,
        IProductionRealtimeNotifier notifier,
        ILogger<ChartController> logger)
    {
        _chartService = chartService ?? throw new ArgumentNullException(nameof(chartService));
        _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// دریافت لیست بچ‌ها به تفکیک راکتور جهت فیلتر آبشاری
    /// </summary>
    /// <param name="reactorId">شناسه راکتور (اختیاری - ۱ برای راکتور ۳، ۲ برای راکتور ۴)</param>
    /// <param name="cancellationToken">توکن لغو درخواست</param>
    [HttpGet("batches")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BatchFilterItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BatchFilterItemDto>>>> GetBatches(
        [FromQuery] int? reactorId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست لیست بچ‌ها برای راکتور {ReactorId}", reactorId);
        var batches = await _chartService.GetBatchesForFilterAsync(reactorId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<BatchFilterItemDto>>.Ok(batches, $"تعداد {batches.Count} بچ بازیابی شد."));
    }

    /// <summary>
    /// دریافت داده‌های جامع فرآیند خط تولید جهت رسم نمودار داینامیک
    /// </summary>
    /// <param name="filter">پارامترهای فیلتر شامل راکتور، بچ و بازه زمانی</param>
    /// <param name="cancellationToken">توکن لغو درخواست</param>
    [HttpGet("data")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ProcessChartPointDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProcessChartPointDto>>>> GetChartData(
        [FromQuery] ChartFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست داده‌های نمودار با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}, Shamsi={FromShamsi} to {ToShamsi}",
            filter.ReactorId, filter.BatchId, filter.FromDateShamsi, filter.ToDateShamsi);

        var data = await _chartService.GetChartDataAsync(filter, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ProcessChartPointDto>>.Ok(data, $"تعداد {data.Count} نقطه داده فرآیندی با موفقیت واکشی شد."));
    }

    /// <summary>
    /// دریافت خلاصه جامع داشبورد شامل شاخص‌ها، روندهای تولید، توقفات و آخرین وقایع
    /// </summary>
    /// <param name="filter">پارامترهای فیلتر (راکتور، بچ، بازه زمانی)</param>
    /// <param name="cancellationToken">توکن لغو درخواست</param>
    [HttpGet("dashboard-summary")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DashboardSummaryResponseDto>>> GetDashboardSummary(
        [FromQuery] ChartFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست خلاصه داشبورد با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}, Shamsi={FromShamsi} to {ToShamsi}",
            filter.ReactorId, filter.BatchId, filter.FromDateShamsi, filter.ToDateShamsi);

        var summary = await _chartService.GetDashboardSummaryAsync(filter, cancellationToken);
        return Ok(ApiResponse<DashboardSummaryResponseDto>.Ok(summary, "داده‌های خلاصه داشبورد با موفقیت دریافت شد."));
    }

    /// <summary>
    /// ثبت یک رکورد لاگ جدید در جدول dbo.BatchProductionLog و ارسال آنی سیگنال به تمام نمودارها
    /// </summary>
    /// <param name="request">مدل ورودی شامل شاخص‌های سرعت، دما، فشار و اسید</param>
    /// <param name="cancellationToken">توکن لغو درخواست</param>
    [HttpPost("log")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<int>>> CreateBatchLog(
        [FromBody] InsertBatchLogRequestDto request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست ثبت لاگ جدید در خط تولید برای راکتور {ReactorId}", request.ReactorId);

        var newId = await _chartService.InsertBatchLogAsync(request, cancellationToken);

        var reactorNum = request.ReactorId == 2 ? 4 : 3;

        // ارسال سیگنال فوری ضربان قلب به تمام کلاینت‌های متصل از طریق SignalR
        await _notifier.BroadcastDataUpdateAsync(new RealtimeUpdateEvent
        {
            EventType = "BATCH_LOG_INSERTED",
            Message = $"رکورد جدید با شناسه {newId} برای راکتور {reactorNum} در دیتابیس ثبت شد.",
            ReactorId = request.ReactorId,
            BatchId = request.BatchId,
            Timestamp = DateTime.UtcNow,
            Payload = new
            {
                LogId = newId,
                ProductSpeed = request.ProductSpeed,
                AcidNumber = request.AcidNumber,
                InspectionTime = request.InspectionTime
            }
        }, cancellationToken);

        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<int>.Ok(newId, $"رکورد جدید با شناسه {newId} با موفقیت در جدول پایگاه داده ثبت شد و سیگنال نبض به نمودارها شلیک گردید."));
    }
}
