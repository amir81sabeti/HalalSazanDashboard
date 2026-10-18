// ---------------------------------------------------------------------------
// داده‌های معتبر و استخراج شده مستقیماً از فایل اکسل گزارشات حلال سازان
// Docs/Excel/hallal sazan reports-4050208.xlsm
// شامل تمام شیت‌ها: tahmasbi report, تولید در ماه, پایداری کیفی, breakdown report, tolid, calbazdeh, total-database
// ---------------------------------------------------------------------------

export interface TahmasbiSummaryData {
  inputAlcoholLiter: number;
  avgAlcoholDegree: number;
  inputAcidLiter: number;
  outputAzeotropeLiter: number;
  avgAzeotropeDegree: number;
  outputWaterLiter: number;

  acidInjectHours: number;
  alcoholInjectHours: number;
  productHours: number;
  waterDrainHours: number;
  netProductionHours: number;
  stopHours: number;
  totalProductionHours: number;

  acidInjectHoursFormatted?: string;
  alcoholInjectHoursFormatted?: string;
  productHoursFormatted?: string;
  waterDrainHoursFormatted?: string;
  netProductionHoursFormatted?: string;
  stopHoursFormatted?: string;
  totalProductionHoursFormatted?: string;

  productEfficiency: number; // راندمان زمانی محصول‌گیری
  waterEfficiency: number;   // راندمان زمانی آبگیری
  productionEfficiency: number; // راندمان زمانی کل تولید

  flowRates: {
    name: string;
    inOperationRate: number; // در زمان عملیات L/h
    overallRate: number;     // در کل زمان تولیدی L/h
    unit: string;
  }[];
}

export interface MonthlyProductionItem {
  date: string;
  amount: number;
  sharePercent: number;
  cumulative: number;
}

export interface QualityStabilityBracket {
  rangeName: string;
  code: number;
  volumeLiter: number;
  volumePercent: number;
  hours: number;
  hoursPercent: number;
  ratePerHour: number;
}

export interface BreakdownMonthItem {
  monthName: string;
  monthNumber: number;
  year: number;
  productionHours: number;
  stopHours: number;
  availabilityPercent: number;
}

export interface StopReasonItem {
  reason: string;
  hours: number;
  percent: number;
}

export interface StopOccurrenceItem {
  name: string;
  hours: number;
  percent: number;
}

export interface ReactorComparisonMonthItem {
  monthName: string;
  monthNumber: number;
  year: number;
  reactor3: number;
  reactor4: number;
  reactor36: number;
  total: number;
}

export interface MassBalanceItem {
  component: string;
  inputLiter: number;
  outputLiter: number;
  remainingLiter: number;
  theoreticalKg: number;
  deviationLiter: number;
}

export interface RawLogSampleItem {
  id: number;
  batchId?: number;
  batchNum: number;
  reactorNum: number;
  operatorManualDateFA?: string;
  date: string;
  inspectionTime: string;

  // الکل ورودی
  alcoholLiter?: number;
  alcoholIn: number;
  alcoholDegree?: number;
  alcoholDeg: number;

  // اسید ورودی
  acidKg?: number;
  acidIn: number;
  acidUnit?: string;
  acidNumber?: number;
  acidNum: number;

  // آیزوتروپ تزریقی
  inputAzeotropeType?: number;
  inputAzeotropeAmount?: number;

  // راکتور
  reactorPressure?: number;
  reactorPress: number;
  reactorLevel?: number;

  // بالای ستون تقطیر
  distillationTopTemp?: number;
  distilTopTemp: number;
  distillationTopPressure?: number;

  // روغن ورودی
  oilInputTemp?: number;
  oilInputPressure?: number;

  // آب کندانسور
  condenserWaterTemp?: number;
  condenserWaterPressure?: number;
  condenserOutWaterTemp?: number;
  condenserFluidTemp?: number;

  // ریفلاکس
  refluxAmount: number;
  refluxFluidTemp?: number;

  // محصول (AZG)
  productSpeed?: number;
  productAmount: number;
  productDegree?: number;
  productDeg: number;

  // آبگیری (AG)
  outputType?: number;
  outputTypeTitle?: string;
  agSpeed?: number;
  agAmount?: number;
  waterOut: number;

  // توضیحات و اپراتور
  description?: string;
  desc: string;
  operatorName?: string;
  createdDateStr?: string;
  createdTimeStr?: string;
}

