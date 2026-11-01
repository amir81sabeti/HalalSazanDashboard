namespace ChemicalDashboard.Contracts.Chart;

/// <summary>
/// مدل درخواست ثبت لاگ جدید در خط تولید برای تست نبض زنده و ثبت فرآیند
/// </summary>
public sealed class InsertBatchLogRequestDto
{
    public int? BatchId { get; set; }
    public int? ReactorId { get; set; } = 1;
    public string? InspectionTime { get; set; }
    public decimal ProductSpeed { get; set; } = 4300;
    public decimal ProductAmount { get; set; } = 16000;
    public decimal AGSpeed { get; set; } = 350;
    public decimal AGAmount { get; set; } = 1100;
    public decimal DistillationTopTemp { get; set; } = 78.5m;
    public decimal ReactorPressure { get; set; } = 0.85m;
    public decimal AcidNumber { get; set; } = 0.26m;
    public decimal ProductDegree { get; set; } = 99.2m;
    public string Description { get; set; } = "ثبت تست ضربان زنده";
}
