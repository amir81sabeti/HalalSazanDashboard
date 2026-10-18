using ChemicalDashboard.Contracts.GoldenBatch;

namespace ChemicalDashboard.Application.Interfaces.Services;

/// <summary>
/// سرویس بیزینس و منطق محاسباتی داشبورد بچ طلایی
/// </summary>
public interface IGoldenBatchService
{
    /// <summary>
    /// واکشی داده‌های تحلیل بچ طلایی و تبدیل تاریخ‌ها به شمسی
    /// </summary>
    Task<GoldenBatchDashboardResponseDto> GetGoldenBatchAnalyticsAsync(
        GoldenBatchFilterRequestDto filter,
        CancellationToken cancellationToken = default);
}
