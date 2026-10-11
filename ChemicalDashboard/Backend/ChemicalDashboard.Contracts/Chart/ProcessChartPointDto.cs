namespace ChemicalDashboard.Contracts.Chart;

/// <summary>
/// مدل داده‌ای خروجی لاگ‌های فرآیند جهت نمایش در موتور نمودار داینامیک
/// این مدل دربرگیرنده تمام فیلدهای حرارتی، فشاری، جرمی و شیمیایی ثبت‌شده در دیتابیس است
/// </summary>
public sealed class ProcessChartPointDto
{
    public long Id { get; set; }
    public int BatchId { get; set; }
    public int BatchNumber { get; set; }
    public int ReactorId { get; set; }
    public string InspectionTime { get; set; } = string.Empty;
    public DateTime LogDate { get; set; }
    public string LogDateShamsi { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }

    // شاخص‌های تولید و محصول (AZG)
    public decimal ProductAmount { get; set; }
    public decimal ProductSpeed { get; set; }

    // شاخص‌های آبگیری (AG)
    public decimal AGAmount { get; set; }
    public decimal AGSpeed { get; set; }

    // دماها (°C)
    public decimal DistillationTopTemp { get; set; }
    public decimal OilInputTemp { get; set; }
    public decimal CondenserWaterTemp { get; set; }
    public decimal CondenserOutWaterTemp { get; set; }
    public decimal RefluxFluidTemp { get; set; }

    // فشارها (bar)
    public decimal ReactorPressure { get; set; }
    public decimal DistillationTopPressure { get; set; }
    public decimal OilInputPressure { get; set; }
    public decimal CondenserWaterPressure { get; set; }

    // پارامترهای شیمیایی و کیفی
    public decimal AcidNumber { get; set; }
    public decimal ProductDegree { get; set; }
    public decimal RefluxAmount { get; set; }
    public decimal ReactorLevel { get; set; }
    public decimal AlcoholLiter { get; set; }
    public decimal AlcoholDegree { get; set; }
    public decimal AcidKg { get; set; }

    public string OperatorName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