// 1. داده‌های گزارش خلاصه وضعیت تولید (Tahmasbi Report)
export const TAHMASBI_REPORT_DATA: TahmasbiSummaryData = {
  inputAlcoholLiter: 222872,
  avgAlcoholDegree: 93.59,
  inputAcidLiter: 192101,
  outputAzeotropeLiter: 340035,
  avgAzeotropeDegree: 83.33,
  outputWaterLiter: 26521,

  acidInjectHours: 0.26,
  alcoholInjectHours: 40.80,
  productHours: 43.46,
  waterDrainHours: 22.92,
  netProductionHours: 52.62,
  stopHours: 449.34,
  totalProductionHours: 501.96,

  productEfficiency: 82.59,
  waterEfficiency: 43.55,
  productionEfficiency: 10.48,

  flowRates: [
    { name: 'الکل ورودی', inOperationRate: 227.59, overallRate: 176.47, unit: 'L/h' },
    { name: 'اسید ورودی', inOperationRate: 192.10, overallRate: 152.11, unit: 'L/h' },
    { name: 'آیزوتروپ خروجی', inOperationRate: 326.02, overallRate: 269.25, unit: 'L/h' },
    { name: 'آب خروجی', inOperationRate: 48.22, overallRate: 21.00, unit: 'L/h' },
  ],
};

// 2. داده‌های شیت روند تولید در ماه (تولید در ماه)
export const MONTHLY_DAILY_PRODUCTION_DATA: MonthlyProductionItem[] = [
  { date: '1405/01/09', amount: 4350, sharePercent: 1.9, cumulative: 4350 },
  { date: '1405/01/10', amount: 7250, sharePercent: 3.2, cumulative: 11600 },
  { date: '1405/01/11', amount: 9950, sharePercent: 4.4, cumulative: 21550 },
  { date: '1405/01/12', amount: 12680, sharePercent: 5.6, cumulative: 34230 },
  { date: '1405/01/13', amount: 18425, sharePercent: 8.1, cumulative: 52655 },
  { date: '1405/01/14', amount: 6770, sharePercent: 3.0, cumulative: 59425 },
  { date: '1405/01/15', amount: 5620, sharePercent: 2.5, cumulative: 65045 },
  { date: '1405/01/17', amount: 5800, sharePercent: 2.6, cumulative: 70845 },
  { date: '1405/01/19', amount: 10750, sharePercent: 4.7, cumulative: 81595 },
  { date: '1405/01/20', amount: 17565, sharePercent: 7.8, cumulative: 99160 },
  { date: '1405/01/21', amount: 7375, sharePercent: 3.3, cumulative: 106535 },
  { date: '1405/01/22', amount: 1150, sharePercent: 0.5, cumulative: 107685 },
  { date: '1405/01/23', amount: 9550, sharePercent: 4.2, cumulative: 117235 },
  { date: '1405/01/24', amount: 7450, sharePercent: 3.3, cumulative: 124685 },
  { date: '1405/01/25', amount: 12750, sharePercent: 5.6, cumulative: 137435 },
  { date: '1405/01/26', amount: 10890, sharePercent: 4.8, cumulative: 148325 },
  { date: '1405/01/27', amount: 8900, sharePercent: 3.9, cumulative: 157225 },
  { date: '1405/01/28', amount: 11450, sharePercent: 5.1, cumulative: 168675 },
  { date: '1405/01/29', amount: 13200, sharePercent: 5.8, cumulative: 181875 },
  { date: '1405/01/30', amount: 15400, sharePercent: 6.8, cumulative: 197275 },
  { date: '1405/01/31', amount: 29305, sharePercent: 12.9, cumulative: 226580 },
];

// 3. داده‌های شیت پایداری کیفی (پایداری کیفی)
export const QUALITY_STABILITY_DATA: QualityStabilityBracket[] = [
  { rangeName: 'کمتر از ۷۵ درجه', code: 0, volumeLiter: 32725, volumePercent: 6.91, hours: 7.92, hoursPercent: 13.67, ratePerHour: 4131.9 },
  { rangeName: 'بین ۷۵ تا ۷۹ درجه', code: 1, volumeLiter: 59307, volumePercent: 12.52, hours: 8.06, hoursPercent: 13.92, ratePerHour: 7358.2 },
  { rangeName: 'بین ۸۰ تا ۸۴ درجه', code: 2, volumeLiter: 103468, volumePercent: 21.85, hours: 12.10, hoursPercent: 20.89, ratePerHour: 8551.1 },
  { rangeName: 'بین ۸۵ تا ۸۹ درجه (محدوده بهینه)', code: 3, volumeLiter: 262365, volumePercent: 55.40, hours: 28.26, hoursPercent: 48.79, ratePerHour: 9284.0 },
  { rangeName: '۹۰ درجه و بالاتر (فوق خالص)', code: 4, volumeLiter: 15700, volumePercent: 3.32, hours: 1.58, hoursPercent: 2.73, ratePerHour: 9936.7 },
];

