using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Health;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Infrastructure.Data;
using ChemicalDashboard.Infrastructure.Health;
using ChemicalDashboard.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChemicalDashboard.Infrastructure;

/// <summary>
/// متدهای الحاقی جهت ثبت سرویس‌های لایه زیرساخت (Infrastructure) در کانتینر DI برنامه
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// ثبت وابستگی‌های لایه زیرساخت شامل پایگاه داده، ریپازیتوری‌ها و سرویس سلامت
    /// </summary>
    /// <param name="services">کانتینر سرویس‌های دات‌نت</param>
    /// <param name="configuration">شیء پیکربندی برنامه جهت خواندن تنظیمات</param>
    /// <returns>کانتینر سرویس‌ها جهت ادامه زنجیره تنظیمات</returns>
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // کارخانه اتصال پایگاه داده به صورت Singleton ثبت می‌شود زیرا بدون وضعیت (Stateless) است و فقط وظیفه ساخت اتصال را دارد
        services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

        // ریپازیتوری‌های دسترسی به داده به صورت Scoped به ازای هر درخواست ثبت می‌شوند
        services.AddScoped<ITestRepository, TestRepository>();
        services.AddScoped<IProcessChartRepository, ProcessChartRepository>();

        // سرویس بررسی سلامت پایگاه داده به صورت Scoped
        services.AddScoped<IDatabaseHealthCheck, DatabaseHealthCheck>();

        return services;
    }
}
