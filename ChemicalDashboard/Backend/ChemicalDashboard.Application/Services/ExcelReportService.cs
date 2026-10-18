using ChemicalDashboard.Application.Common;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Chart;
using ChemicalDashboard.Contracts.ExcelReport;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Application.Services;

public sealed class ExcelReportService : IExcelReportService
{
    private readonly IExcelReportRepository _repository;
    private readonly ILogger<ExcelReportService> _logger;

    public ExcelReportService(IExcelReportRepository repository, ILogger<ExcelReportService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    private (DateTime? fromDate, DateTime? toDate) ResolveDates(ChartFilterRequestDto filter)
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

        return (fromDate, toDate);
    }

    public async Task<ExcelTahmasbiSummaryDto> GetTahmasbiReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default)
    {
        var (fromDate, toDate) = ResolveDates(filter);
        _logger.LogInformation("دریافت گزارش خلاصه طهماسبی از سرور: Reactor={Reactor}, Batch={Batch}, BatchIds={BatchIds}, BatchNumbers={BatchNumbers}, Year={Year}, Month={Month}",
            filter.ReactorId, filter.BatchId, filter.BatchIds, filter.BatchNumbers, filter.Year, filter.Month);

        var report = await _repository.GetTahmasbiReportAsync(
            filter.ReactorId, filter.BatchId, filter.BatchIds, filter.BatchNumbers, filter.Year, filter.Month, fromDate, toDate, cancellationToken);

        // محاسبه نرخ‌های جریان (L/h) مطابق فرمول‌های دقیق اکسل:
        decimal inOpAlcohol = report.AlcoholInjectHours > 0 ? Math.Round(report.TotalAlcoholLiter / report.AlcoholInjectHours, 2) : 0m;
        decimal overallAlcohol = report.NetProductionHours > 0 ? Math.Round(report.TotalAlcoholLiter / report.NetProductionHours, 2) : 0m;

        // در اکسل: IF(AcidInjectHours <= 1:00, TotalAcid, TotalAcid / AcidInjectHours)
        decimal inOpAcid = report.AcidInjectHours <= 1.0m 
            ? report.TotalAcidKg 
            : Math.Round(report.TotalAcidKg / report.AcidInjectHours, 2);
        decimal overallAcid = report.NetProductionHours > 0 ? Math.Round(report.TotalAcidKg / report.NetProductionHours, 2) : 0m;

        decimal inOpProd = report.ProductHours > 0 ? Math.Round(report.TotalProductAmount / report.ProductHours, 2) : 0m;
        decimal overallProd = report.NetProductionHours > 0 ? Math.Round(report.TotalProductAmount / report.NetProductionHours, 2) : 0m;

        decimal inOpWater = report.WaterDrainHours > 0 ? Math.Round(report.TotalWaterAmount / report.WaterDrainHours, 2) : 0m;
        decimal overallWater = report.NetProductionHours > 0 ? Math.Round(report.TotalWaterAmount / report.NetProductionHours, 2) : 0m;

        report.FlowRates = new List<ExcelFlowRateItemDto>
        {
            new() { Name = "الکل ورودی", InOperationRate = inOpAlcohol, OverallRate = overallAlcohol, Unit = "L/h" },
            new() { Name = "اسید ورودی", InOperationRate = inOpAcid, OverallRate = overallAcid, Unit = "L/h" },
            new() { Name = "آیزوتروپ خروجی", InOperationRate = inOpProd, OverallRate = overallProd, Unit = "L/h" },
            new() { Name = "آب خروجی", InOperationRate = inOpWater, OverallRate = overallWater, Unit = "L/h" }
        };

        return report;
    }

    public async Task<IReadOnlyList<ExcelMonthlyProductionItemDto>> GetMonthlyProductionReportAsync(ChartFilterRequestDto filter, int? year, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("دریافت گزارش تولید در ماه: Reactor={Reactor}, Batch={Batch}, Year={Year}", filter.ReactorId, filter.BatchId, year);
        return await _repository.GetMonthlyProductionReportAsync(filter.ReactorId, filter.BatchId, year, cancellationToken);
    }

    public async Task<IReadOnlyList<ExcelQualityStabilityItemDto>> GetQualityStabilityReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default)
    {
        var (fromDate, toDate) = ResolveDates(filter);
        _logger.LogInformation("دریافت گزارش پایداری کیفی: Reactor={Reactor}, Batch={Batch}", filter.ReactorId, filter.BatchId);
        return await _repository.GetQualityStabilityReportAsync(filter.ReactorId, filter.BatchId, fromDate, toDate, cancellationToken);
    }

    public async Task<ExcelBreakdownReportDto> GetBreakdownReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("دریافت گزارش توقفات: Reactor={Reactor}, Batch={Batch}, BatchIds={BatchIds}, BatchNumbers={BatchNumbers}, Year={Year}",
            filter.ReactorId, filter.BatchId, filter.BatchIds, filter.BatchNumbers, filter.Year);
        return await _repository.GetBreakdownReportAsync(filter.ReactorId, filter.BatchId, filter.BatchIds, filter.BatchNumbers, filter.Year, cancellationToken);
    }

    public async Task<IReadOnlyList<ExcelReactorComparisonDto>> GetReactorComparisonReportAsync(int? year, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("دریافت گزارش مقایسه رآکتورها: Year={Year}", year);
        return await _repository.GetReactorComparisonReportAsync(year, cancellationToken);
    }

    public async Task<IReadOnlyList<ExcelMassBalanceItemDto>> GetMassBalanceReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("دریافت موازنه جرم: Reactor={Reactor}, Batch={Batch}", filter.ReactorId, filter.BatchId);
        return await _repository.GetMassBalanceReportAsync(filter.ReactorId, filter.BatchId, cancellationToken);
    }

    public async Task<ExcelRawLogsPagedResultDto> GetRawLogsAsync(ChartFilterRequestDto filter, string? search, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("دریافت لاگ‌های خام پایگاه داده: PageIndex={PageIndex}, PageSize={PageSize}", pageIndex, pageSize);
        return await _repository.GetRawLogsAsync(filter.ReactorId, filter.BatchId, search, pageIndex, pageSize, cancellationToken);
    }
}
