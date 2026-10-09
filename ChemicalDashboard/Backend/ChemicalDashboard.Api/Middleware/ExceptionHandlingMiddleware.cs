using System.Net;
using System.Text.Json;
using ChemicalDashboard.Contracts.Common;

namespace ChemicalDashboard.Api.Middleware;

/// <summary>
/// میدل‌ویر مدیریت متمرکز خطاها (Centralized Exception Handling Middleware)
/// این میدل‌ویر کلیه خطاهای کنترل‌نشده در پایپ‌لاین HTTP را دریافت کرده، لاگ ثبت می‌کند
/// و یک پاسخ خطای استاندارد و امن به کاربر تحویل می‌دهد؛ بدون اینکه ساختار دیتابیس یا استک‌تریس افشا شود
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // ثبت لاگ دقیق خطا در لاگر سرور به همراه جزییات کامل
        _logger.LogError(exception, "یک خطای مدیریت‌نشده در حین پردازش درخواست رخ داد. مسیر: {Path}", context.Request.Path);

        context.Response.ContentType = "application/json";

        var statusCode = HttpStatusCode.InternalServerError;
        var clientMessage = "یک خطای پیش‌بینی نشده در سمت سرور رخ داد. لطفاً با مدیر سیستم تماس بگیرید.";

        // بررسی خطاهای اعتبارسنجی ورودی کاربر
        if (exception is ArgumentException or InvalidOperationException)
        {
            statusCode = HttpStatusCode.BadRequest;
            clientMessage = exception.Message;
        }
        else if (exception is OperationCanceledException)
        {
            statusCode = (HttpStatusCode)499; // Client Closed Request
            clientMessage = "عملیات توسط کاربر یا زمان‌بندی لغو گردید.";
        }

        context.Response.StatusCode = (int)statusCode;

        // ساخت شیء استاندارد پاسخ خطا بدون افشای جزییات محرمانه دیتابیس
        var errorResponse = ApiResponse<object>.Fail(clientMessage);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(errorResponse, jsonOptions);
        await context.Response.WriteAsync(json);
    }
}
