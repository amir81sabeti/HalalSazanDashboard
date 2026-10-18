/**
 * ابزار کمکی استاندارد تبدیل، اعتبارسنجی و محاسبات تقویم شمسی (جلالی)
 */

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const PERSIAN_WEEK_DAYS = [
  { short: 'ش', full: 'شنبه' },
  { short: 'ی', full: 'یکشنبه' },
  { short: 'د', full: 'دوشنبه' },
  { short: 'س', full: 'سه‌شنبه' },
  { short: 'چ', full: 'چهارشنبه' },
  { short: 'پ', full: 'پنج‌شنبه' },
  { short: 'ج', full: 'جمعه' },
] as const;

/**
 * تبدیل ارقام انگلیسی یا عربی به ارقام فارسی
 */
export const toPersianDigits = (val: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(val).replace(/[0-9]/g, (w) => persianDigits[+w]);
};

/**
 * تبدیل ارقام فارسی یا عربی به ارقام انگلیسی
 */
export const toEnglishDigits = (val: string): string => {
  return val
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
};

/**
 * تبدیل رشته یا شیء تاریخ میلادی به رشته استاندارد شمسی (1404/01/29)
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
 * تبدیل رشته تاریخ شمسی به فرمت فارسی خوانا با نام ماه (مثلاً: ۲۹ فروردین ۱۴۰۴)
 */
export const formatToShamsiLong = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    // اگر فرمت شمسی YYYY/MM/DD بود
    const parsed = parseShamsiString(String(dateInput));
    if (parsed) {
      return `${toPersianDigits(parsed.day)} ${PERSIAN_MONTH_NAMES[parsed.month - 1]} ${toPersianDigits(parsed.year)}`;
    }
    return '';
  }

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
 * بررسی سال کبیسه شمسی (الگوریتم احمد بیرشک)
 */
export const isLeapJalaliYear = (year: number): boolean => {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  let jump = 0;
  for (let j = 1; j < breaks.length; j++) {
    const jm = breaks[j];
    jump = jm - jp;
    if (year < jm) break;
    jp = jm;
  }
  let n = year - jp;
  if (jump - n < 6) n = n - jump + (Math.floor((jump + 4) / 33) * 33);
  let leap = ((n + 1) % 33) - 1;
  if (leap === -1) leap = 4;
  return leap % 4 === 0;
};

/**
 * دریافت تعداد روزهای ماه شمسی (ماه ۱ تا ۱۲)
 */
export const getDaysInJalaliMonth = (year: number, month: number): number => {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  if (month === 12) return isLeapJalaliYear(year) ? 30 : 29;
  return 30;
};

/**
 * تبدیل تاریخ شمسی (1404/01/29) به شیء Date میلادی
 */
export const shamsiToGregorian = (shamsiStr: string): Date | null => {
  if (!shamsiStr || typeof shamsiStr !== 'string') return null;
  const normalized = toEnglishDigits(shamsiStr).replace(/-/g, '/');
  const parts = normalized.split('/').map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [jy, jm, jd] = parts;
  if (jy < 1300 || jy > 1500 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;

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

/**
 * تجزیه رشته شمسی به { year, month, day }
 */
export const parseShamsiString = (shamsiStr: string): { year: number; month: number; day: number } | null => {
  if (!shamsiStr) return null;
  const normalized = toEnglishDigits(shamsiStr).replace(/-/g, '/');
  const parts = normalized.split('/').map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [year, month, day] = parts;
  if (year < 1300 || year > 1500 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
};

/**
 * فرمت کردن سال، ماه، روز شمسی به رشته استاندارد YYYY/MM/DD
 */
export const formatJalaliDate = (year: number, month: number, day: number): string => {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}/${m}/${d}`;
};

/**
 * دریافت تاریخ امروز شمسی
 */
export const getTodayJalali = (): { year: number; month: number; day: number } => {
  const todayStr = formatToShamsi(new Date());
  const parsed = parseShamsiString(todayStr);
  if (parsed) return parsed;
  return { year: 1404, month: 1, day: 1 };
};

/**
 * دریافت اندیس روز هفته شروع ماه شمسی (۰ برای شنبه تا ۶ برای جمعه)
 */
export const getFirstDayOfWeekForMonth = (year: number, month: number): number => {
  const gDate = shamsiToGregorian(formatJalaliDate(year, month, 1));
  if (!gDate) return 0;
  const jsDay = gDate.getDay(); // 0 is Sunday, 6 is Saturday
  // شنبه: 0, یکشنبه: 1, ..., جمعه: 6
  return (jsDay + 1) % 7;
};
