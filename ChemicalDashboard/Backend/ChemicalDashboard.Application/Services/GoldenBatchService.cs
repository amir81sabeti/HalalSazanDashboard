using ChemicalDashboard.Application.Common;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.GoldenBatch;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Application.Services;

/// <summary>
/// پیاده‌سازی سرویس تحلیل بچ طلایی و عملکرد رآکتورها
/// </summary>
public sealed class GoldenBatchService : IGoldenBatchService
{
    private readonly IGoldenBatchRepository _repository;
    private readonly ILogger<GoldenBatchService> _logger;

    public GoldenBatchService(IGoldenBatchRepository repository, ILogger<GoldenBatchService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<GoldenBatchDashboardResponseDto> GetGoldenBatchAnalyticsAsync(
        GoldenBatchFilterRequestDto filter,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("درخواست تحلیل بچ طلایی برای رآکتور {ReactorId}", filter.ReactorId);

        // تبدیل تاریخ‌های فیلتر شمسی به میلادی
        DateTime? fromDate = PersianDateHelper.ToGregorianDateTime(filter.FromDateShamsi);
        DateTime? toDate = PersianDateHelper.ToGregorianDateTime(filter.ToDateShamsi);

        var result = await _repository.GetGoldenBatchAnalyticsAsync(filter.ReactorId, fromDate, toDate, cancellationToken);

        // غنی‌سازی با تاریخ‌های شمسی برای فرانت‌اند
        if (result.Summary != null)
        {
            result.Summary.GoldenStartDateShamsi = PersianDateHelper.ToShamsiDateString(result.Summary.GoldenStartDate);
            result.Summary.GoldenEndDateShamsi = PersianDateHelper.ToShamsiDateString(result.Summary.GoldenEndDate);
        }

        foreach (var batch in result.Batches)
        {
            batch.StartDateShamsi = PersianDateHelper.ToShamsiDateString(batch.StartDate);
            batch.EndDateShamsi = PersianDateHelper.ToShamsiDateString(batch.EndDate);

            batch.StatusCategory = batch.BatchRank switch
            {
                1 => "بچ طلایی (Golden Batch)",
                <= 3 => "عملکرد ممتاز (Top Tier)",
                _ when batch.PerformanceScore >= 80 => "استاندارد مطلوب (Good)",
                _ => "نیازمند بهینه‌سازی (Needs Review)"
            };
        }

        return result;
    }
}
