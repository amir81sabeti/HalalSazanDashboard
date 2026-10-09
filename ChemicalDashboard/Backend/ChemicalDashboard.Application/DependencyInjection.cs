using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ChemicalDashboard.Application;

/// <summary>
/// متدهای الحاقی (Extension Methods) جهت ثبت سرویس‌های لایه Application در کانتینر DI
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// ثبت سرویس‌های لایه اپلیکیشن با طول عمر Scoped
    /// </summary>
    /// <param name="services">مجموعه سرویس‌های برنامه</param>
    /// <returns>مجموعه سرویس‌ها جهت زنجیره‌سازی</returns>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // ثبت سرویس تست با طول عمر Scoped (به ازای هر درخواست HTTP)
        services.AddScoped<ITestService, TestService>();

        return services;
    }
}
