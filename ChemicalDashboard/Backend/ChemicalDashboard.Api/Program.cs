using ChemicalDashboard.Api.Middleware;
using ChemicalDashboard.Application;
using ChemicalDashboard.Infrastructure;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// ۱. ثبت سرویس‌ها در کانتینر تزریق وابستگی (Dependency Injection)
// =========================================================================

// ثبت کنترلرهای وب API جهت شناسایی کلیه اندپوینت‌ها
builder.Services.AddControllers();

// پیکربندی CORS برای اتصال امن فرانت‌اند در محیط توسعه
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// پیکربندی مستندسازی OpenAPI و رابط گرافیکی Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Chemical Dashboard API - سیستم پایش تولید اتیل استات",
        Version = "v1",
        Description = "API معماری پایه داشبورد صن عتی تولید اتیل استات (شامل اندپوینت‌های تستی دیتابیس و بررسی سلامت سرویس)"
    });
});

// ثبت سرویس‌های لایه اپلیکیشن (Application Layer)
builder.Services.AddApplicationServices();

// ثبت سرویس‌های لایه زیرساخت (Infrastructure Layer) شامل ارتباط با دیتابیس و ریپازیتوری‌ها
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

// =========================================================================
// ۲. پیکربندی پایپ‌لاین درخواست‌های HTTP (Middleware Pipeline)
// =========================================================================

// فعال‌سازی میدل‌ویر مدیریت متمرکز خطاها برای جلوگیری از افشای جزییات داخلی به کلاینت
app.UseMiddleware<ExceptionHandlingMiddleware>();

// فعال‌سازی رابط گرافیکی Swagger UI در محیط توسعه (Development)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Chemical Dashboard API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Chemical Dashboard API - Swagger UI";
        // نمایش زمان پاسخ هر درخواست و عمق مدل‌ها
        c.DisplayRequestDuration();
        c.DefaultModelsExpandDepth(1);
    });

    // باز کردن خودکار تب فرانت‌اند در کنار تب سواگر موقع استارت در ویژوال استودیو
    app.Lifetime.ApplicationStarted.Register(() =>
    {
        _ = Task.Run(async () =>
        {
            await Task.Delay(700);
            try
            {
                var baseUrl = app.Urls.FirstOrDefault(u => u.StartsWith("https://"))
                           ?? app.Urls.FirstOrDefault()
                           ?? "https://localhost:7061";

                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = baseUrl,
                    UseShellExecute = true
                });
            }
            catch
            {
                // نادیده گرفتن خطا در محیط‌های فاقد رابط گرافیکی
            }
        });
    });
}

// فعال‌سازی سرویس‌دهی فایل‌های استاتیک فرانت‌اند کامپایل شده در wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// فعال‌سازی سیاست CORS جهت برقراری ارتباط با رابط کاربری در محیط توسعه مستقل
app.UseCors("AllowFrontend");

// تغییر مسیر درخواست‌های HTTP به HTTPS (در محیط عملیاتی)
// app.UseHttpsRedirection();

// مسیریابی و نگاشت کنترلرها
app.MapControllers();

// هدایت تمام درخواست‌های غیر از API به صفحه اصلی فرانت‌اند (پشتیبانی کامل از React Router)
app.MapFallbackToFile("index.html");

// اجرای برنامه
app.Run();
