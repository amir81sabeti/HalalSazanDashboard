namespace ChemicalDashboard.Contracts.ExcelReport;

public sealed class ExcelTahmasbiSummaryDto
{
    public decimal TotalAlcoholLiter { get; set; }
    public decimal AvgAlcoholDegree { get; set; }
    public decimal TotalAcidKg { get; set; }
    public decimal TotalProductAmount { get; set; }
    public decimal AvgProductDegree { get; set; }
    public decimal TotalWaterAmount { get; set; }

    public decimal AcidInjectHours { get; set; }
    public decimal AlcoholInjectHours { get; set; }
    public decimal ProductHours { get; set; }
    public decimal WaterDrainHours { get; set; }
    public decimal NetProductionHours { get; set; }
    public decimal StopHours { get; set; }
    public decimal TotalProductionHours => NetProductionHours + StopHours;

    public decimal ProductEfficiency => NetProductionHours > 0 ? Math.Round((ProductHours / NetProductionHours) * 100m, 2) : 0m;
    public decimal WaterEfficiency => NetProductionHours > 0 ? Math.Round((WaterDrainHours / NetProductionHours) * 100m, 2) : 0m;
    public decimal ProductionEfficiency => TotalProductionHours > 0 ? Math.Round((NetProductionHours / TotalProductionHours) * 100m, 2) : 0m;

    public string AcidInjectHoursFormatted => FormatHoursToHMM(AcidInjectHours);
    public string AlcoholInjectHoursFormatted => FormatHoursToHMM(AlcoholInjectHours);
    public string ProductHoursFormatted => FormatHoursToHMM(ProductHours);
    public string WaterDrainHoursFormatted => FormatHoursToHMM(WaterDrainHours);
    public string NetProductionHoursFormatted => FormatHoursToHMM(NetProductionHours);
    public string StopHoursFormatted => FormatHoursToHMM(StopHours);
    public string TotalProductionHoursFormatted => FormatHoursToHMM(TotalProductionHours);

    public static string FormatHoursToHMM(decimal decimalHours)
    {
        if (decimalHours <= 0) return "0:00";
        long totalMinutes = (long)Math.Round(decimalHours * 60m, MidpointRounding.AwayFromZero);
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;
        return $"{hours}:{minutes:D2}";
    }

    public List<ExcelFlowRateItemDto> FlowRates { get; set; } = new();
}

public sealed class ExcelFlowRateItemDto
{
    public string Name { get; set; } = string.Empty;
    public decimal InOperationRate { get; set; }
    public decimal OverallRate { get; set; }
    public string Unit { get; set; } = "L/h";
}

public sealed class ExcelMonthlyProductionItemDto
{
    public string DateStr { get; set; } = string.Empty;
    public decimal DailyAmount { get; set; }
    public decimal CumulativeAmount { get; set; }
    public decimal SharePercent { get; set; }
}

public sealed class ExcelQualityStabilityItemDto
{
    public int Code { get; set; }
    public string RangeName { get; set; } = string.Empty;
    public decimal VolumeLiter { get; set; }
    public decimal VolumePercent { get; set; }
    public decimal Hours { get; set; }
    public decimal HoursPercent { get; set; }
    public decimal RatePerHour { get; set; }
}

