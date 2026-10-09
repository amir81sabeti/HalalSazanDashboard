using ChemicalDashboard.Application.Interfaces.Health;
using ChemicalDashboard.Contracts.Common;
using ChemicalDashboard.Contracts.Health;
using Microsoft.AspNetCore.Mvc;

namespace ChemicalDashboard.Api.Controllers;

/// <summary>
/// کنترلر بررسی سلامت برنامه و دسترسی به پایگاه داده
/// این کنترلر اطلاعات حساسی نظیر رشته اتصال، نام سرور یا مشخصات پایگاه داده را هرگز افشا نمی‌کند
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class HealthController : ControllerBase
{
    private readonly IDatabaseHealthCheck _databaseHealthCheck;
    private readonly ILogger<HealthController> _logger;

    /// <summary>
    /// سازنده کنترلر سلامت
    /// </summary>
    public HealthController(IDatabaseHealthCheck databaseHealthCheck, ILogger<HealthController> logger)
    {
        _databaseHealthCheck = databaseHealthCheck ?? throw new ArgumentNullException(nameof(databaseHealthCheck));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// بررسی سریع و سبک سلامت سرویس API
    /// این اندپوینت روی هر درخواست کوئری دیتابیس اجرا نمی‌کند تا سربار اضافه ایجاد نشود
    /// </summary>
    /// <returns>وضعیت زنده بودن سرویس وب</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<HealthStatusResponseDto>), StatusCodes.Status200OK)]
    public ActionResult<ApiResponse<HealthStatusResponseDto>> GetApiHealth()
    {
        var health = new HealthStatusResponseDto
        {
            Status = "Healthy",
            Description = "سرویس وب ChemicalDashboard در وضعیت فعال و آماده پاسخ‌گویی است.",
            TimestampUtc = DateTime.UtcNow
        };

        return Ok(ApiResponse<HealthStatusResponseDto>.Ok(health, "سرویس فعال است."));
    }

    /// <summary>
    /// بررسی اختصاصی اتصال به پایگاه داده به صورت عندالمطالبه (On-Demand)
    /// </summary>
    /// <param name="cancellationToken">توکن لغو عملیات</param>
    /// <returns>وضعیت دسترسی به سرور SQL</returns>
    [HttpGet("database")]
    [ProducesResponseType(typeof(ApiResponse<HealthStatusResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HealthStatusResponseDto>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<ApiResponse<HealthStatusResponseDto>>> GetDatabaseHealth(CancellationToken cancellationToken)
    {
        _logger.LogInformation("درخواست بررسی اختصاصی سلامت پایگاه داده دریافت شد.");

        var dbHealth = await _databaseHealthCheck.CheckHealthAsync(cancellationToken);

        if (dbHealth.Status == "Healthy")
        {
            return Ok(ApiResponse<HealthStatusResponseDto>.Ok(dbHealth, "اتصال به پایگاه داده با موفقیت برقرار شد."));
        }

        return StatusCode(StatusCodes.Status503ServiceUnavailable,
            ApiResponse<HealthStatusResponseDto>.Fail(dbHealth.Description, dbHealth));
    }
}
