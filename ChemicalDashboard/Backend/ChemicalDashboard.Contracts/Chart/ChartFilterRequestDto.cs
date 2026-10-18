namespace ChemicalDashboard.Contracts.Chart;

/// <summary>
/// مدل درخواست فیلتر نمودار فرآیند
/// </summary>
public sealed class ChartFilterRequestDto
{
    public int? ReactorId { get; set; }
    public int? BatchId { get; set; }
    public string? BatchIds { get; set; }
    public string? BatchNumbers { get; set; }
    public int? Year { get; set; }
    public int? Month { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? FromDateShamsi { get; set; }
    public string? ToDateShamsi { get; set; }
}
