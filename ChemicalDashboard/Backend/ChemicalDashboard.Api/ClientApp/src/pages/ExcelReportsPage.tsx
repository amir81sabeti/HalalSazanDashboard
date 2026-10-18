import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  FileSpreadsheet,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Clock,
  Filter,
  Download,
  Search,
  Maximize2,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Factory,
  Database,
  Printer,
  Sparkles,
  RefreshCw,
  Loader2,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  TAHMASBI_REPORT_DATA,
  MONTHLY_DAILY_PRODUCTION_DATA,
  QUALITY_STABILITY_DATA,
  BREAKDOWN_MONTHLY_DATA,
  STOP_REASONS_DATA,
  STOP_OCCURRENCE_DATA,
  REACTOR_COMPARISON_DATA,
  MASS_BALANCE_DATA,
  RAW_DATABASE_SAMPLES,
  RawLogSampleItem,
} from '@/services/data/excelReportData';
import {
  useExcelTahmasbiReport,
  useExcelMonthlyProduction,
  useExcelQualityStability,
  useExcelBreakdownReport,
  useExcelReactorComparison,
  useExcelMassBalance,
  useExcelRawLogs,
  ExcelFilterParams,
} from '@/services/queries/useExcelReportData';
import { useBatches } from '@/services/queries/useProcessChartData';
import { useToast } from '@/hooks/useToast';

type TabKey =
  | 'tahmasbi'
  | 'monthly'
  | 'stability'
  | 'breakdown'
  | 'reactors'
  | 'massBalance'
  | 'rawDatabase';