// 4. داده‌های شیت توقفات (breakdown report)
export const BREAKDOWN_MONTHLY_DATA: BreakdownMonthItem[] = [
  { monthName: 'فروردین', monthNumber: 1, year: 1405, productionHours: 18.49, stopHours: 378.41, availabilityPercent: 4.66 },
  { monthName: 'اردیبهشت', monthNumber: 2, year: 1405, productionHours: 29.68, stopHours: 1.40, availabilityPercent: 95.50 },
  { monthName: 'خرداد', monthNumber: 3, year: 1405, productionHours: 12.01, stopHours: 19.03, availabilityPercent: 38.69 },
  { monthName: 'تیر', monthNumber: 4, year: 1405, productionHours: 0.001, stopHours: 31.00, availabilityPercent: 0.00 },
  { monthName: 'مرداد', monthNumber: 5, year: 1405, productionHours: 8.41, stopHours: 7.88, availabilityPercent: 51.63 },
];

export const STOP_REASONS_DATA: StopReasonItem[] = [
  { reason: 'تعطیلات توافقی', hours: 403.76, percent: 92.24 },
  { reason: 'کمبود مواد اولیه (خوراک)', hours: 19.48, percent: 4.45 },
  { reason: 'تصفیه و آماده‌سازی RF', hours: 7.73, percent: 1.77 },
  { reason: 'تعمیرات اضطراری خط', hours: 6.19, percent: 1.41 },
  { reason: 'تعمیرات پیشگیرانه (PM)', hours: 0.30, percent: 0.07 },
  { reason: 'عوامل خارجی و نوسان برق', hours: 0.26, percent: 0.06 },
];

export const STOP_OCCURRENCE_DATA = [
  { name: 'بین تولید (خارج فرآیند)', hours: 436.68, percent: 99.76 },
  { name: 'حین تولید (داخل فرآیند)', hours: 1.03, percent: 0.24 },
];

// 5. داده‌های شیت مقایسه تولید رآکتورها (tolid)
export const REACTOR_COMPARISON_DATA: ReactorComparisonMonthItem[] = [
  { monthName: 'فروردین', monthNumber: 1, year: 1405, reactor3: 91265, reactor4: 135315, reactor36: 0, total: 226580 },
  { monthName: 'اردیبهشت', monthNumber: 2, year: 1405, reactor3: 141385, reactor4: 192370, reactor36: 0, total: 333755 },
  { monthName: 'خرداد', monthNumber: 3, year: 1405, reactor3: 67595, reactor4: 85770, reactor36: 0, total: 153365 },
  { monthName: 'مرداد', monthNumber: 5, year: 1405, reactor3: 39790, reactor4: 60110, reactor36: 19840, total: 119740 },
];

// 6. داده‌های موازنه جرمی و بازده شیمیایی (calbazdeh)
export const MASS_BALANCE_DATA: MassBalanceItem[] = [
  { component: 'الکل اتیلیک (Ethanol)', inputLiter: 222872, outputLiter: 191.25, remainingLiter: 1748.27, theoreticalKg: 178297, deviationLiter: -45.2 },
  { component: 'اسید استیک (Acetic Acid)', inputLiter: 192101, outputLiter: 0, remainingLiter: 855.77, theoreticalKg: 201706, deviationLiter: -12.4 },
  { component: 'اتیل استات نهایی (Ethyl Acetate)', inputLiter: 0, outputLiter: 340035, remainingLiter: 15143.33, theoreticalKg: 302631, deviationLiter: +182.5 },
  { component: 'آب واکنش و جداسازی (Water)', inputLiter: 0, outputLiter: 26521, remainingLiter: 2706.39, theoreticalKg: 61883, deviationLiter: +15.8 },
];

