using ChemicalDashboard.Contracts.ExcelReport;

namespace ChemicalDashboard.Application.Interfaces.Repositories;

public interface IExcelReportRepository
{
    Task<ExcelTahmasbiSummaryDto> GetTahmasbiReportAsync(
        int? reactorId, int? batchId, string? batchIds, string? batchNumbers, int? year, int? month, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ExcelMonthlyProductionItemDto>> GetMonthlyProductionReportAsync(
        int? reactorId, int? batchId, int? year, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ExcelQualityStabilityItemDto>> GetQualityStabilityReportAsync(
        int? reactorId, int? batchId, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);

    Task<ExcelBreakdownReportDto> GetBreakdownReportAsync(
        int? reactorId, int? batchId, string? batchIds, string? batchNumbers, int? year, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ExcelReactorComparisonDto>> GetReactorComparisonReportAsync(
        int? year, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ExcelMassBalanceItemDto>> GetMassBalanceReportAsync(
        int? reactorId, int? batchId, CancellationToken cancellationToken = default);

    Task<ExcelRawLogsPagedResultDto> GetRawLogsAsync(
        int? reactorId, int? batchId, string? search, int pageIndex, int pageSize, CancellationToken cancellationToken = default);
}
