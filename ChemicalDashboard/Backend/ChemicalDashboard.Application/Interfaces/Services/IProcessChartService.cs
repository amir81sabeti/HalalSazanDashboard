using ChemicalDashboard.Contracts.Chart;

namespace ChemicalDashboard.Application.Interfaces.Services;

/// <summary>
/// اینترفیس لایه سرویس نمودارهای داینامیک فرآیند
/// </summary>
public interface IProcessChartService
{
    Task<IReadOnlyList<BatchFilterItemDto>> GetBatchesForFilterAsync(int? reactorId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProcessChartPointDto>> GetChartDataAsync(ChartFilterRequestDto filter, CancellationToken cancellationToken = default);
}
