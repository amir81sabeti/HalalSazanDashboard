using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Common;
using ChemicalDashboard.Contracts.Test;
using Microsoft.AspNetCore.Mvc;

namespace ChemicalDashboard.Api.Controllers;

/// <summary>
/// کنترلر مدیریت داده‌های آزمایشی (Test Records)
/// این کنترلر هیچ کوئری SQL یا منطق پایگاه داده مستقیمی ندارد و صرفاً درخواست‌های HTTP را هدایت می‌کند
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class TestController : ControllerBase
{
    private readonly ITestService _testService;
    private readonly ILogger<TestController> _logger;

    /// <summary>
    /// سازنده کنترلر با تزریق سرویس لایه Application از طریق کانتینر DI
    /// </summary>
    /// <param name="testService">سرویس عملیات تست</param>
    /// <param name="logger">ثبت وقایع کنترلر</param>
    public TestController(ITestService testService, ILogger<TestController> logger)
    {
        _testService = testService ?? throw new ArgumentNullException(nameof(testService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// دریافت کلیه رکوردهای آزمایشی موجود در جدول dbo.test
    /// این متد پروسیجر dbo.sp_SelectTest را از طریق لایه سرویس و ریپازیتوری فراخوانی می‌کند
    /// </summary>
    /// <param name="cancellationToken">توکن لغو درخواست کلاینت</param>
    /// <returns>لیست رکوردهای تستی در قالب استاندارد ApiResponse</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<TestRecordResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TestRecordResponseDto>>>> GetAll(CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست GET /api/test به کنترلر رسید.");

        var records = await _testService.GetAllRecordsAsync(cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<TestRecordResponseDto>>.Ok(
            records,
            $"تعداد {records.Count} رکورد با موفقیت دریافت شد."
        ));
    }

    /// <summary>
    /// ثبت یک رکورد آزمایشی جدید در جدول dbo.test
    /// این متد پروسیجر dbo.sp_InsertTest را پس از اعتبارسنجی مقادیر فراخوانی می‌کند
    /// </summary>
    /// <param name="request">مدل ورودی شامل فیلدهای Name و Age</param>
    /// <param name="cancellationToken">توکن لغو درخواست کلاینت</param>
    /// <returns>نتیجه ثبت رکورد</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> Create(
        [FromBody] CreateTestRecordRequestDto request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست POST /api/test با نام {Name} دریافت گردید.", request.Name);

        // اعتبارسنجی مدل اولیه به کمک DataAnnotations
        if (!ModelState.IsValid)
        {
            var firstError = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault() ?? "داده‌های ورودی نامعتبر هستند.";

            _logger.LogWarning("اعتبارسنجی فیلدهای ورودی POST /api/test ناموفق بود: {Error}", firstError);
            return BadRequest(ApiResponse<bool>.Fail(firstError, false));
        }

        var isSuccess = await _testService.CreateRecordAsync(request, cancellationToken);

        if (!isSuccess)
        {
            _logger.LogError("درج رکورد با شکست مواجه شد.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<bool>.Fail("عملیات درج در پایگاه داده انجام نشد.", false));
        }

        // برگرداندن کد وضعیت 201 Created به عنوان نتیجه موفقیت‌آمیز درج منبع جدید
        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<bool>.Ok(true, "رکورد آزمایشی با موفقیت در پایگاه داده ثبت شد."));
    }
}
