namespace ChemicalDashboard.Contracts.Chart;

/// <summary>
/// مدل فیلتر آبشاری بچ‌ها و راکتورها
/// </summary>
public sealed class BatchFilterItemDto
{
    public int BatchId { get; set; }
    public int BatchNumber { get; set; }
    public int ReactorId { get; set; }
    public int LogCount { get; set; }
    public DateTime? StartDate { get; set; }
    public string StartDateShamsi { get; set; } = string.Empty;
    public DateTime? EndDate { get; set; }
    public string EndDateShamsi { get; set; } = string.Empty;
}
