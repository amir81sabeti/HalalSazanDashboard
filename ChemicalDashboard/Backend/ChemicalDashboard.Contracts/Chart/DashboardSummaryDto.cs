namespace ChemicalDashboard.Contracts.Chart;

public sealed class DashboardSummaryResponseDto
{
    public KpiMetricsSummaryDto Kpis { get; set; } = new();
    public ProductionStatusSummaryDto StatusInfo { get; set; } = new();
    public IReadOnlyList<ChartSeriesPointDto> TrendPoints { get; set; } = [];
    public IReadOnlyList<RecentLogItemDto> RecentLogs { get; set; } = [];
    public IReadOnlyList<BatchSpeedItemDto> BatchSpeedAverages { get; set; } = [];
    public IReadOnlyList<ReactorComparisonItemDto> ReactorComparison { get; set; } = [];
}

public sealed class KpiMetricsSummaryDto
{
    public int LogCount { get; set; }
    public decimal TotalProductAmount { get; set; }
    public decimal TotalAGAmount { get; set; }
    public decimal AvgProductDegree { get; set; }
    public decimal AvgAcidNumber { get; set; }
}

public sealed class ProductionStatusSummaryDto
{
    public bool IsActive { get; set; }
    public int CurrentBatchNumber { get; set; }
    public int CurrentReactorNumber { get; set; }
    public string StartTimeShamsi { get; set; } = string.Empty;
    public double ElapsedHours { get; set; }
}

public sealed class ChartSeriesPointDto
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public int BatchNumber { get; set; }
    public int ReactorId { get; set; }
    public string InspectionTime { get; set; } = string.Empty;
    public DateTime LogDate { get; set; }
    public string LogDateShamsi { get; set; } = string.Empty;
    public decimal ProductAmount { get; set; }
    public decimal ProductSpeed { get; set; }
    public decimal AGAmount { get; set; }
    public decimal AGSpeed { get; set; }
    public decimal DistillationTopTemp { get; set; }
    public decimal OilInputTemp { get; set; }
    public decimal RefluxFluidTemp { get; set; }
    public decimal ReactorPressure { get; set; }
    public decimal DistillationTopPressure { get; set; }
    public decimal CondenserWaterPressure { get; set; }
    public decimal AcidNumber { get; set; }
    public decimal RefluxAmount { get; set; }
    public decimal ProductDegree { get; set; }
}

public sealed class RecentLogItemDto
{
    public int Id { get; set; }
    public string InspectionTime { get; set; } = string.Empty;
    public DateTime LogDate { get; set; }
    public string LogDateShamsi { get; set; } = string.Empty;
    public decimal ProductSpeed { get; set; }
    public decimal AGSpeed { get; set; }
    public decimal ProductDegree { get; set; }
    public decimal AcidNumber { get; set; }
    public string OperatorName { get; set; } = string.Empty;
}

public sealed class BatchSpeedItemDto
{
    public int BatchNum { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public decimal AvgSpeed { get; set; }
}

public sealed class ReactorComparisonItemDto
{
    public int ReactorId { get; set; }
    public string ReactorName { get; set; } = string.Empty;
    public decimal TotalProduct { get; set; }
    public decimal TotalWater { get; set; }
}
