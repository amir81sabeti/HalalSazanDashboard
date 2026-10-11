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
    private readonly ILogger<ChartController> _logger;

    public ChartController(IProcessChartService chartService, ILogger<ChartController> logger)
    {
        _chartService = chartService ?? throw new ArgumentNullException(nameof(chartService));
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
}
