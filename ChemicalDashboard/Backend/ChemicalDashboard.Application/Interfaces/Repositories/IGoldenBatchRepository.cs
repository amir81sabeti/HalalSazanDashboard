using ChemicalDashboard.Contracts.GoldenBatch;

namespace ChemicalDashboard.Application.Interfaces.Repositories;

/// <summary>
/// اینترفیس ریپازیتوری دسترسی به داده‌های داشبورد بچ طلایی و رتبه‌بندی عملکرد رآکتور
/// </summary>
public interface IGoldenBatchRepository
{
    /// <summary>
    /// بازیابی داده‌های کامل تحلیلی بچ طلایی از طریق استورد پروسیجر dbo.sp_GetGoldenBatchAnalytics
    /// </summary>
    Task<GoldenBatchDashboardResponseDto> GetGoldenBatchAnalyticsAsync(
        int? reactorId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default);
}
