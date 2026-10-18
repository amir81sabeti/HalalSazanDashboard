using ChemicalDashboard.Contracts.Chart;
using ChemicalDashboard.Contracts.ExcelReport;

namespace ChemicalDashboard.Application.Interfaces.Services;

public interface IExcelReportService
{
    Task<ExcelTahmasbiSummaryDto> GetTahmasbiReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExcelMonthlyProductionItemDto>> GetMonthlyProductionReportAsync(ChartFilterRequestDto filter, int? year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExcelQualityStabilityItemDto>> GetQualityStabilityReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default);
    Task<ExcelBreakdownReportDto> GetBreakdownReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExcelReactorComparisonDto>> GetReactorComparisonReportAsync(int? year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExcelMassBalanceItemDto>> GetMassBalanceReportAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default);
    Task<ExcelRawLogsPagedResultDto> GetRawLogsAsync(ChartFilterRequestDto filter, string? search, int pageIndex, int pageSize, CancellationToken cancellationToken = default);
}