public sealed class ExcelBreakdownMonthDto
{
    public int MonthNumber { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal ProductionHours { get; set; }
    public decimal StopHours { get; set; }
    public decimal AvailabilityPercent => (ProductionHours + StopHours) > 0 
        ? Math.Round((ProductionHours / (ProductionHours + StopHours)) * 100m, 2) 
        : 0m;
}

public sealed class ExcelStopReasonDto
{
    public string Reason { get; set; } = string.Empty;
    public decimal Hours { get; set; }
    public decimal Percent { get; set; }
}

public sealed class ExcelStopOccurrenceDto
{
    public string OccurrenceName { get; set; } = string.Empty;
    public decimal Hours { get; set; }
    public decimal Percent { get; set; }
}

public sealed class ExcelBreakdownKpiDto
{
    public decimal ProductionHours { get; set; }
    public decimal TotalStopHours { get; set; }
    public decimal InProcessStopHours { get; set; }
    public decimal StandbyStopHours { get; set; }
}

public sealed class ExcelBreakdownReportDto
{
    public decimal ProductionHours { get; set; }
    public decimal TotalStopHours { get; set; }
    public decimal InProcessStopHours { get; set; }
    public decimal StandbyStopHours { get; set; }
    public List<ExcelBreakdownMonthDto> MonthlyBreakdown { get; set; } = new();
    public List<ExcelStopReasonDto> StopReasons { get; set; } = new();
    public List<ExcelStopOccurrenceDto> OccurrenceTypes { get; set; } = new();
}

public sealed class ExcelReactorComparisonDto
{
    public int MonthNumber { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal Reactor3 { get; set; }
    public decimal Reactor4 { get; set; }
    public decimal Reactor36 { get; set; }
    public decimal Total { get; set; }
}

public sealed class ExcelMassBalanceItemDto
{
    public string Component { get; set; } = string.Empty;
    public decimal InputLiter { get; set; }
    public decimal OutputLiter { get; set; }
    public decimal RemainingLiter { get; set; }
    public decimal TheoreticalKg { get; set; }
    public decimal DeviationLiter { get; set; }
}

public sealed class ExcelRawLogItemDto
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public int BatchNum { get; set; }
    public int ReactorNum { get; set; }
    public string OperatorManualDateFA { get; set; } = string.Empty;
    public string DateStr { get; set; } = string.Empty;
    public string InspectionTime { get; set; } = string.Empty;

    // الکل ورودی
    public decimal AlcoholLiter { get; set; }
    public decimal AlcoholIn { get; set; }
    public decimal AlcoholDegree { get; set; }
    public decimal AlcoholDeg { get; set; }

    // اسید ورودی
    public decimal AcidKg { get; set; }
    public decimal AcidIn { get; set; }
    public string AcidUnit { get; set; } = "کیلوگرم";
    public decimal AcidNumber { get; set; }
    public decimal AcidNum { get; set; }

    // آیزوتروپ تزریقی
    public int InputAzeotropeType { get; set; }
    public decimal InputAzeotropeAmount { get; set; }

    // راکتور
    public decimal ReactorPressure { get; set; }
    public decimal ReactorPress { get; set; }
    public decimal ReactorLevel { get; set; }

    // بالای ستون تقطیر
    public decimal DistillationTopTemp { get; set; }
    public decimal DistilTopTemp { get; set; }
    public decimal DistillationTopPressure { get; set; }

    // روغن ورودی
    public decimal OilInputTemp { get; set; }
    public decimal OilInputPressure { get; set; }

    // آب کندانسور
    public decimal CondenserWaterTemp { get; set; }
    public decimal CondenserWaterPressure { get; set; }
    public decimal CondenserOutWaterTemp { get; set; }
    public decimal CondenserFluidTemp { get; set; }

    // ریفلاکس
    public decimal RefluxAmount { get; set; }
    public decimal RefluxFluidTemp { get; set; }

    // محصول (AZG)
    public decimal ProductSpeed { get; set; }
    public decimal ProductAmount { get; set; }
    public decimal ProductDegree { get; set; }
    public decimal ProductDeg { get; set; }

    // آبگیری (AG)
    public int OutputType { get; set; }
    public string OutputTypeTitle { get; set; } = "ایزوتروپ";
    public decimal AGSpeed { get; set; }
    public decimal AGAmount { get; set; }
    public decimal WaterOut { get; set; }

    // توضیحات و اپراتور
    public string Description { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string OperatorName { get; set; } = "اپراتور سیستم";
    public string CreatedDateStr { get; set; } = string.Empty;
    public string CreatedTimeStr { get; set; } = string.Empty;
}

public sealed class ExcelRawLogsPagedResultDto
{
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public List<ExcelRawLogItemDto> Items { get; set; } = new();
}
