namespace ChemicalDashboard.Contracts.Chart;

/// <summary>
/// مدل درخواست فیلتر نمودار فرآیند
/// </summary>
public sealed class ChartFilterRequestDto
{
    public int? ReactorId { get; set; }
    public int? BatchId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? FromDateShamsi { get; set; }
    public string? ToDateShamsi { get; set; }
}
