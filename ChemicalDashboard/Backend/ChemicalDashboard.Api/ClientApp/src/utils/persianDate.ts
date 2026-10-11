/**
 * ابزار کمکی استاندارد تبدیل و قالب‌بندی تاریخ‌های شمسی و میلادی
 */

/**
 * تبدیل رشته یا شیء تاریخ میلادی به رشته استاندارد شمسی (1403/06/15)
 */
export const formatToShamsi = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      calendar: 'persian',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date).replace(/\//g, '/');
  } catch {
    return '';
  }
};

/**
 * تبدیل رشته تاریخ شمسی به فرمت فارسی خوانا با نام ماه (مثلاً: ۱۵ شهریور ۱۴۰۵)
 */
export const formatToShamsiLong = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
};

/**
 * تبدیل تاریخ شمسی (1403/06/15) به شیء Date میلادی
 */
export const shamsiToGregorian = (shamsiStr: string): Date | null => {
  if (!shamsiStr || typeof shamsiStr !== 'string') return null;
  const parts = shamsiStr.replace(/-/g, '/').split('/').map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [jy, jm, jd] = parts;
  if (jy < 1300 || jy > 1500 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;

  // الگوریتم استاندارد تبدیل جلالی به میلادی
  let j_day_no = 365 * (jy - 979) + Math.floor((jy - 979) / 33) * 8 + Math.floor(((jy - 979) % 33 + 3) / 4);
  for (let i = 0; i < jm - 1; ++i) {
    j_day_no += i < 6 ? 31 : 30;
  }
  j_day_no += jd - 1;

  let g_day_no = j_day_no + 79;
  let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no %= 146097;

  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no %= 36524;
    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no %= 365;
  }

  const g_days_in_month = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (; gm < 12; ++gm) {
    if (g_day_no < g_days_in_month[gm]) break;
    g_day_no -= g_days_in_month[gm];
  }

  return new Date(gy, gm, g_day_no + 1, 12, 0, 0);
};
