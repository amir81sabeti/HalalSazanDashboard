import { useQuery } from '@tanstack/react-query';
import type {
  KpiMetric,
  ProductionStatusInfo,
  ProductionLogRecord,
} from '@/types';

export interface DashboardDataset {
  kpis: KpiMetric[];
  statusInfo: ProductionStatusInfo;
  productionTrend: {
    dates: string[];
    azgRates: number[];
    agRates: number[];
    azgCumulative: number[];
    agCumulative: number[];
  };
  reactorComparison: {
    reactors: string[];
    azgTotal: number[];
    agTotal: number[];
  };
  processTemperature: {
    times: string[];
    reactorTemp: number[];
    columnTopTemp: number[];
    refluxTemp: number[];
  };
  processPressure: {
    times: string[];
    reactorPressure: number[];
    columnTopPressure: number[];
    condenserPressure: number[];
  };
  acidAndReflux: {
    times: string[];
    acidNumber: number[];
    refluxRatio: number[];
  };
  recentLogs: ProductionLogRecord[];
  productDistribution: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  batchSpeedAverages: {
    batchName: string;
    speed: number;
  }[];
}

/**
 * فیکسچرهای استاندارد داده‌های عملیاتی پایش خط تولید اتیل استات (مطابق اسکرین‌شات مرجع کارفرما)
 * این ساختار داده‌ای پس از آماده‌سازی پروسیجرهای sp_GetChemicalDashboardSummary در فاز ۳ به صورت کامل به دیتابیس متصل خواهد شد.
 */
