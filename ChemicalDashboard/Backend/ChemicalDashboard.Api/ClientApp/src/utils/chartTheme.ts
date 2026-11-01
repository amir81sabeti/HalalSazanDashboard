/**
 * ابزارها و استایل‌های مشترک چارت‌ها و نمودارهای داشبورد
 * تم صنعتی غنی با رنگ‌های زنده و تفکیک‌شده (Rich Colored Dark Glass)
 */

const PERSIAN_MONTHS = [
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
];

/**
 * تبدیل تاریخ شمسی (مانند ۱۴۰۴/۰۷/۰۱ یا 1404-07-01) به فرمت کوتاه و تمیز (مثلا "۰۱ مهر")
 */
export function formatChartDate(val: string): string {
  if (!val) return '';

  const clean = val.replace(/-/g, '/').trim();
  const parts = clean.split('/');

  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    if (!isNaN(day) && !isNaN(month) && month >= 1 && month <= 12) {
      const dayStr = day < 10 ? `۰${day}` : day.toLocaleString('fa-IR');
      return `${dayStr} ${PERSIAN_MONTHS[month - 1]}`;
    }
    return `${parts[1]}/${parts[2]}`;
  }

  // اگر ساعت است (مانند 14:30:00)
  if (clean.includes(':')) {
    const timeParts = clean.split(':');
    return `${timeParts[0]}:${timeParts[1]}`;
  }

  return val;
}

/**
 * محاسبه گام فاصله‌گذاری برچسب‌های محور افقی چارت جهت جلوگیری از روی هم افتادن
 */
export function getSparseInterval(total: number, targetTicks = 6): (index: number) => boolean {
  if (total <= targetTicks) {
    return () => true;
  }
  const step = Math.max(1, Math.ceil(total / targetTicks));
  return (index: number) => index % step === 0 || index === total - 1;
}

/**
 * تنظیمات تولتیپ دارک شیشه‌ای مدرن با کنتراست عالی
 */
export const richChartTooltip = {
  trigger: 'axis' as const,
  backgroundColor: 'rgba(10, 18, 36, 0.95)',
  borderColor: 'rgba(56, 189, 248, 0.5)',
  borderWidth: 1,
  padding: [8, 12],
  textStyle: {
    color: '#ffffff',
    fontFamily: 'BYekan',
    fontSize: 11,
  },
  axisPointer: {
    type: 'cross' as const,
    label: {
      backgroundColor: '#1e293b',
      fontFamily: 'BYekan',
      fontSize: 10,
    },
    lineStyle: {
      color: 'rgba(56, 189, 248, 0.6)',
      type: 'dashed' as const,
    },
  },
  extraCssText: 'backdrop-filter: blur(10px); box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.6); border-radius: 12px;',
};

/**
 * استایل خطوط گرید نرم و منقطع با وضوح ملایم
 */
export const richChartSplitLine = {
  lineStyle: {
    color: 'rgba(255, 255, 255, 0.08)',
    type: 'dashed' as const,
  },
};

/**
 * استایل خطوط محور
 */
export const richChartAxisLine = {
  lineStyle: {
    color: 'rgba(255, 255, 255, 0.18)',
  },
};

/**
 * فونت و رنگ روشن و خوانای برچسب‌های محورها
 */
export const richChartAxisLabel = {
  color: '#cbd5e1',
  fontFamily: 'BYekan',
  fontSize: 10,
};
