using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Chart;
using ChemicalDashboard.Contracts.Common;
using ChemicalDashboard.Contracts.ExcelReport;
using Microsoft.AspNetCore.Mvc;

namespace ChemicalDashboard.Api.Controllers;

/// <summary>
/// کنترلر گزارش‌گیری‌های اکسل خط تولید (محاسبه و دریافت مستقیم از پایگاه داده SQL Server)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class ExcelReportController : ControllerBase
{
    private readonly IExcelReportService _reportService;
    private readonly ILogger<ExcelReportController> _logger;

    public ExcelReportController(IExcelReportService reportService, ILogger<ExcelReportController> logger)
    {
        _reportService = reportService ?? throw new ArgumentNullException(nameof(reportService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// دریافت گزارش خلاصه وضعیت تولید (Tahmasbi Report) شامل راندمان‌ها و نرخ‌های جریان
    /// </summary>
    [HttpGet("tahmasbi-report")]
    [ProducesResponseType(typeof(ApiResponse<ExcelTahmasbiSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ExcelTahmasbiSummaryDto>>> GetTahmasbiReport(
        [FromQuery] ChartFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست گزارش خلاصه وضعیت طهماسبی برای رآکتور {ReactorId}", filter.ReactorId);
        var result = await _reportService.GetTahmasbiReportAsync(filter, cancellationToken);
        return Ok(ApiResponse<ExcelTahmasbiSummaryDto>.Ok(result, "گزارش خلاصه وضعیت تولید با موفقیت محاسبه شد."));
    }

    /// <summary>
    /// دریافت روند تولید در ماه به تفکیک روز و تولید تجمعی (Chart 2 اکسل)
    /// </summary>
    [HttpGet("monthly-production")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExcelMonthlyProductionItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ExcelMonthlyProductionItemDto>>>> GetMonthlyProduction(
        [FromQuery] ChartFilterRequestDto filter,
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست روند تولید در ماه برای رآکتور {ReactorId}", filter.ReactorId);
        var result = await _reportService.GetMonthlyProductionReportAsync(filter, year, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ExcelMonthlyProductionItemDto>>.Ok(result, "داده‌های تولید در ماه با موفقیت دریافت شد."));
    }

    /// <summary>
    /// دریافت گزارش پایداری کیفی سیستم در ۵ بازه خلوص استاندارد (Charts 3 & 4 اکسل)
    /// </summary>
    [HttpGet("quality-stability")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExcelQualityStabilityItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ExcelQualityStabilityItemDto>>>> GetQualityStability(
        [FromQuery] ChartFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست گزارش پایداری کیفی فرآیند");
        var result = await _reportService.GetQualityStabilityReportAsync(filter, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ExcelQualityStabilityItemDto>>.Ok(result, "گزارش پایداری کیفی سیستم با موفقیت واکشی شد."));
    }

    /// <summary>
    /// دریافت گزارش جامع توقفات و قابلیت اطمینان سیستم (Charts 6 & 9 اکسل)
    /// </summary>
    [HttpGet("breakdown")]
    [ProducesResponseType(typeof(ApiResponse<ExcelBreakdownReportDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ExcelBreakdownReportDto>>> GetBreakdownReport(
        [FromQuery] ChartFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست گزارش توقفات و قابلیت اطمینان خط");
        var result = await _reportService.GetBreakdownReportAsync(filter, cancellationToken);
        return Ok(ApiResponse<ExcelBreakdownReportDto>.Ok(result, "داده‌های گزارش توقفات با موفقیت بازیابی شد."));
    }

    /// <summary>
    /// دریافت مقایسه تولید ماهانه رآکتورها (Chart 1 اکسل)
    /// </summary>
    [HttpGet("reactor-comparison")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExcelReactorComparisonDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ExcelReactorComparisonDto>>>> GetReactorComparison(
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست مقایسه تولید رآکتورها برای سال {Year}", year);
        var result = await _reportService.GetReactorComparisonReportAsync(year, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ExcelReactorComparisonDto>>.Ok(result, "داده‌های مقایسه‌ای رآکتورها با موفقیت دریافت شد."));
    }

    /// <summary>
    /// دریافت موازنه جرمی استریفیکاسیون و انحرافات تئوری (شیت calbazdeh)
    /// </summary>
    [HttpGet("mass-balance")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExcelMassBalanceItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ExcelMassBalanceItemDto>>>> GetMassBalance(
        [FromQuery] ChartFilterRequestDto filter,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست موازنه جرم و بازده شیمیایی");
        var result = await _reportService.GetMassBalanceReportAsync(filter, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ExcelMassBalanceItemDto>>.Ok(result, "موازنه جرم فرآیند با موفقیت محاسبه شد."));
    }

    /// <summary>
    /// دریافت داده‌های لاگ‌های ثبت شده در پایگاه داده با جستجو و پیجینیشن (شیت total-database)
    /// </summary>
    [HttpGet("raw-logs")]
    [ProducesResponseType(typeof(ApiResponse<ExcelRawLogsPagedResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ExcelRawLogsPagedResultDto>>> GetRawLogs(
        [FromQuery] ChartFilterRequestDto filter,
        [FromQuery] string? search,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("درخواست لاگ‌های خام پایگاه داده - صفحه {PageIndex}", pageIndex);
        var result = await _reportService.GetRawLogsAsync(filter, search, pageIndex, pageSize, cancellationToken);
        return Ok(ApiResponse<ExcelRawLogsPagedResultDto>.Ok(result, $"تعداد {result.Items.Count} رکورد با موفقیت دریافت شد."));
    }
}