const mockDashboardDataset: DashboardDataset = {
  kpis: [
    {
      id: 'kpi-azg-total',
      titleFa: 'مقدار کل محصول (AZG)',
      titleEn: 'Total Product',
      value: '482,350',
      unit: 'لیتر',
      trendPercentage: 12,
      trendDirection: 'up',
      trendLabel: 'نسبت به دوره قبل',
      colorScheme: 'amber',
      isVerifiedBackendMetric: false,
      definitionNote: 'فرمول محاسبه تجمعی در انتظار پروسیجر انبار محصول نهایی',
    },
    {
      id: 'kpi-ag-total',
      titleFa: 'مقدار کل آبگیری (AG)',
      titleEn: 'Water Removed',
      value: '28,460',
      unit: 'لیتر',
      trendPercentage: 8,
      trendDirection: 'up',
      trendLabel: 'نسبت به دوره قبل',
      colorScheme: 'blue',
      isVerifiedBackendMetric: false,
      definitionNote: 'فرمول محاسبه آبگیری از سپراتور آب در انتظار تایید سرپرست خط',
    },
    {
      id: 'kpi-degree-avg',
      titleFa: 'میانگین درجه محصول',
      titleEn: 'Product Concentration',
      value: '62.4',
      unit: '',
      trendPercentage: 1.2,
      trendDirection: 'up',
      trendLabel: 'نسبت به دوره قبل',
      colorScheme: 'green',
      isVerifiedBackendMetric: false,
      definitionNote: 'میانگین وزنی درجه خلوص آزمایشگاهی در بچ جاری',
    },
    {
      id: 'kpi-acid-number',
      titleFa: 'میانگین عدد اسیدی (AN)',
      titleEn: 'Acid Number',
      value: '0.32',
      unit: '',
      trendPercentage: -0.05,
      trendDirection: 'down',
      trendLabel: 'نسبت به دوره قبل',
      colorScheme: 'red',
      isVerifiedBackendMetric: false,
      definitionNote: 'عدد اسیدی اندازه گیری شده از تیتراسیون',
    },
    {
      id: 'kpi-log-count',
      titleFa: 'تعداد لاگ‌ها',
      titleEn: 'Production Logs',
      value: '156',
      unit: '',
      trendPercentage: 18,
      trendDirection: 'up',
      trendLabel: 'نسبت به دوره قبل',
      colorScheme: 'purple',
      isVerifiedBackendMetric: false,
      definitionNote: 'تعداد کل ثبت‌های بازرسی شیفت و اپراتورها',
    },
  ],
  statusInfo: {
    statusText: 'در حال تولید',
    isActive: true,
    currentBatch: 12,
    reactorNumber: 2,
    startTimeFa: '1404/03/15 08:00',
    elapsedHours: 36,
  },
  productionTrend: {
    dates: [
      '1404/01/01', '1404/01/08', '1404/01/15', '1404/01/22', '1404/01/29',
      '1404/02/06', '1404/02/13', '1404/02/20', '1404/02/27', '1404/03/05',
      '1404/03/12', '1404/03/19',
    ],
    azgRates: [1200, 9500, 6800, 8900, 7100, 6300, 7500, 8200, 7400, 9200, 8600, 9800],
    agRates: [350, 420, 510, 480, 490, 520, 410, 460, 430, 490, 530, 510],
    azgCumulative: [15000, 45000, 90000, 140000, 185000, 235000, 280000, 330000, 380000, 425000, 460000, 482350],
    agCumulative: [1200, 3100, 5800, 8900, 12000, 15100, 18200, 21300, 24000, 26100, 27500, 28460],
  },
  reactorComparison: {
    reactors: ['راکتور ۱', 'راکتور ۲', 'راکتور ۳', 'راکتور ۴'],
    azgTotal: [120000, 158000, 98000, 106000],
    agTotal: [8000, 9000, 6000, 5460],
  },
  processTemperature: {
    times: [
      '1404/01/01', '1404/01/08', '1404/01/15', '1404/01/22', '1404/01/29',
      '1404/02/06', '1404/02/13', '1404/02/20', '1404/02/27', '1404/03/05',
      '1404/03/12', '1404/03/19',
    ],
    reactorTemp: [88, 92, 90, 93, 89, 91, 94, 92, 90, 93, 91, 92],
    columnTopTemp: [72, 73, 71, 74, 73, 72, 73, 74, 72, 73, 71, 73],
    refluxTemp: [22, 24, 21, 23, 22, 25, 23, 22, 24, 23, 22, 23],
  },
  processPressure: {
    times: [
      '1404/01/01', '1404/01/08', '1404/01/15', '1404/01/22', '1404/01/29',
      '1404/02/06', '1404/02/13', '1404/02/20', '1404/02/27', '1404/03/05',
      '1404/03/12', '1404/03/19',
    ],
    reactorPressure: [1.4, 1.6, 1.5, 1.55, 1.48, 1.52, 1.62, 1.58, 1.49, 1.53, 1.55, 1.58],
    columnTopPressure: [2.0, 2.15, 2.05, 2.1, 2.02, 2.08, 2.18, 2.12, 2.04, 2.09, 2.11, 2.14],
    condenserPressure: [0.22, 0.25, 0.21, 0.24, 0.23, 0.26, 0.24, 0.22, 0.25, 0.23, 0.22, 0.24],
  },
  acidAndReflux: {
    times: [
      '1404/01/01', '1404/01/08', '1404/01/15', '1404/01/22', '1404/01/29',
      '1404/02/06', '1404/02/13', '1404/02/20', '1404/02/27', '1404/03/05',
      '1404/03/12', '1404/03/19',
    ],
    acidNumber: [0.35, 0.32, 0.38, 0.31, 0.29, 0.34, 0.30, 0.33, 0.28, 0.32, 0.29, 0.32],
    refluxRatio: [1.2, 1.4, 1.3, 1.5, 1.4, 1.35, 1.45, 1.4, 1.3, 1.42, 1.38, 1.4],
  },
  recentLogs: [
    {
      rowNumber: 1,
      dateFa: '1404/03/16',
      timeStr: '14:00',
      azgSpeed: 7650,
      agSpeed: 420,
      productDegree: 62,
      acidNumber: 0.28,
      status: 'عادی',
      operatorName: 'رضایی',
    },
    {
      rowNumber: 2,
      dateFa: '1404/03/16',
      timeStr: '12:00',
      azgSpeed: 9120,
      agSpeed: 510,
      productDegree: 63,
      acidNumber: 0.31,
      status: 'عادی',
      operatorName: 'محمدی',
    },
    {
      rowNumber: 3,
      dateFa: '1404/03/16',
      timeStr: '10:00',
      azgSpeed: 6430,
      agSpeed: 390,
      productDegree: 62,
      acidNumber: 0.27,
      status: 'عادی',
      operatorName: 'رضایی',
    },
    {
      rowNumber: 4,
      dateFa: '1404/03/16',
      timeStr: '08:00',
      azgSpeed: 8900,
      agSpeed: 480,
      productDegree: 61,
      acidNumber: 0.33,
      status: 'هشدار',
      operatorName: 'کریمی',
    },
    {
      rowNumber: 5,
      dateFa: '1404/03/15',
      timeStr: '16:00',
      azgSpeed: 7200,
      agSpeed: 410,
      productDegree: 62,
      acidNumber: 0.29,
      status: 'عادی',
      operatorName: 'محمدی',
    },
  ],
  productDistribution: [
    { name: 'آزئوتروپ', value: 20491, percentage: 72, color: '#3b82f6' },
    { name: 'آب', value: 5122, percentage: 18, color: '#06b6d4' },
    { name: 'اتانول', value: 1992, percentage: 7, color: '#f59e0b' },
    { name: 'سایر', value: 855, percentage: 3, color: '#64748b' },
  ],
  batchSpeedAverages: [
    { batchName: 'بچ ۱۲', speed: 8200 },
    { batchName: 'بچ ۱۱', speed: 7650 },
    { batchName: 'بچ ۱۰', speed: 6980 },
    { batchName: 'بچ ۹', speed: 7430 },
    { batchName: 'بچ ۸', speed: 6120 },
  ],
};

export function useDashboardData() {
  return useQuery<DashboardDataset>({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // شبیه‌سازی تاخیر طبیعی شبکه
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDashboardDataset);
        }, 150);
      });
    },
    staleTime: 60000,
  });
}