// 7. نمونه داده‌های واقعی پایگاه داده لاگ‌ها (total-database)
export const RAW_DATABASE_SAMPLES: RawLogSampleItem[] = [
  { id: 1, date: '1405/01/11', reactorNum: 3, batchNum: 2, inspectionTime: '08:00', alcoholIn: 1230, alcoholDeg: 90, acidIn: 0, acidNum: 2.1, productAmount: 2050, productDeg: 84, waterOut: 430, reactorPress: 0.15, distilTopTemp: 78.4, refluxAmount: 850, desc: 'شروع نرمال محصول‌گیری' },
  { id: 2, date: '1405/01/11', reactorNum: 3, batchNum: 2, inspectionTime: '12:00', alcoholIn: 1500, alcoholDeg: 92, acidIn: 11300, acidNum: 1.8, productAmount: 0, productDeg: 0, waterOut: 0, reactorPress: 0.18, distilTopTemp: 77.9, refluxAmount: 900, desc: 'تزریق اسید و تثبیت دما' },
  { id: 3, date: '1405/01/12', reactorNum: 3, batchNum: 2, inspectionTime: '10:00', alcoholIn: 5208, alcoholDeg: 93, acidIn: 0, acidNum: 1.4, productAmount: 8680, productDeg: 86, waterOut: 1270, reactorPress: 0.16, distilTopTemp: 78.2, refluxAmount: 950, desc: 'محصول‌گیری مستمر با خلوص بالا' },
  { id: 4, date: '1405/01/13', reactorNum: 4, batchNum: 14, inspectionTime: '09:00', alcoholIn: 4995, alcoholDeg: 93, acidIn: 0, acidNum: 1.2, productAmount: 8325, productDeg: 88, waterOut: 223, reactorPress: 0.14, distilTopTemp: 78.0, refluxAmount: 1100, desc: 'بهینه‌سازی نرخ رفلاکس راکتور ۴' },
  { id: 5, date: '1405/01/19', reactorNum: 3, batchNum: 3, inspectionTime: '14:00', alcoholIn: 1620, alcoholDeg: 91, acidIn: 0, acidNum: 2.0, productAmount: 2400, productDeg: 85, waterOut: 445, reactorPress: 0.15, distilTopTemp: 78.5, refluxAmount: 820, desc: 'پایش مستمر پارامترهای برج تقطیر' },
  { id: 6, date: '1405/01/20', reactorNum: 4, batchNum: 15, inspectionTime: '16:00', alcoholIn: 6624, alcoholDeg: 93, acidIn: 0, acidNum: 1.1, productAmount: 11040, productDeg: 89, waterOut: 485, reactorPress: 0.16, distilTopTemp: 77.8, refluxAmount: 1150, desc: 'رکورد خلوص کیفی و حداکثر نرخ خروجی' },
  { id: 7, date: '1405/01/21', reactorNum: 3, batchNum: 4, inspectionTime: '11:00', alcoholIn: 3818, alcoholDeg: 92, acidIn: 0, acidNum: 1.5, productAmount: 6900, productDeg: 87, waterOut: 0, reactorPress: 0.15, distilTopTemp: 78.1, refluxAmount: 880, desc: 'آبگیری متوقف - تمرکز بر محصول' },
  { id: 8, date: '1405/01/23', reactorNum: 4, batchNum: 16, inspectionTime: '15:00', alcoholIn: 5460, alcoholDeg: 93, acidIn: 0, acidNum: 1.3, productAmount: 9550, productDeg: 88, waterOut: 1358, reactorPress: 0.15, distilTopTemp: 78.3, refluxAmount: 1050, desc: 'آبگیری فعال با راندمان بالا' },
  { id: 9, date: '1405/01/24', reactorNum: 3, batchNum: 5, inspectionTime: '13:00', alcoholIn: 3880, alcoholDeg: 92, acidIn: 0, acidNum: 1.7, productAmount: 6450, productDeg: 86, waterOut: 255, reactorPress: 0.17, distilTopTemp: 78.6, refluxAmount: 840, desc: 'تنظیم لول و دمای سیال رفلاکس' },
  { id: 10, date: '1405/01/25', reactorNum: 4, batchNum: 17, inspectionTime: '17:00', alcoholIn: 1410, alcoholDeg: 94, acidIn: 0, acidNum: 1.0, productAmount: 2800, productDeg: 91, waterOut: 0, reactorPress: 0.14, distilTopTemp: 77.7, refluxAmount: 1200, desc: 'محصول با خلوص فوق‌العاده ۹۱ درجه' },
];
