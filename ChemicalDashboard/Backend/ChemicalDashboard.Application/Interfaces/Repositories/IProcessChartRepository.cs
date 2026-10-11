using ChemicalDashboard.Contracts.Chart;

namespace ChemicalDashboard.Application.Interfaces.Repositories;

/// <summary>
/// اینترفیس ریپازیتوری دریافت اطلاعات نمودارهای داینامیک فرآیند شیمی
/// </summary>
public interface IProcessChartRepository
{
    /// <summary>
    /// فراخوانی استورد پروسیجر dbo.sp_GetBatchesForFilter
    /// </summary>
    Task<IReadOnlyList<BatchFilterItemDto>> GetBatchesForFilterAsync(int? reactorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// فراخوانی استورد پروسیجر dbo.sp_GetDynamicChartData
    /// </summary>
    Task<IReadOnlyList<ProcessChartPointDto>> GetChartDataAsync(
        int? reactorId,
        int? batchId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default);
}
