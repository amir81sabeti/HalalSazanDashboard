using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Common;
using ChemicalDashboard.Contracts.GoldenBatch;
using Microsoft.AspNetCore.Mvc;

namespace ChemicalDashboard.Api.Controllers;

/// <summary>
/// کنترلر تحلیل هوشمند بچ طلایی، رتبه‌بندی عملکرد و راندمان رآکتورها
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class GoldenBatchController : ControllerBase
{
    private readonly IGoldenBatchService _goldenBatchService;
    private readonly ILogger<GoldenBatchController> _logger;

    public GoldenBatchController(IGoldenBatchService goldenBatchService, ILogger<GoldenBatchController> logger)
    {
        _goldenBatchService = goldenBatchService ?? throw new ArgumentNullException(nameof(goldenBatchService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// دریافت داده‌های کامل داشبورد تحلیلی بچ طلایی و رتبه‌بندی عملکرد رآکتورها
    /// </summary>
    /// <param name="filter">فیلترهای رآکتور و بازه زمانی شمسی</param>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>خلاصه شاخص‌ها، لیست رتبه‌بندی بچ‌ها، تحلیل توقفات و مقایسه راداری</returns>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(ApiResponse<GoldenBatchDashboardResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<GoldenBatchDashboardResponseDto>>> GetAnalytics(
        [FromQuery] GoldenBatchFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست داشبورد تحلیلی بچ طلایی با فیلتر رآکتور: {ReactorId}", filter.ReactorId);

        var result = await _goldenBatchService.GetGoldenBatchAnalyticsAsync(filter, cancellationToken);

        return Ok(ApiResponse<GoldenBatchDashboardResponseDto>.Ok(
            result,
            $"داده‌های تحلیلی {result.Batches.Count} بچ با موفقیت از پایگاه داده SQL Server محاسبه و بازیابی شد."
        ));
    }
}
