using System.Globalization;

namespace ChemicalDashboard.Application.Common;

/// <summary>
/// ابزار تبدیل دوطرفه تاریخ خورشیدی (شمسی) و میلادی
/// </summary>
public static class PersianDateHelper
{
    private static readonly PersianCalendar Pc = new();

    /// <summary>
    /// تبدیل DateTime میلادی به رشته استاندارد شمسی (1403/02/15)
    /// </summary>
    public static string ToShamsiDateString(DateTime? dateTime)
    {
        if (!dateTime.HasValue || dateTime.Value == DateTime.MinValue)
            return string.Empty;

        var dt = dateTime.Value;
        return $"{Pc.GetYear(dt):0000}/{Pc.GetMonth(dt):00}/{Pc.GetDayOfMonth(dt):00}";
    }

    /// <summary>
    /// تبدیل رشته تاریخ شمسی (1403/02/15 یا 1403-02-15) به DateTime میلادی
    /// </summary>
    public static DateTime? ToGregorianDateTime(string? shamsiString)
    {
        if (string.IsNullOrWhiteSpace(shamsiString))
            return null;

        var normalized = shamsiString.Trim().Replace('-', '/');
        var parts = normalized.Split('/');

        if (parts.Length != 3)
            return null;

        if (int.TryParse(parts[0], out var year) &&
            int.TryParse(parts[1], out var month) &&
            int.TryParse(parts[2], out var day))
        {
            try
            {
                return Pc.ToDateTime(year, month, day, 0, 0, 0, 0);
            }
            catch
            {
                return null;
            }
        }

        return null;
    }
}
