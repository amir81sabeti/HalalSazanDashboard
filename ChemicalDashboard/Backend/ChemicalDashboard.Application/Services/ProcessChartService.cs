using ChemicalDashboard.Application.Common;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Chart;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Application.Services;

/// <summary>
/// پیاده‌سازی لایه سرویس نمودارهای داینامیک فرآیند
/// </summary>
public sealed class ProcessChartService : IProcessChartService
{
    private readonly IProcessChartRepository _chartRepository;
    private readonly ILogger<ProcessChartService> _logger;

    public ProcessChartService(IProcessChartRepository chartRepository, ILogger<ProcessChartService> logger)
    {
        _chartRepository = chartRepository ?? throw new ArgumentNullException(nameof(chartRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<IReadOnlyList<BatchFilterItemDto>> GetBatchesForFilterAsync(int? reactorId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("دریافت لیست بچ‌ها برای فیلتر با شناسه راکتور {ReactorId}", reactorId);
        var batches = await _chartRepository.GetBatchesForFilterAsync(reactorId, cancellationToken);

        foreach (var b in batches)
        {
            b.StartDateShamsi = PersianDateHelper.ToShamsiDateString(b.StartDate);
            b.EndDateShamsi = PersianDateHelper.ToShamsiDateString(b.EndDate);
        }

        return batches;
    }

    public async Task<IReadOnlyList<ProcessChartPointDto>> GetChartDataAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default)
    {
        var fromDate = filter.FromDate;
        if (!string.IsNullOrWhiteSpace(filter.FromDateShamsi))
        {
            fromDate = PersianDateHelper.ToGregorianDateTime(filter.FromDateShamsi) ?? fromDate;
        }

        var toDate = filter.ToDate;
        if (!string.IsNullOrWhiteSpace(filter.ToDateShamsi))
        {
            toDate = PersianDateHelper.ToGregorianDateTime(filter.ToDateShamsi) ?? toDate;
        }

        _logger.LogInformation("دریافت داده‌های نمودار داینامیک: ReactorId={ReactorId}, BatchId={BatchId}, FromDate={FromDate}, ToDate={ToDate}",
            filter.ReactorId, filter.BatchId, fromDate, toDate);

        var points = await _chartRepository.GetChartDataAsync(filter.ReactorId, filter.BatchId, fromDate, toDate, cancellationToken);

        foreach (var p in points)
        {
            p.LogDateShamsi = PersianDateHelper.ToShamsiDateString(p.LogDate);
        }

        return points;
    }
}