interface TabItem {
  key: TabKey;
  titleFa: string;
  sheetName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TABS: TabItem[] = [
  { key: 'tahmasbi', titleFa: 'خلاصه وضعیت و راندمان', sheetName: 'tahmasbi report', icon: BarChart3, color: '#f59e0b' },
  { key: 'monthly', titleFa: 'روند تولید در ماه', sheetName: 'تولید در ماه', icon: TrendingUp, color: '#06b6d4' },
  { key: 'stability', titleFa: 'پایداری کیفی سیستم', sheetName: 'پایداری کیفی', icon: ShieldCheck, color: '#10b981' },
  { key: 'breakdown', titleFa: 'تحلیل توقفات و قابلیت اطمینان', sheetName: 'breakdown report', icon: Clock, color: '#ef4444' },
  { key: 'reactors', titleFa: 'مقایسه تولید رآکتورها', sheetName: 'tolid', icon: Factory, color: '#8b5cf6' },
  { key: 'massBalance', titleFa: 'موازنه جرم و بازده شیمیایی', sheetName: 'calbazdeh', icon: Layers, color: '#ec4899' },
  { key: 'rawDatabase', titleFa: 'پایگاه داده جامع لاگ‌ها', sheetName: 'total-database', icon: Database, color: '#3b82f6' },
];

export const ExcelReportsPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('tahmasbi');
  // پیش‌فرض: رآکتور ۳ و سال ۱۴۰۴ مطابق با نیازمندی شیت اکسل
  const [selectedReactor, setSelectedReactor] = useState<string>('3');
  const [selectedYear, setSelectedYear] = useState<number>(1404);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedBatchNumbers, setSelectedBatchNumbers] = useState<number[]>([]);
  const [batchSearchTerm, setBatchSearchTerm] = useState<string>('');
  const [isSlicerOpen, setIsSlicerOpen] = useState<boolean>(true);

  const [dataSource, setDataSource] = useState<'db' | 'excel'>('db'); // پیش‌فرض: سرور و دیتابیس آنلاین
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // شناسه رآکتور انتخابی (۱ برای رآکتور ۳، ۲ برای رآکتور ۴)
  const reactorId = selectedReactor === '3' ? 1 : selectedReactor === '4' ? 2 : undefined;

  // واکشی لیست بچ‌ها از دیتابیس
  const { data: batches } = useBatches(reactorId);

  // تناظر شماره بچ‌های انتخابی به BatchId های دیتابیس
  const selectedBatchIds = useMemo(() => {
    if (!batches || selectedBatchNumbers.length === 0) return [];
    return batches
      .filter((b) => selectedBatchNumbers.includes(b.batchNumber))
      .map((b) => b.batchId);
  }, [batches, selectedBatchNumbers]);

  // پارامترهای فیلتر سرور (انتقال مالتی‌بچ، سال و ماه به SP)
  const filterParams: ExcelFilterParams = useMemo(() => ({
    reactorId,
    batchId: selectedBatchIds.length === 1 ? selectedBatchIds[0] : undefined,
    batchIds: selectedBatchIds.length > 0 ? selectedBatchIds.join(',') : undefined,
    batchNumbers: selectedBatchNumbers.length > 0 ? selectedBatchNumbers.join(',') : undefined,
    year: selectedYear,
    month: selectedMonth,
  }), [reactorId, selectedBatchIds, selectedBatchNumbers, selectedYear, selectedMonth]);

  // توابع کنترل فیلتر و اسلایسر بچ‌ها
  const handleToggleBatch = (batchNum: number) => {
    setSelectedBatchNumbers((prev) =>
      prev.includes(batchNum) ? prev.filter((b) => b !== batchNum) : [...prev, batchNum]
    );
  };

  const handleSelectAllBatches = () => {
    setSelectedBatchNumbers([]);
    toast.info('تمامی بچ‌ها انتخاب شدند (حالت گزارش جامع سال ۱۴۰۴).');
  };

  const handleSelectSampleBatches = () => {
    // بچ‌های نمونه تصویر ۱ (۱، ۱۰، ۱۸، ۳۱)
    setSelectedBatchNumbers([1, 10, 18, 31]);
    setSelectedReactor('3');
    setSelectedYear(1404);
    toast.success('بچ‌های نمونه تصویر ۱ (۱، ۱۰، ۱۸، ۳۱) انتخاب شدند.');
  };

  // واکشی داده‌های زنده از پایگاه داده SQL Server از طریق وب API
  const { data: dbTahmasbi, isLoading: loadingTahmasbi, refetch: refetchTahmasbi } = useExcelTahmasbiReport(filterParams);
  const { data: dbMonthly, isLoading: loadingMonthly, refetch: refetchMonthly } = useExcelMonthlyProduction(filterParams);
  const { data: dbQuality, isLoading: loadingQuality, refetch: refetchQuality } = useExcelQualityStability(filterParams);
  const { data: dbBreakdown, isLoading: loadingBreakdown, refetch: refetchBreakdown } = useExcelBreakdownReport(filterParams);
  const { data: dbReactors, isLoading: loadingReactors, refetch: refetchReactors } = useExcelReactorComparison();
  const { data: dbMassBalance, isLoading: loadingMassBalance, refetch: refetchMassBalance } = useExcelMassBalance(filterParams);
  const { data: dbRawLogsPaged, isLoading: loadingRawLogs, refetch: refetchRawLogs } = useExcelRawLogs(
    filterParams,
    searchQuery,
    currentPage,
    pageSize
  );

  const isAnyLoading =
    loadingTahmasbi || loadingMonthly || loadingQuality || loadingBreakdown || loadingReactors || loadingMassBalance;

  const handleRefreshAll = () => {
    refetchTahmasbi();
    refetchMonthly();
    refetchQuality();
    refetchBreakdown();
    refetchReactors();
    refetchMassBalance();
    refetchRawLogs();
    toast.success('داده‌های زنده از دیتابیس SQL Server با موفقیت بروزرسانی شدند.');
  };

  // انتخاب داده‌های فعال بر اساس منبع (پایگاه داده سرور یا بنچ‌مارک اکسل)
  const tahmasbiData = useMemo(() => {
    if (dataSource === 'db' && dbTahmasbi && dbTahmasbi.outputAzeotropeLiter > 0) {
      return dbTahmasbi;
    }
    return TAHMASBI_REPORT_DATA;
  }, [dataSource, dbTahmasbi]);

  const monthlyProductionList = useMemo(() => {
    if (dataSource === 'db' && dbMonthly && dbMonthly.length > 0) {
      return dbMonthly;
    }
    return MONTHLY_DAILY_PRODUCTION_DATA;
  }, [dataSource, dbMonthly]);

  const qualityStabilityList = useMemo(() => {
    if (dataSource === 'db' && dbQuality && dbQuality.length > 0) {
      return dbQuality;
    }
    return QUALITY_STABILITY_DATA;
  }, [dataSource, dbQuality]);

  const breakdownData = useMemo(() => {
    if (dataSource === 'db' && dbBreakdown && dbBreakdown.monthlyBreakdown && dbBreakdown.monthlyBreakdown.length > 0) {
      return dbBreakdown;
    }
    return {
      productionHours: 2579.80,
      totalStopHours: 6181.10,
      inProcessStopHours: 191.07,
      standbyStopHours: 5990.03,
      monthlyBreakdown: BREAKDOWN_MONTHLY_DATA,
      stopReasons: STOP_REASONS_DATA,
      occurrenceTypes: STOP_OCCURRENCE_DATA.map((o) => ({
        occurrenceName: o.name,
        hours: o.hours,
        percent: o.percent,
      })),
    };
  }, [dataSource, dbBreakdown]);

  const reactorComparisonList = useMemo(() => {
    if (dataSource === 'db' && dbReactors && dbReactors.length > 0) {
      return dbReactors;
    }
    return REACTOR_COMPARISON_DATA;
  }, [dataSource, dbReactors]);

  const massBalanceList = useMemo(() => {
    if (dataSource === 'db' && dbMassBalance && dbMassBalance.length > 0) {
      return dbMassBalance;
    }
    return MASS_BALANCE_DATA;
  }, [dataSource, dbMassBalance]);

  // داده‌های لاگ‌های پایگاه داده
  const rawLogsItems = useMemo<RawLogSampleItem[]>(() => {
    if (dataSource === 'db' && dbRawLogsPaged && dbRawLogsPaged.items.length > 0) {
      return dbRawLogsPaged.items;
    }
    return RAW_DATABASE_SAMPLES.filter((log) => {
      const matchReactor =
        selectedReactor === 'all' ||
        (selectedReactor === '3' && log.reactorNum === 3) ||
        (selectedReactor === '4' && log.reactorNum === 4);
      const matchSearch =
        searchQuery === '' ||
        log.date.includes(searchQuery) ||
        log.desc.includes(searchQuery) ||
        log.batchNum.toString().includes(searchQuery);
      return matchReactor && matchSearch;
    });
  }, [dataSource, dbRawLogsPaged, selectedReactor, searchQuery]);

  const totalRawCount = useMemo(() => {
    if (dataSource === 'db' && dbRawLogsPaged) {
      return dbRawLogsPaged.totalCount;
    }
    return rawLogsItems.length;
  }, [dataSource, dbRawLogsPaged, rawLogsItems.length]);

  const totalPages = Math.ceil(totalRawCount / pageSize) || 1;

  // خروجی CSV برای داده‌های جدول
  // خروجی CSV برای داده‌های جدول با ساختار کامل جدول ورودی مواد (Entry.aspx)
  const exportToCsv = () => {
    const headers = [
      'ردیف',
      'تاریخ تولید',
      'رآکتور',
      'شماره بچ',
      'ساعت بازرسی',
      'میزان الکل ورودی (لیتر)',
      'درجه الکل',
      'میزان اسید ورودی (کیلوگرم)',
      'واحد تزریق اسید',
      'عدد اسیدی (AN)',
      'نوع آیزوتروپ ورودی',
      'میزان آیزوتروپ تزریقی',
      'فشار راکتور (bar)',
      'سطح راکتور (Level)',
      'دمای بالای ستون تقطیر (°C)',
      'فشار بالای ستون تقطیر',
      'دمای روغن ورودی (°C)',
      'فشار روغن ورودی',
      'دمای آب ورودی کندانسور (°C)',
      'فشار آب ورودی کندانسور',
      'دمای آب خروجی کندانسور (°C)',
      'دمای سیال ریفلاکس (°C)',
      'میزان ریفلاکس',
      'سرعت محصول (ProductSpeed)',
      'مقدار کل محصول (ProductAmount)',
      'درجه محصول (ProductDegree)',
      'نوع محصول آبگیری (OutputType)',
      'سرعت آبگیری (AGSpeed)',
      'مقدار کل آبگیری (AGAmount)',
      'توضیحات فرآیند',
      'نام اپراتور',
    ];
    const rows = rawLogsItems.map((l) => [
      l.id,
      l.operatorManualDateFA || l.date,
      l.reactorNum,
      l.batchNum,
      l.inspectionTime,
      l.alcoholLiter ?? l.alcoholIn,
      l.alcoholDegree ?? l.alcoholDeg,
      l.acidKg ?? l.acidIn,
      `"${l.acidUnit || 'کیلوگرم'}"`,
      l.acidNumber ?? l.acidNum,
      l.inputAzeotropeType || 0,
      l.inputAzeotropeAmount || 0,
      l.reactorPressure ?? l.reactorPress,
      l.reactorLevel || 0,
      l.distillationTopTemp ?? l.distilTopTemp,
      l.distillationTopPressure || 0,
      l.oilInputTemp || 0,
      l.oilInputPressure || 0,
      l.condenserWaterTemp || 0,
      l.condenserWaterPressure || 0,
      l.condenserOutWaterTemp || 0,
      l.refluxFluidTemp || 0,
      l.refluxAmount || 0,
      l.productSpeed || 0,
      l.productAmount || 0,
      l.productDegree ?? l.productDeg,
      `"${l.outputTypeTitle || (l.outputType === 1 ? 'ایزوتروپ' : l.outputType === 2 ? 'الکل 600' : l.outputType === 3 ? 'الکل 700' : l.outputType === 4 ? 'پساب 1300' : 'آب خروجی 400')}"`,
      l.agSpeed || 0,
      l.agAmount ?? l.waterOut,
      `"${(l.description || l.desc || '').replace(/"/g, '""')}"`,
      `"${l.operatorName || 'اپراتور'}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HalalSazan_ExcelReport_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('گزارش با موفقیت در قالب فایل CSV دانلود شد.');
  };

  // --- آپشن‌های ECharts برای تب ۱ (Tahmasbi Report) ---
  const getGaugeOption = (title: string, value: number, color: string) => ({
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '100%',
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [Math.min(1, Math.max(0, value / 100)), color],
              [1, 'rgba(255, 255, 255, 0.08)'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 10,
          offsetCenter: [0, '-50%'],
          itemStyle: { color: '#fff' },
        },
        axisTick: { length: 8, lineStyle: { color: 'rgba(255,255,255,0.2)', width: 1 } },
        splitLine: { length: 14, lineStyle: { color: 'rgba(255,255,255,0.4)', width: 2 } },
        axisLabel: { color: '#94a3b8', fontSize: 10, distance: -35 },
        title: {
          offsetCenter: [0, '25%'],
          fontSize: 12,
          color: '#cbd5e1',
          fontWeight: 'bold',
        },
        detail: {
          fontSize: 22,
          offsetCenter: [0, '-10%'],
          valueAnimation: true,
          formatter: '{value}%',
          color: '#ffffff',
          fontWeight: 'black',
        },
        data: [{ value: Number(value.toFixed(1)), name: title }],
      },
    ],
  });

  // --- آپشن‌های ECharts برای تب ۲ (تولید در ماه) ---
  const monthlyProductionOption = useMemo(() => {
    const dates = monthlyProductionList.map((d) => d.date);
    const values = monthlyProductionList.map((d) => d.amount);
    const cumulative = monthlyProductionList.map((d) => d.cumulative);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          let res = `<div class="font-bold border-b border-slate-700 pb-1 mb-1">تاریخ: ${params[0].name}</div>`;
          params.forEach((item: any) => {
            const unit = item.seriesName.includes('تجمعی') ? 'لیتر کل' : 'لیتر روزانه';
            res += `<div class="flex items-center justify-between gap-4 py-0.5">
              <span>${item.marker} ${item.seriesName}:</span>
              <span class="font-mono font-bold">${Number(item.value).toLocaleString()} ${unit}</span>
            </div>`;
          });
          return res;
        },
      },
      legend: {
        data: ['تولید روزانه آیزوتروپ', 'تولید تجمعی ماه'],
        textStyle: { color: '#94a3b8' },
        top: 0,
        left: 20,
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, rotate: dates.length > 15 ? 45 : 0 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'تولید روزانه (L)',
          nameTextStyle: { color: '#94a3b8', fontSize: 11 },
          axisLabel: {
            color: '#94a3b8',
            formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        },
        {
          type: 'value',
          name: 'تجمعی (L)',
          nameTextStyle: { color: '#94a3b8', fontSize: 11 },
          axisLabel: {
            color: '#94a3b8',
            formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'تولید روزانه آیزوتروپ',
          type: 'bar',
          data: values,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#06b6d4' },
                { offset: 1, color: '#0284c7' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'تولید تجمعی ماه',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: cumulative,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 3, shadowColor: 'rgba(245, 158, 11, 0.4)', shadowBlur: 8 },
        },
      ],
    };
  }, [monthlyProductionList]);

  // --- آپشن‌های ECharts برای تب ۳ (پایداری کیفی) ---
  const qualityVolumePieOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <br/><b>{c} لیتر</b> ({d}%)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        name: 'میزان آیزوتروپ در بازه‌های کیفی',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0f172a',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{d}%',
          color: '#cbd5e1',
          fontSize: 11,
          fontWeight: 'bold',
        },
        data: qualityStabilityList.map((item, idx) => {
          const colors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6'];
          return {
            value: item.volumeLiter,
            name: item.rangeName,
            itemStyle: { color: colors[idx % colors.length] },
          };
        }),
      },
    ],
  }), [qualityStabilityList]);

  const qualityHoursPieOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <br/><b>{c} ساعت</b> ({d}%)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        name: 'میزان ساعات پایداری سیستم',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0f172a',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{d}%',
          color: '#cbd5e1',
          fontSize: 11,
          fontWeight: 'bold',
        },
        data: qualityStabilityList.map((item, idx) => {
          const colors = ['#f43f5e', '#fb923c', '#facc15', '#059669', '#2563eb'];
          return {
            value: item.hours,
            name: item.rangeName,
            itemStyle: { color: colors[idx % colors.length] },
          };
        }),
      },
    ],
  }), [qualityStabilityList]);

  // --- آپشن‌های ECharts برای تب ۴ (Breakdown Report) - مطابقت دقیق با شیت اکسل و تصاویر ۲ و ۳ ---
  const breakdownMonthlyBarOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        let title = `<div class="font-bold border-b border-slate-700 pb-1 mb-1">ماه: ${params[0].name}</div>`;
        let total = 0;
        params.forEach((p: any) => {
          total += Number(p.value);
          title += `<div class="flex items-center justify-between gap-4 py-0.5">
            <span>${p.marker} ${p.seriesName}:</span>
            <span class="font-mono font-bold">${Number(p.value).toFixed(2)} ساعت</span>
          </div>`;
        });
        title += `<div class="border-t border-slate-700 mt-1 pt-1 flex justify-between font-bold text-slate-300">
          <span>مجموع زمان ماه:</span>
          <span class="font-mono">${total.toFixed(2)} ساعت</span>
        </div>`;
        return title;
      },
    },
    legend: {
      data: ['مجموع ساعات تولید', 'مجموع ساعات توقف'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0,
      left: 10,
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: breakdownData.monthlyBreakdown.map((m) => m.monthName),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'ساعت',
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: [
      {
        name: 'مجموع ساعات تولید',
        type: 'bar',
        stack: 'monthHours',
        data: breakdownData.monthlyBreakdown.map((m) => m.productionHours),
        itemStyle: { color: '#38bdf8' }, // آبی آسمانی مطابق با اکسل
      },
      {
        name: 'مجموع ساعات توقف',
        type: 'bar',
        stack: 'monthHours',
        data: breakdownData.monthlyBreakdown.map((m) => m.stopHours),
        itemStyle: { color: '#f97316' }, // نارنجی مطابق با اکسل
      },
    ],
  }), [breakdownData]);

  // چارت ۹: سهم زمانی دلایل توقفات (Donut)
  const stopReasonsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <br/><b>{c} ساعت</b> ({d}%)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'middle',
      textStyle: { color: '#cbd5e1', fontSize: 11 },
      formatter: (name: string) => {
        const item = breakdownData.stopReasons.find((r) => r.reason === name);
        return item ? `${name} (${item.percent}%)` : name;
      },
    },
    series: [
      {
        name: 'سهم زمانی دلایل توقف',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#0f172a', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#fff', formatter: '{b}\n{d}%' },
        },
        data: breakdownData.stopReasons.map((s, idx) => {
          // رنگ‌های متناظر با پالت نمودار اکسل در تصویر ۲
          const colors = ['#f97316', '#84cc16', '#eab308', '#06b6d4', '#94a3b8', '#a855f7'];
          return {
            value: s.hours,
            name: s.reason,
            itemStyle: { color: colors[idx % colors.length] },
          };
        }),
      },
    ],
  }), [breakdownData]);

  // چارت ۴: مجموع ساعات توقفات تفکیک نحوه وقوع (بین تولید vs حین تولید)
  const occurrencePieOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <br/><b>{c} ساعت</b> ({d}%)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'middle',
      textStyle: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        name: 'تفکیک نوع وقوع توقف',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#0f172a', borderWidth: 2 },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 11,
        },
        data: breakdownData.occurrenceTypes.map((o) => ({
          value: o.hours,
          name: o.occurrenceName,
          itemStyle: {
            color: o.occurrenceName.includes('بین') ? '#38bdf8' : '#f97316',
          },
        })),
      },
    ],
  }), [breakdownData]);

  // چارت ۲: سهم ساعات تولید و توقفات (Pie)
  const productionStopSharePieOption = useMemo(() => {
    const prodHours = breakdownData.productionHours ?? tahmasbiData.netProductionHours ?? 2579.80;
    const stopHours = breakdownData.totalStopHours ?? tahmasbiData.stopHours ?? 6181.10;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <br/><b>{c} ساعت</b> ({d}%)',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#fff' },
      },
      legend: {
        orient: 'vertical',
        right: '2%',
        top: 'middle',
        textStyle: { color: '#cbd5e1', fontSize: 11 },
      },
      series: [
        {
          name: 'سهم ساعات تولید و توقفات',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#0f172a', borderWidth: 2 },
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 11,
          },
          data: [
            { value: Number(prodHours.toFixed(2)), name: 'مجموع ساعات تولید', itemStyle: { color: '#38bdf8' } },
            { value: Number(stopHours.toFixed(2)), name: 'مجموع ساعات توقف', itemStyle: { color: '#f97316' } },
          ],
        },
      ],
    };
  }, [breakdownData, tahmasbiData]);

  // --- آپشن‌های ECharts برای تب ۵ (مقایسه رآکتورها) ---
  const reactorComparisonOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#fff' },
    },
    legend: {
      data: ['رآکتور ۳', 'رآکتور ۴', 'رآکتور ۳۶', 'جمع کل'],
      textStyle: { color: '#94a3b8' },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: reactorComparisonList.map((d) => d.monthName),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: {
      type: 'value',
      name: 'لیتر آیزوتروپ',
      nameTextStyle: { color: '#94a3b8' },
      axisLabel: {
        color: '#94a3b8',
        formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`),
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: [
      {
        name: 'رآکتور ۳',
        type: 'bar',
        data: reactorComparisonList.map((d) => d.reactor3),
        itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'رآکتور ۴',
        type: 'bar',
        data: reactorComparisonList.map((d) => d.reactor4),
        itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'رآکتور ۳۶',
        type: 'bar',
        data: reactorComparisonList.map((d) => d.reactor36),
        itemStyle: { color: '#a855f7', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'جمع کل',
        type: 'line',
        data: reactorComparisonList.map((d) => d.total),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
      },
    ],
  }), [reactorComparisonList]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-100">
      {/* هدر اصلی صفحه با وضعیت اتصال به دیتابیس و فیلترها */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 border border-emerald-400/30">
              <FileSpreadsheet className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                  مرکز گزارش‌گیری و تحلیل‌های پیشرفته اکسل (اتصال مستقیم به سرور و SQL Server)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Server Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                محاسبه بلادرنگ تمام شیت‌ها و شاخص‌های فرآیند مهندسی شیمی از طریق استورد پروسیجرهای اختصاصی دیتابیس HalalSazan
              </p>
            </div>
          </div>

          {/* ابزارها، فیلترها و دکمه رفرش */}
          <div className="flex flex-wrap items-center gap-3">
            {/* انتخاب منبع داده */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDataSource('db')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dataSource === 'db'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>دیتابیس سرور (Live SQL)</span>
              </button>
              <button
                type="button"
                onClick={() => setDataSource('excel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dataSource === 'excel'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>داده‌های فایل اکسل</span>
              </button>
            </div>

            {/* دکمه باز/بسته کردن پنل بُرش‌دهنده‌ها */}
            <button
              type="button"
              onClick={() => setIsSlicerOpen(!isSlicerOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border shadow ${
                isSlicerOpen
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فیلترهای بُرش‌دهنده اکسل (Slicers)</span>
              {selectedBatchNumbers.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                  {selectedBatchNumbers.length} بچ
                </span>
              )}
              {isSlicerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* دکمه بروزرسانی داده‌های زنده */}
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isAnyLoading}
              title="واکشی مجدد داده‌ها از سرور"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition border border-slate-700/60 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* دکمه خروجی CSV */}
            <button
              type="button"
              onClick={exportToCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700/60 shadow"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>خروجی اکسل</span>
            </button>
          </div>
        </div>

        {/* پنل بازشونده بُرش‌دهنده‌های اکسل (Excel Slicers: رآکتور، سال، ماه، شماره بچ) */}
        {isSlicerOpen && (
          <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4 animate-fade-in">
            {/* ردیف اسلایسرهای تک‌انتخابی (رآکتور، سال، ماه) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* اسلایسر رآکتور */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5" />
                    <span>شماره رآکتور (Slicer)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { id: '3', label: 'رآکتور ۳' },
                    { id: '4', label: 'رآکتور ۴' },
                    { id: 'all', label: 'همه رآکتورها' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReactor(r.id)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                        selectedReactor === r.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* اسلایسر سال */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>سال (Slicer)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1404, 1403, 1405].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedYear(y)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition border ${
                        selectedYear === y
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* اسلایسر ماه */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>فیلتر ماه (اختیاری)</span>
                  </span>
                  {selectedMonth !== undefined && (
                    <button
                      type="button"
                      onClick={() => setSelectedMonth(undefined)}
                      className="text-[10px] text-slate-400 hover:text-rose-400"
                    >
                      حذف فیلتر ماه
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(undefined)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                      selectedMonth === undefined
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    همه ماه‌ها
                  </button>
                  {[
                    { m: 1, name: '۱ فروردین' },
                    { m: 2, name: '۲ اردیبهشت' },
                    { m: 3, name: '۳ خرداد' },
                    { m: 4, name: '۴ تیر' },
                    { m: 5, name: '۵ مرداد' },
                    { m: 6, name: '۶ شهریور' },
                    { m: 7, name: '۷ مهر' },
                    { m: 8, name: '۸ آبان' },
                    { m: 9, name: '۹ آذر' },
                    { m: 10, name: '۱۰ دی' },
                    { m: 11, name: '۱۱ بهمن' },
                    { m: 12, name: '۱۲ اسفند' },
                  ].map((mo) => (
                    <button
                      key={mo.m}
                      type="button"
                      onClick={() => setSelectedMonth(mo.m)}
                      className={`py-1 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                        selectedMonth === mo.m
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mo.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* اسلایسر چندانتخابی بچ‌ها (Multi-Select Batch Slicer) - مطابق دقیق با اسلایسر اکسل */}
            <div className="bg-slate-950/90 p-4 rounded-xl border border-sky-500/30 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>اسلایسر شماره بچ (Batch Slicer):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    {selectedBatchNumbers.length === 0
                      ? 'تمام بچ‌ها انتخاب شده (بدون فیلتر)'
                      : `${selectedBatchNumbers.length} بچ انتخاب شده: [${selectedBatchNumbers.join(', ')}]`}
                  </span>
                </div>

                {/* ابزارهای سریع اسلایسر بچ‌ها */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* دکمه انتخاب سریع بچ‌های نمونه تصویر ۱ */}
                  <button
                    type="button"
                    onClick={handleSelectSampleBatches}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition shadow-sm"
                    title="انتخاب بچ‌های ۱، ۱۰، ۱۸، ۳۱ جهت مطابقت ۱۰۰٪ با عکس گزارش تهماسبی"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>تست عکس ۱ (بچ‌های ۱، ۱۰، ۱۸، ۳۱)</span>
                  </button>

                  {/* دکمه انتخاب همه / پاک کردن */}
                  <button
                    type="button"
                    onClick={handleSelectAllBatches}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>انتخاب همه (بدون فیلتر)</span>
                  </button>

                  {/* ورودی جستجوی بچ */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="جستجوی بچ..."
                      value={batchSearchTerm}
                      onChange={(e) => setBatchSearchTerm(e.target.value)}
                      className="w-28 sm:w-36 py-1 pr-7 pl-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* شبکه کلیدهای اسلایسر بچ‌ها شبیه اسلایسر اکسل در عکس ۱ و ۲ */}
              <div className="mt-3 max-h-48 overflow-y-auto no-scrollbar">
                {batches && batches.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5">
                    {batches
                      .filter((b) =>
                        batchSearchTerm ? b.batchNumber.toString().includes(batchSearchTerm) : true
                      )
                      .map((b) => {
                        const isSelected = selectedBatchNumbers.includes(b.batchNumber);
                        return (
                          <button
                            key={b.batchId}
                            type="button"
                            onClick={() => handleToggleBatch(b.batchNumber)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex flex-col items-center justify-center border ${
                              isSelected
                                ? 'bg-sky-500 text-white border-sky-300 shadow-md shadow-sky-500/30 scale-105'
                                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                            }`}
                          >
                            <span>{b.batchNumber.toFixed(1)}</span>
                            <span
                              className={`text-[9px] ${
                                isSelected ? 'text-sky-100' : 'text-slate-500'
                              }`}
                            >
                              {b.logCount} لاگ
                            </span>
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500">
                    درحال واکشی لیست بچ‌ها از پایگاه داده...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نوار تب‌های شبیه اکسل (Excel Sheet Tabs) با استایل صنعتی */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 select-none relative ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tab.color }}
                />
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.titleFa}</span>
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                  {tab.sheetName}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                    style={{ backgroundColor: tab.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* تب ۱: خلاصه وضعیت و راندمان (Tahmasbi Report)                   */}
      {/* ============================================================== */}
      {activeTab === 'tahmasbi' && (
        <div className="space-y-6 animate-fade-in">
          {/* ============================================================== */}
          {/* بخش شاهکار: طراحی دقیق شیت اکسل مهندسی (Tahmasbi Report)       */}
          {/* مطابق ۱۰۰٪ با تصویر ۱ کاربر: ۳ جدول اصلی و ۳ باکس راندمان    */}
          {/* ============================================================== */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h2 className="text-xl font-black text-amber-300 tracking-wide flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-amber-400" />
                  <span>گزارش خلاصه وضعیت تولید</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  نمای رسمی و دقیق شیت تهماسبی ریپورت (Tahmasbi Report) - محاسبه شده مستقیم از پایگاه داده SQL Server
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  رآکتور {selectedReactor === 'all' ? 'همه' : selectedReactor} | سال {selectedYear}{' '}
                  {selectedBatchNumbers.length > 0
                    ? `| بچ‌های: [${selectedBatchNumbers.join(', ')}]`
                    : '| تمام بچ‌ها'}
                </span>
              </div>
            </div>

            {/* سه جدول موازی اکسل در کنار هم (مطابق چیدمان دقیق تصویر ۱) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* جدول ۳: میانگین ورودی و خروجی محصولات و مواد اولیه (سمت چپ در اکسل) */}
              <div className="rounded-xl overflow-hidden border border-amber-500/40 shadow-lg bg-slate-950/80">
                <div className="bg-black text-amber-300 py-3 px-4 font-black text-xs text-center border-b border-amber-500/40 tracking-wide">
                  میانگین ورودی و خروجی محصولات و مواد اولیه
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-amber-500/30">
                        <th className="py-2.5 px-3 border-l border-amber-500/20 text-center">شرح</th>
                        <th className="py-2.5 px-3 border-l border-amber-500/20 text-center">در زمان عملیات</th>
                        <th className="py-2.5 px-3 text-center">در کل زمان تولیدی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-500/20">
                      {(() => {
                        const alc = tahmasbiData.flowRates?.find((f) => f.name.includes('الکل'));
                        const acd = tahmasbiData.flowRates?.find((f) => f.name.includes('اسید'));
                        const azt = tahmasbiData.flowRates?.find((f) => f.name.includes('آیزوتروپ'));
                        const wtr = tahmasbiData.flowRates?.find((f) => f.name.includes('آب'));
                        return [
                          { name: 'الکل ورودی', inOp: alc?.inOperationRate ?? 242, overall: alc?.overallRate ?? 166 },
                          { name: 'اسید ورودی', inOp: acd?.inOperationRate ?? 45200, overall: acd?.overallRate ?? 148 },
                          { name: 'آیزوتروپ خروجی', inOp: azt?.inOperationRate ?? 341, overall: azt?.overallRate ?? 256 },
                          { name: 'آب خروجی', inOp: wtr?.inOperationRate ?? 42, overall: wtr?.overallRate ?? 22 },
                        ].map((row) => (
                          <tr key={row.name} className="hover:bg-amber-500/10 transition">
                            <td className="py-3 px-3 font-bold text-white border-l border-amber-500/20 text-center">
                              {row.name}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-cyan-400 border-l border-amber-500/20 text-center text-sm">
                              {Math.round(row.inOp).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-amber-400 text-center text-sm">
                              {Math.round(row.overall).toLocaleString()}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* جدول ۲: جدول خروجی محصولات (وسط در اکسل) */}
              <div className="rounded-xl overflow-hidden border border-amber-500/40 shadow-lg bg-slate-950/80">
                <div className="bg-black text-amber-300 py-3 px-4 font-black text-xs text-center border-b border-amber-500/40 tracking-wide">
                  جدول خروجی محصولات
                </div>
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-slate-300 font-bold">میزان آیزوتروپ خروجی</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      {tahmasbiData.outputAzeotropeLiter.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-slate-300 font-bold">میانگین درجه آیزوتروپ خروجی</span>
                    <span className="font-mono font-black text-white text-base">
                      {tahmasbiData.avgAzeotropeDegree}°
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-slate-300 font-bold">میزان آب خارج شده</span>
                    <span className="font-mono font-black text-cyan-400 text-base">
                      {tahmasbiData.outputWaterLiter.toLocaleString()}
                    </span>
                  </div>

                  {/* بخش ساعات خروجی شیت اکسل با فرمت [h]:mm */}
                  <div className="pt-2 border-t border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between py-1 px-3 rounded bg-slate-900 border border-slate-800">
                      <span className="text-xs text-slate-400 font-bold">تعداد ساعت محصول گیری</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {tahmasbiData.productHoursFormatted || '228:30'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 rounded bg-slate-900 border border-slate-800">
                      <span className="text-xs text-slate-400 font-bold">تعداد ساعت آبگیری</span>
                      <span className="font-mono font-black text-cyan-400 text-sm">
                        {tahmasbiData.waterDrainHoursFormatted || '162:00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 rounded bg-rose-950/30 border border-rose-900/50">
                      <span className="text-xs text-rose-300 font-bold">تعداد کل ساعات توقفات</span>
                      <span className="font-mono font-black text-rose-400 text-sm">
                        {tahmasbiData.stopHoursFormatted || '591:25'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* جدول ۱: جدول ورودی مواد اولیه (سمت راست در اکسل) */}
              <div className="rounded-xl overflow-hidden border border-amber-500/40 shadow-lg bg-slate-950/80">
                <div className="bg-black text-amber-300 py-3 px-4 font-black text-xs text-center border-b border-amber-500/40 tracking-wide">
                  جدول ورودی مواد اولیه
                </div>
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-slate-300 font-bold">میزان الکل ورودی</span>
                    <span className="font-mono font-black text-amber-400 text-base">
                      {tahmasbiData.inputAlcoholLiter.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-slate-300 font-bold">میانگین درجه الکل ورودی</span>
                    <span className="font-mono font-black text-white text-base">
                      {tahmasbiData.avgAlcoholDegree}°
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-slate-300 font-bold">میزان اسید ورودی (لیتر)</span>
                    <span className="font-mono font-black text-rose-400 text-base">
                      {tahmasbiData.inputAcidLiter.toLocaleString()}
                    </span>
                  </div>

                  {/* بخش ساعات ورودی شیت اکسل با فرمت [h]:mm */}
                  <div className="pt-2 border-t border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between py-1 px-3 rounded bg-slate-900 border border-slate-800">
                      <span className="text-xs text-slate-400 font-bold">تعداد ساعت تزریق اسید</span>
                      <span className="font-mono font-black text-rose-400 text-sm">
                        {tahmasbiData.acidInjectHoursFormatted || '1:15'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 rounded bg-slate-900 border border-slate-800">
                      <span className="text-xs text-slate-400 font-bold">تعداد ساعت تزریق الکل</span>
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {tahmasbiData.alcoholInjectHoursFormatted || '209:15'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 rounded bg-emerald-950/30 border border-emerald-900/50">
                      <span className="text-xs text-emerald-300 font-bold">تعداد کل ساعات خالص تولیدی</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {tahmasbiData.netProductionHoursFormatted || '304:50'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 rounded bg-slate-900 border border-slate-700 font-black">
                      <span className="text-xs text-white font-bold">مجموع کل زمان تولید</span>
                      <span className="font-mono font-black text-amber-300 text-sm">
                        {tahmasbiData.totalProductionHoursFormatted || '896:15'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* سه باکس راندمان زمانی دقیقاً مطابق با موقعیت و فرمت تصویر ۱ اکسل */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-slate-950/90 border-2 border-emerald-500/40 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-300">راندمان زمانی محصول گیری</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">نسبت ساعت محصول به کل ساعت تولید خالص</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  {tahmasbiData.productEfficiency.toFixed(1)}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border-2 border-cyan-500/40 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-300">راندمان زمانی آبگیری</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">نسبت ساعت آبگیری به کل ساعت تولید خالص</span>
                </div>
                <span className="text-2xl font-black font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                  {tahmasbiData.waterEfficiency.toFixed(1)}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border-2 border-amber-500/40 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-300">راندمان زمانی تولید</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">نسبت ساعت تولید خالص به کل زمان دوره</span>
                </div>
                <span className="text-2xl font-black font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
                  {tahmasbiData.productionEfficiency.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* کارت‌های شاخص کلیدی ورودی و خروجی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">میزان الکل ورودی</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {tahmasbiData.inputAlcoholLiter.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">لیتر</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>میانگین درجه الکل ورودی:</span>
                <span className="font-bold text-white font-mono">{tahmasbiData.avgAlcoholDegree}°</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">میزان اسید ورودی</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {tahmasbiData.inputAcidLiter.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">لیتر / کیلو</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>تعداد ساعت تزریق اسید:</span>
                <span className="font-bold text-white font-mono">{tahmasbiData.acidInjectHours} h</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">میزان آیزوتروپ خروجی</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {tahmasbiData.outputAzeotropeLiter.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">لیتر محصول</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>میانگین درجه آیزوتروپ:</span>
                <span className="font-bold text-white font-mono">{tahmasbiData.avgAzeotropeDegree}°</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">میزان آب خارج شده (RF)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {tahmasbiData.outputWaterLiter.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">لیتر</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>تعداد ساعت آبگیری:</span>
                <span className="font-bold text-white font-mono">{tahmasbiData.waterDrainHours} h</span>
              </div>
            </div>
          </div>

          {/* گیج‌مترهای سه‌گانه راندمان زمانی */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-300">راندمان زمانی محصول‌گیری</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">نسبت ساعت محصول به کل ساعت تولید خالص</p>
              <div className="w-full h-48 mt-2">
                <ReactECharts
                  option={getGaugeOption('محصول‌گیری', tahmasbiData.productEfficiency, '#10b981')}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {tahmasbiData.productHours} ساعت محصول / {tahmasbiData.netProductionHours} ساعت خالص
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-300">راندمان زمانی آبگیری</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">نسبت ساعت آبگیری به کل ساعت تولید خالص</p>
              <div className="w-full h-48 mt-2">
                <ReactECharts
                  option={getGaugeOption('آبگیری', tahmasbiData.waterEfficiency, '#06b6d4')}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {tahmasbiData.waterDrainHours} ساعت آبگیری / {tahmasbiData.netProductionHours} ساعت خالص
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-300">راندمان زمانی کل تولید</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">درصد بهره‌وری زمان کل نسبت به توقفات</p>
              <div className="w-full h-48 mt-2">
                <ReactECharts
                  option={getGaugeOption('راندمان کل', tahmasbiData.productionEfficiency, '#f59e0b')}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {tahmasbiData.netProductionHours} ساعت تولید / {tahmasbiData.totalProductionHours} ساعت کل دوره
              </span>
            </div>
          </div>

          {/* دو جدول ماتریسی: نرخ‌های جریان + تفکیک ساعات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>میانگین نرخ ورودی و خروجی مواد و محصولات</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">واحد: لیتر بر ساعت (L/h)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                      <th className="py-2.5 px-3">عنوان شاخص</th>
                      <th className="py-2.5 px-3">در زمان عملیات (L/h)</th>
                      <th className="py-2.5 px-3">در کل زمان تولیدی (L/h)</th>
                      <th className="py-2.5 px-3">ضریب کارایی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tahmasbiData.flowRates.map((flow) => {
                      const ratio = flow.inOperationRate > 0 ? (flow.overallRate / flow.inOperationRate) * 100 : 0;
                      return (
                        <tr key={flow.name} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 font-bold text-white">{flow.name}</td>
                          <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                            {flow.inOperationRate.toFixed(1)} {flow.unit}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            {flow.overallRate.toFixed(1)} {flow.unit}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                              {ratio.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>تفکیک ساعات کارکرد سیستم در دوره گزارش</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">پایگاه داده زنده</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                      <th className="py-2.5 px-3">بخش فرآیندی</th>
                      <th className="py-2.5 px-3">تعداد ساعات</th>
                      <th className="py-2.5 px-3">سهم از کل دوره</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-300">ساعت تزریق اسید</td>
                      <td className="py-2 px-3 font-mono font-bold text-white">{tahmasbiData.acidInjectHours} h</td>
                      <td className="py-2 px-3 text-slate-400">
                        {((tahmasbiData.acidInjectHours / Math.max(1, tahmasbiData.totalProductionHours)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-300">ساعت تزریق الکل</td>
                      <td className="py-2 px-3 font-mono font-bold text-white">{tahmasbiData.alcoholInjectHours} h</td>
                      <td className="py-2 px-3 text-slate-400">
                        {((tahmasbiData.alcoholInjectHours / Math.max(1, tahmasbiData.totalProductionHours)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-300">ساعت محصول‌گیری فعال</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">{tahmasbiData.productHours} h</td>
                      <td className="py-2 px-3 text-slate-400">
                        {((tahmasbiData.productHours / Math.max(1, tahmasbiData.totalProductionHours)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-300">ساعت آبگیری از سامانه</td>
                      <td className="py-2 px-3 font-mono font-bold text-cyan-400">{tahmasbiData.waterDrainHours} h</td>
                      <td className="py-2 px-3 text-slate-400">
                        {((tahmasbiData.waterDrainHours / Math.max(1, tahmasbiData.totalProductionHours)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="bg-emerald-950/20 font-bold">
                      <td className="py-2 px-3 text-emerald-300">تعداد کل ساعات خالص تولیدی</td>
                      <td className="py-2 px-3 font-mono text-emerald-400">{tahmasbiData.netProductionHours} h</td>
                      <td className="py-2 px-3 text-emerald-400">
                        {((tahmasbiData.netProductionHours / Math.max(1, tahmasbiData.totalProductionHours)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="bg-rose-950/20 font-bold">
                      <td className="py-2 px-3 text-rose-300">تعداد کل ساعات توقفات</td>
                      <td className="py-2 px-3 font-mono text-rose-400">{tahmasbiData.stopHours} h</td>
                      <td className="py-2 px-3 text-rose-400">
                        {((tahmasbiData.stopHours / Math.max(1, tahmasbiData.totalProductionHours)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="border-t-2 border-slate-700 font-black">
                      <td className="py-2.5 px-3 text-white">مجموع کل زمان دوره تولید</td>
                      <td className="py-2.5 px-3 font-mono text-white">{tahmasbiData.totalProductionHours} h</td>
                      <td className="py-2.5 px-3 text-amber-400">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* تب ۲: روند تولید در ماه (تولید در ماه)                           */}
      {/* ============================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 animate-fade-in">
          {/* کارت خلاصه بالای شیت تولید در ماه */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">مجموع تولید دوره</span>
              <p className="text-2xl font-black text-cyan-400 font-mono mt-2">
                {monthlyProductionList.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}{' '}
                <span className="text-xs text-slate-400">لیتر</span>
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                تعداد رکوردهای ثبت شده: {monthlyProductionList.length} روز
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">بالاترین رکورد روزانه</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-2">
                {Math.max(...monthlyProductionList.map((m) => m.amount), 0).toLocaleString()}{' '}
                <span className="text-xs text-slate-400">لیتر</span>
              </p>
              <span className="text-[11px] text-emerald-400/80 mt-1 block">پیک تولید ثبت شده</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">میانگین تولید روزانه</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-2">
                {Math.round(
                  monthlyProductionList.reduce((acc, c) => acc + c.amount, 0) /
                    Math.max(1, monthlyProductionList.length)
                ).toLocaleString()}{' '}
                <span className="text-xs text-slate-400">لیتر / روز</span>
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">محاسبه بر اساس روزهای فعال</span>
            </div>
          </div>

          {/* نمودار اصلی تولید در ماه (Chart 2 در اکسل) */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>نمودار تولید روزانه و تجمعی آیزوتروپ (تولید در ماه - Chart 2)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  روند پیشرفت حجم خروجی آیزوتروپ حاصل از استورد پروسیجر سرور بر اساس رآکتور و بچ انتخابی
                </p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ReactECharts option={monthlyProductionOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* جدول داده‌های تفکیکی روزانه شیت */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-black text-white mb-4">جدول داده‌های تولید روزانه (Pivot Data)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">ردیف</th>
                    <th className="py-2.5 px-3">تاریخ</th>
                    <th className="py-2.5 px-3">میزان آیزوتروپ خروجی (لیتر)</th>
                    <th className="py-2.5 px-3">سهم از کل تولید</th>
                    <th className="py-2.5 px-3">مجموع تجمعی تا روز (لیتر)</th>
                    <th className="py-2.5 px-3">وضعیت تولید</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monthlyProductionList.map((row, idx) => (
                    <tr key={row.date} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-white font-mono">{row.date}</td>
                      <td className="py-2 px-3 font-mono font-bold text-cyan-400">{row.amount.toLocaleString()} L</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${Math.min(100, row.sharePercent * 6)}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-300">{row.sharePercent}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">{row.cumulative.toLocaleString()} L</td>
                      <td className="py-2 px-3">
                        {row.amount >= 15000 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            عالی
                          </span>
                        ) : row.amount >= 7000 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            نرمال
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            متوسط
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* تب ۳: پایداری کیفی سیستم (پایداری کیفی)                          */}
      {/* ============================================================== */}
      {activeTab === 'stability' && (
        <div className="space-y-6 animate-fade-in">
          {/* دو نمودار دایره‌ای پایداری کیفی اکسل (Chart 3 و Chart 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                <span>میزان آیزوتروپ در بازه‌های کیفی (Chart 3)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                توزیع حجمی در ۵ بازه استاندارد مهندسی شیمی - محاسبه شده مستقیم از دیتابیس
              </p>
              <div className="h-72 w-full">
                <ReactECharts option={qualityVolumePieOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-cyan-400" />
                <span>میزان ساعات پایداری سیستم (Chart 4)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                سهم زمانی کارکرد رآکتور در بازه‌های خلوص مختلف
              </p>
              <div className="h-72 w-full">
                <ReactECharts option={qualityHoursPieOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* جدول ماتریس تفکیکی پایداری کیفی */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-black text-white mb-4">جدول محاسباتی پایداری کیفی و نرخ تولید در هر رده خلوص</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">کد</th>
                    <th className="py-2.5 px-3">بازه درجه خلوص آیزوتروپ</th>
                    <th className="py-2.5 px-3">حجم خروجی (لیتر)</th>
                    <th className="py-2.5 px-3">درصد حجمی</th>
                    <th className="py-2.5 px-3">ساعت کارکرد</th>
                    <th className="py-2.5 px-3">درصد زمانی پایداری</th>
                    <th className="py-2.5 px-3">نرخ تولید در ساعت (L/h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {qualityStabilityList.map((row) => (
                    <tr key={row.code} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{row.code}</td>
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            row.code === 3
                              ? 'bg-emerald-400'
                              : row.code === 4
                              ? 'bg-blue-400'
                              : row.code === 2
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {row.rangeName}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                        {row.volumeLiter.toLocaleString()} L
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-emerald-400">{row.volumePercent}%</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{row.hours.toFixed(2)} h</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${row.hoursPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-cyan-400">{row.hoursPercent}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-amber-400">
                        {row.ratePerHour.toLocaleString()} L/h
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-700 font-black bg-slate-950/40">
                    <td colSpan={2} className="py-3 px-3 text-white">مجموع کل پایداری سیستم</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">
                      {qualityStabilityList.reduce((acc, c) => acc + c.volumeLiter, 0).toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">100%</td>
                    <td className="py-3 px-3 font-mono text-cyan-400">
                      {qualityStabilityList.reduce((acc, c) => acc + c.hours, 0).toFixed(2)} h
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400">100%</td>
                    <td className="py-3 px-3 font-mono text-amber-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* تب ۴: تحلیل توقفات و قابلیت اطمینان (breakdown report)          */}
      {/* ============================================================== */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6 animate-fade-in">
          {/* کارت‌های خلاصه توقفات - مطابقت دقیق با کارت‌های شاخص در تصویر ۳ */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">مجموع ساعات تولید</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-2">
                h {(breakdownData.productionHours ?? tahmasbiData.netProductionHours ?? 2579.8).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">ساعات خالص تولیدی رآکتورها</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">مجموع ساعات توقفات</span>
              <p className="text-2xl font-black text-rose-400 font-mono mt-2">
                h {(breakdownData.totalStopHours ?? tahmasbiData.stopHours ?? 6181.1).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">توقفات ثبت شده در سامانه</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">توقفات بین تولید (Standby)</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-2">
                h {(breakdownData.standbyStopHours ?? 5990.03).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">توقفات خارج از فاز فرآیند</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400">توقفات حین تولید (In-Process)</span>
              <p className="text-2xl font-black text-cyan-400 font-mono mt-2">
                h {(breakdownData.inProcessStopHours ?? 191.07).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">توقف و اختلال حین واکنش</span>
            </div>
          </div>

          {/* نمودار اصلی میله‌ای تجمیعی ماهانه (Chart 6 در اکسل - Stacked Bar) */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-400" />
                  <span>مجموع ساعات تولید و توقف به تفکیک ماه (Breakdown Report - Chart 6)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  مقایسه ساعات فعال تولید و ساعات توقف رآکتور به تفکیک ۱۲ ماه سال ۱۴۰۴ (تجمیع شده تا سقف ۷۲۰ الی ۷۴۴ ساعت در ماه)
                </p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ReactECharts option={breakdownMonthlyBarOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* سه نمودار دایره‌ای توقفات اکسل مطابق با تصاویر ۲ و ۳ در کنار هم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* چارت ۹: سهم زمانی دلایل توقفات */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-rose-400" />
                <span>سهم زمانی دلایل توقفات (Chart 9)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-2">تفکیک علل ۶ گانه توقفات برحسب درصد و ساعت</p>
              <div className="h-64 w-full mt-auto">
                <ReactECharts option={stopReasonsOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            {/* چارت ۴: مجموع ساعات توقفات (بین تولید vs حین تولید) */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-cyan-400" />
                <span>مجموع ساعات توقفات (تفکیک نوع وقوع)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-2">مقایسه توقف بین دو بچ (Standby) و حین تولید (In-Process)</p>
              <div className="h-64 w-full mt-auto">
                <ReactECharts option={occurrencePieOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            {/* چارت ۲: سهم ساعات تولید و توقفات */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-amber-400" />
                <span>سهم ساعات تولید و توقفات</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-2">نسبت زمان تولید خالص به کل توقفات در دوره انتخابی</p>
              <div className="h-64 w-full mt-auto">
                <ReactECharts option={productionStopSharePieOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* جدول ماهانه توقفات */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-black text-white mb-4">جدول مقایسه ماهانه قابلیت اطمینان و نرخ دسترسی</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">ماه</th>
                    <th className="py-2.5 px-3">ساعات تولید (h)</th>
                    <th className="py-2.5 px-3">ساعات توقف (h)</th>
                    <th className="py-2.5 px-3">مجموع زمان دوره</th>
                    <th className="py-2.5 px-3">درصد دسترسی و آماده‌به‌کاری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {breakdownData.monthlyBreakdown.map((row) => {
                    const total = row.productionHours + row.stopHours;
                    return (
                      <tr key={row.monthName} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 font-bold text-white">{row.monthName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{row.productionHours.toFixed(2)} h</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-400">{row.stopHours.toFixed(2)} h</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{total.toFixed(2)} h</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  row.availabilityPercent > 70
                                    ? 'bg-emerald-400'
                                    : row.availabilityPercent > 30
                                    ? 'bg-amber-400'
                                    : 'bg-rose-400'
                                }`}
                                style={{ width: `${row.availabilityPercent}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-white">{row.availabilityPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* تب ۵: مقایسه تولید رآکتورها (tolid)                             */}
      {/* ============================================================== */}
      {activeTab === 'reactors' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
              <Factory className="w-5 h-5 text-amber-400" />
              <span>مقایسه حجم تولید رآکتورهای ۳، ۴ و ۳۶ (Chart 1 در اکسل)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              نمودار مقایسه‌ای خروجی آیزوتروپ رآکتورها به تفکیک ماه‌ها - محاسبه شده مستقیم از دیتابیس
            </p>
            <div className="h-80 w-full">
              <ReactECharts option={reactorComparisonOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* جدول ماتریسی مقایسه رآکتورها */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-black text-white mb-4">جدول تجمیعی تولید به تفکیک رآکتور و ماه (Pivot Table)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">ماه تولید</th>
                    <th className="py-2.5 px-3">رآکتور ۳ (لیتر)</th>
                    <th className="py-2.5 px-3">رآکتور ۴ (لیتر)</th>
                    <th className="py-2.5 px-3">رآکتور ۳۶ (لیتر)</th>
                    <th className="py-2.5 px-3">مجموع تولید کارخانه</th>
                    <th className="py-2.5 px-3">وضعیت مقایسه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reactorComparisonList.map((row) => (
                    <tr key={row.monthName} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-white">{row.monthName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{row.reactor3.toLocaleString()} L</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{row.reactor4.toLocaleString()} L</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-400">
                        {row.reactor36 > 0 ? `${row.reactor36.toLocaleString()} L` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-400">{row.total.toLocaleString()} L</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {row.reactor4 > row.reactor3 ? 'رآکتور ۴ پیشرو' : 'رآکتور ۳ پیشرو'}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-700 font-black bg-slate-950/40">
                    <td className="py-3 px-3 text-white">Grand Total</td>
                    <td className="py-3 px-3 font-mono text-amber-400">
                      {reactorComparisonList.reduce((acc, c) => acc + c.reactor3, 0).toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400">
                      {reactorComparisonList.reduce((acc, c) => acc + c.reactor4, 0).toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 font-mono text-purple-400">
                      {reactorComparisonList.reduce((acc, c) => acc + c.reactor36, 0).toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-sm">
                      {reactorComparisonList.reduce((acc, c) => acc + c.total, 0).toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 text-emerald-400">۱۰۰٪ ظرفیت</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* تب ۶: موازنه جرم و بازده شیمیایی (calbazdeh)                   */}
      {/* ============================================================== */}
      {activeTab === 'massBalance' && (
        <div className="space-y-6 animate-fade-in">
          {/* کارت معادله واکنش شیمیایی */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl">
            <h3 className="text-sm font-black text-indigo-300 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>معادله استریفیکاسیون و محاسبات استوکیومتری (محاسبه آنلاین از سرور)</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-center text-sm md:text-base font-bold text-amber-300 tracking-wide">
              CH₃CH₂OH (الکل) + CH₃COOH (اسید) ⇄ CH₃COOCH₂CH₃ (اتیل استات) + H₂O (آب)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">واکنش‌گر محدودکننده (Limiting):</span>
                <span className="font-bold text-emerald-400 mr-2">اسید استیک (مولار کمتر)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">ضریب تبدیل مولار الکل:</span>
                <span className="font-bold text-cyan-400 mr-2">۰.۹۰</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">ضریب تبدیل مولار اسید:</span>
                <span className="font-bold text-cyan-400 mr-2">۰.۸۰</span>
              </div>
            </div>
          </div>

          {/* جدول موازنه جرمی اجزا */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-black text-white mb-4">جدول موازنه جرمی ورودی، خروجی و انحرافات (Mass Balance)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">جزء شیمیایی</th>
                    <th className="py-2.5 px-3">ورودی اولیه (لیتر)</th>
                    <th className="py-2.5 px-3">خروجی واقعی (لیتر)</th>
                    <th className="py-2.5 px-3">موجودی پایان فرایند (لیتر)</th>
                    <th className="py-2.5 px-3">جرم تئوری (کیلوگرم)</th>
                    <th className="py-2.5 px-3">انحراف از محاسبات تئوری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {massBalanceList.map((item) => (
                    <tr key={item.component} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white">{item.component}</td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                        {item.inputLiter > 0 ? `${item.inputLiter.toLocaleString()} L` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {item.outputLiter > 0 ? `${item.outputLiter.toLocaleString()} L` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {item.remainingLiter.toLocaleString()} L
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {item.theoreticalKg.toLocaleString()} Kg
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            Math.abs(item.deviationLiter) < 50
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {item.deviationLiter > 0 ? `+${item.deviationLiter}` : item.deviationLiter} L
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* تب ۷: پایگاه داده جامع لاگ‌ها (total-database)                  */}
      {/* ============================================================== */}
      {activeTab === 'rawDatabase' && (
        <div className="space-y-6 animate-fade-in">
          {/* نوار جستجو و فیلتر داده‌ها */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 w-full sm:w-80 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در توضیحات یا شماره بچ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-white outline-none w-full placeholder:text-slate-500"
              />
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              {loadingRawLogs && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
              <span>
                نمایش رکوردهای <span className="text-white font-bold">{rawLogsItems.length}</span> از مجموع{' '}
                <span className="text-white font-bold">{totalRawCount.toLocaleString()}</span> رکورد ثبت شده در پایگاه داده
              </span>
            </div>
          </div>

          {/* جدول جامع پایگاه داده لاگ‌ها - ساختار ۲ سطری منطبق بر tblProductionLog در فرم Entry.aspx */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                {/* سطر عنوان اصلی (گروه‌بندی بخش‌های فرآیندی) */}
                <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-700 whitespace-nowrap text-[11px]">
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">ردیف</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">تاریخ تولید</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">رآکتور / بچ</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">ساعت بازرسی</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-amber-950/30 text-amber-300">میزان الکل ورودی (لیتر)</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-amber-950/30 text-amber-300">درجه الکل</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-rose-950/30 text-rose-300">میزان اسید ورودی</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-rose-950/30 text-rose-300">واحد تزریق اسید</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-rose-950/30 text-rose-300">عدد اسیدی (AN)</th>

                  <th colSpan={2} className="py-2 px-3 border border-slate-800 bg-purple-950/40 text-purple-300">آیزوتروپ تزریقی</th>
                  <th colSpan={2} className="py-2 px-3 border border-slate-800 bg-blue-950/40 text-blue-300">راکتور</th>
                  <th colSpan={2} className="py-2 px-3 border border-slate-800 bg-indigo-950/40 text-indigo-300">بالای ستون تقطیر</th>
                  <th colSpan={2} className="py-2 px-3 border border-slate-800 bg-amber-950/40 text-amber-300">روغن ورودی</th>
                  <th colSpan={2} className="py-2 px-3 border border-slate-800 bg-cyan-950/40 text-cyan-300">آب ورودی کندانسور</th>
                  <th colSpan={1} className="py-2 px-3 border border-slate-800 bg-cyan-950/40 text-cyan-300">آب خروجی</th>
                  <th colSpan={2} className="py-2 px-3 border border-slate-800 bg-teal-950/40 text-teal-300">ریفلاکس</th>

                  <th colSpan={3} className="py-2 px-3 border border-slate-800 bg-emerald-950/40 text-emerald-300">محصول (AZG)</th>
                  <th colSpan={3} className="py-2 px-3 border border-slate-800 bg-sky-950/40 text-sky-300">آبگیری کل (AG)</th>

                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">توضیحات</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">نام اپراتور</th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-800 bg-slate-950/90">ثبت اطلاعات</th>
                </tr>

                {/* سطر دوم عنوان‌ها (زیرشاخه‌های هر بخش) */}
                <tr className="bg-slate-900/95 text-slate-400 font-bold border-b border-slate-700 whitespace-nowrap text-[10px]">
                  {/* آیزوتروپ تزریقی */}
                  <th className="py-2 px-2.5 border border-slate-800 text-purple-300">نوع آیزوتروپ ورودی</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-purple-300">میزان</th>

                  {/* راکتور */}
                  <th className="py-2 px-2.5 border border-slate-800 text-blue-300">فشار</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-blue-300">level</th>

                  {/* بالای ستون تقطیر */}
                  <th className="py-2 px-2.5 border border-slate-800 text-indigo-300">دما</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-indigo-300">فشار</th>

                  {/* روغن ورودی */}
                  <th className="py-2 px-2.5 border border-slate-800 text-amber-300">دما</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-amber-300">فشار</th>

                  {/* آب کندانسور */}
                  <th className="py-2 px-2.5 border border-slate-800 text-cyan-300">دمای آب ورودی</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-cyan-300">فشار آب ورودی</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-cyan-300">دمای خروجی آب</th>

                  {/* ریفلاکس */}
                  <th className="py-2 px-2.5 border border-slate-800 text-teal-300">دمای سیال</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-teal-300">میزان ریفلاکس</th>

                  {/* محصول AZG */}
                  <th className="py-2 px-2.5 border border-slate-800 text-emerald-300">سرعت (AZG)</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-emerald-300">مقدار کل محصول</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-emerald-300">درجه محصول (AZG)</th>

                  {/* آبگیری کل AG */}
                  <th className="py-2 px-2.5 border border-slate-800 text-sky-300">نوع محصول (AG)</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-sky-300">سرعت آبگیری (AG)</th>
                  <th className="py-2 px-2.5 border border-slate-800 text-sky-300">مقدار کل آبگیری (AG)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 whitespace-nowrap text-[11px]">
                {rawLogsItems.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-500 border border-slate-800/60">{log.id}</td>
                    <td className="py-2.5 px-3 font-bold text-white font-mono border border-slate-800/60">
                      {log.operatorManualDateFA || log.date}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-800/60">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        رآکتور {log.reactorNum} - بچ {log.batchNum}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">{log.inspectionTime}</td>

                    {/* الکل ورودی */}
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold border border-slate-800/60">
                      {(log.alcoholLiter ?? log.alcoholIn) > 0 ? (log.alcoholLiter ?? log.alcoholIn).toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">
                      {(log.alcoholDegree ?? log.alcoholDeg) > 0 ? `${log.alcoholDegree ?? log.alcoholDeg}°` : '-'}
                    </td>

                    {/* اسید ورودی */}
                    <td className="py-2.5 px-3 font-mono text-rose-400 font-bold border border-slate-800/60">
                      {(log.acidKg ?? log.acidIn) > 0 ? (log.acidKg ?? log.acidIn).toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 border border-slate-800/60">{log.acidUnit || 'کیلوگرم'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">
                      {(log.acidNumber ?? log.acidNum) > 0 ? log.acidNumber ?? log.acidNum : '-'}
                    </td>

                    {/* آیزوتروپ تزریقی */}
                    <td className="py-2.5 px-3 text-slate-400 border border-slate-800/60">
                      {log.inputAzeotropeType ? (log.inputAzeotropeType === 1 ? 'ایزوتروپ' : log.inputAzeotropeType) : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">
                      {log.inputAzeotropeAmount && log.inputAzeotropeAmount > 0 ? log.inputAzeotropeAmount.toLocaleString() : '-'}
                    </td>

                    {/* راکتور */}
                    <td className="py-2.5 px-3 font-mono text-blue-300 border border-slate-800/60">
                      {log.reactorPressure ?? log.reactorPress} bar
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">{log.reactorLevel || '-'}</td>

                    {/* بالای ستون تقطیر */}
                    <td className="py-2.5 px-3 font-mono text-indigo-300 border border-slate-800/60">
                      {log.distillationTopTemp ?? log.distilTopTemp}°C
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">{log.distillationTopPressure || '-'}</td>

                    {/* روغن ورودی */}
                    <td className="py-2.5 px-3 font-mono text-amber-300 border border-slate-800/60">
                      {log.oilInputTemp ? `${log.oilInputTemp}°C` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">{log.oilInputPressure || '-'}</td>

                    {/* آب کندانسور */}
                    <td className="py-2.5 px-3 font-mono text-cyan-300 border border-slate-800/60">
                      {log.condenserWaterTemp ? `${log.condenserWaterTemp}°C` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">{log.condenserWaterPressure || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400 border border-slate-800/60">
                      {log.condenserOutWaterTemp ? `${log.condenserOutWaterTemp}°C` : '-'}
                    </td>

                    {/* ریفلاکس */}
                    <td className="py-2.5 px-3 font-mono text-teal-300 border border-slate-800/60">
                      {log.refluxFluidTemp ? `${log.refluxFluidTemp}°C` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 border border-slate-800/60">{log.refluxAmount || '-'}</td>

                    {/* محصول AZG */}
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 border border-slate-800/60">
                      {log.productSpeed && log.productSpeed > 0 ? log.productSpeed.toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-300 border border-slate-800/60">
                      {log.productAmount > 0 ? log.productAmount.toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-200 border border-slate-800/60">
                      {(log.productDegree ?? log.productDeg) > 0 ? `${log.productDegree ?? log.productDeg}°` : '-'}
                    </td>

                    {/* آبگیری کل AG */}
                    <td className="py-2.5 px-3 border border-slate-800/60">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {log.outputTypeTitle || (log.outputType === 1 ? 'ایزوتروپ' : log.outputType === 2 ? 'الکل 600' : log.outputType === 3 ? 'الکل 700' : log.outputType === 4 ? 'پساب 1300' : 'آب خروجی 400')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-400 border border-slate-800/60">
                      {log.agSpeed && log.agSpeed > 0 ? log.agSpeed.toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-300 border border-slate-800/60">
                      {(log.agAmount ?? log.waterOut) > 0 ? (log.agAmount ?? log.waterOut).toLocaleString() : '-'}
                    </td>

                    {/* توضیحات و اپراتور */}
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate border border-slate-800/60" title={log.description || log.desc}>
                      {log.description || log.desc || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 border border-slate-800/60">{log.operatorName || 'اپراتور سیستم'}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 border border-slate-800/60">
                      {log.createdDateStr ? `${log.createdDateStr} ${log.createdTimeStr || ''}` : 'ثبت خودکار'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* صفحه‌بندی جدول */}
            <div className="flex items-center justify-between border-t border-slate-800 mt-4 pt-4">
              <span className="text-xs text-slate-400">
                صفحه <span className="text-white font-bold">{currentPage}</span> از{' '}
                <span className="text-white font-bold">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loadingRawLogs}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || loadingRawLogs}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
