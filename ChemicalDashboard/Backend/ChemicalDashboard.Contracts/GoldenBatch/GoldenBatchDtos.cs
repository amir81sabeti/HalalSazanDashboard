namespace ChemicalDashboard.Contracts.GoldenBatch;

/// <summary>
/// پارامترهای فیلتر داشبورد بچ طلایی
/// </summary>
public sealed class GoldenBatchFilterRequestDto
{
    /// <summary>
    /// شناسه راکتور (۱ برای راکتور ۳، ۲ برای راکتور ۴)
    /// </summary>
    public int? ReactorId { get; set; }

    /// <summary>
    /// تاریخ شروع شمسی (مثال: 1404/01/01)
    /// </summary>
    public string? FromDateShamsi { get; set; }

    /// <summary>
    /// تاریخ پایان شمسی (مثال: 1404/12/29)
    /// </summary>
    public string? ToDateShamsi { get; set; }
}

/// <summary>
/// شاخص‌های کلیدی اجرایی داشبورد بچ طلایی
/// </summary>
public sealed class GoldenBatchExecutiveSummaryDto
{
    public int TotalBatches { get; set; }
    public double AvgCycleTimeHours { get; set; }
    public double AvgPurityDegree { get; set; }
    public double AvgAcidNumber { get; set; }
    public double TotalProductionAmount { get; set; }
    public double TotalDowntimeHours { get; set; }
    public double OverallAlcoholRatio { get; set; }
    public double QualityComplianceRate { get; set; }

    // مشخصات بچ طلایی دوره
    public int GoldenBatchId { get; set; }
    public int GoldenBatchNum { get; set; }
    public double GoldenScore { get; set; }
    public double GoldenPurity { get; set; }
    public double GoldenAN { get; set; }
    public double GoldenDurationHours { get; set; }
    public double GoldenProductAmount { get; set; }
    public DateTime? GoldenStartDate { get; set; }
    public DateTime? GoldenEndDate { get; set; }
    public string GoldenStartDateShamsi { get; set; } = string.Empty;
    public string GoldenEndDateShamsi { get; set; } = string.Empty;
}

/// <summary>
/// مدل رتبه‌بندی و مشخصات عملکردی هر بچ
/// </summary>
public sealed class BatchPerformanceItemDto
{
    public int BatchId { get; set; }
    public int BatchNum { get; set; }
    public int ReactorId { get; set; }
    public int ReactorNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string StartDateShamsi { get; set; } = string.Empty;
    public string EndDateShamsi { get; set; } = string.Empty;
    public double DurationHours { get; set; }
    public int LogCount { get; set; }
    public double TotalProductAmount { get; set; }
    public double TotalAlcoholIn { get; set; }
    public double TotalAcidIn { get; set; }
    public double AvgProductDegree { get; set; }
    public double AvgAcidNumber { get; set; }
    public double AvgTopTemp { get; set; }
    public double AvgOilTemp { get; set; }
    public double AvgReactorPressure { get; set; }
    public double AvgRefluxAmount { get; set; }
    public double TotalStopHours { get; set; }
    public int StopCount { get; set; }
    public double ProductionRatePerHour { get; set; }
    public double AlcoholConsumptionRatio { get; set; }
    public double UptimePercent { get; set; }
    public double PerformanceScore { get; set; }
    public int BatchRank { get; set; }
    public string StatusCategory { get; set; } = string.Empty;
}

/// <summary>
/// سهم انواع توقفات فرآیندی
/// </summary>
public sealed class GoldenBatchDowntimeItemDto
{
    public string OccurrenceName { get; set; } = string.Empty;
    public string StopTypeName { get; set; } = string.Empty;
    public int OccurrenceCount { get; set; }
    public double TotalHours { get; set; }
    public double PercentOfTotal { get; set; }
}

/// <summary>
/// مقایسه شاخص‌های ۶ گانه راداری بچ طلایی در برابر میانگین کارخانه
/// </summary>
public sealed class GoldenBatchRadarComparisonDto
{
    public int GoldenBatchNum { get; set; }
    public double GoldenPurity { get; set; }
    public double GoldenRate { get; set; }
    public double GoldenAcidConversionScore { get; set; }
    public double GoldenYieldScore { get; set; }
    public double GoldenUptimeScore { get; set; }

    public double PlantAvgPurity { get; set; }
    public double PlantAvgRate { get; set; }
    public double PlantAvgAcidConversionScore { get; set; }
    public double PlantAvgUptimeScore { get; set; }
}

/// <summary>
/// پاسخ کامل داشبورد تحلیلی بچ طلایی و عملکرد رآکتورها
/// </summary>
public sealed class GoldenBatchDashboardResponseDto
{
    public GoldenBatchExecutiveSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<BatchPerformanceItemDto> Batches { get; set; } = [];
    public IReadOnlyList<GoldenBatchDowntimeItemDto> DowntimeBreakdown { get; set; } = [];
    public GoldenBatchRadarComparisonDto RadarBaseline { get; set; } = new();
}
