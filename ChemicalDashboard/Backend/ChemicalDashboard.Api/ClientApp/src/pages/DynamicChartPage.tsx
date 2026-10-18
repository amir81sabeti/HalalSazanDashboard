import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsInstance } from 'echarts-for-react';
import {
  Layers,
  Filter,
  SlidersHorizontal,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Maximize2,
  Table,
  CheckSquare,
  Square,
  Activity,
  Droplets,
  Thermometer,
  Gauge,
  FlaskConical,
  Sparkles,
  Info,
  RotateCcw,
  TrendingUp,
  Check,
} from 'lucide-react';
import {
  useBatches,
  useProcessChartData,
  type ProcessChartPoint,
} from '@/services/queries/useProcessChartData';
import { formatToShamsiLong } from '@/utils/persianDate';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useToast } from '@/hooks/useToast';
import { PersianDatePicker } from '@/components/common/PersianDatePicker';

interface MetricConfig {
  key: keyof ProcessChartPoint;
  label: string;
  category: 'product' | 'temp' | 'pressure' | 'chemistry';
  unit: string;
  color: string;
  defaultChecked?: boolean;
  axisPosition?: 'left' | 'right';
}

const AVAILABLE_METRICS: MetricConfig[] = [
  // محصول و آبگیری
  { key: 'productSpeed', label: 'سرعت محصول (AZG)', category: 'product', unit: 'L/h', color: '#f59e0b', defaultChecked: true },
  { key: 'productAmount', label: 'حجم کل محصول (AZG)', category: 'product', unit: 'L', color: '#d97706' },
  { key: 'agSpeed', label: 'سرعت آبگیری (AG)', category: 'product', unit: 'L/h', color: '#06b6d4', defaultChecked: true },
  { key: 'agAmount', label: 'حجم کل آبگیری (AG)', category: 'product', unit: 'L', color: '#3b82f6' },

  // دماها
  { key: 'distillationTopTemp', label: 'دمای بالای ستون تقطیر', category: 'temp', unit: '°C', color: '#ec4899', defaultChecked: true },
  { key: 'oilInputTemp', label: 'دمای روغن ورودی', category: 'temp', unit: '°C', color: '#ef4444' },
  { key: 'condenserWaterTemp', label: 'دمای آب ورود کندانسور', category: 'temp', unit: '°C', color: '#10b981' },
  { key: 'condenserOutWaterTemp', label: 'دمای آب خروج کندانسور', category: 'temp', unit: '°C', color: '#14b8a6' },
  { key: 'refluxFluidTemp', label: 'دمای سیال ریفلاکس', category: 'temp', unit: '°C', color: '#a855f7' },

  // فشارها
  { key: 'reactorPressure', label: 'فشار راکتور', category: 'pressure', unit: 'bar', color: '#3b82f6', defaultChecked: true },
  { key: 'distillationTopPressure', label: 'فشار بالای برج تقطیر', category: 'pressure', unit: 'bar', color: '#6366f1' },
  { key: 'oilInputPressure', label: 'فشار روغن ورودی', category: 'pressure', unit: 'bar', color: '#f97316' },
  { key: 'condenserWaterPressure', label: 'فشار آب کندانسور', category: 'pressure', unit: 'bar', color: '#8b5cf6' },

  // کیفی و شیمیایی
  { key: 'acidNumber', label: 'عدد اسیدی (AN)', category: 'chemistry', unit: 'mg KOH/g', color: '#84cc16' },
  { key: 'productDegree', label: 'درجه محصول', category: 'chemistry', unit: '%', color: '#10b981' },
  { key: 'refluxAmount', label: 'میزان ریفلاکس', category: 'chemistry', unit: 'L/h', color: '#8b5cf6' },
  { key: 'reactorLevel', label: 'اندازه سطح راکتور', category: 'chemistry', unit: 'cm', color: '#64748b' },
  { key: 'alcoholLiter', label: 'الکل ورودی', category: 'chemistry', unit: 'L', color: '#f43f5e' },
  { key: 'acidKg', label: 'اسید ورودی', category: 'chemistry', unit: 'Kg', color: '#475569' },
];

export const DynamicChartPage: React.FC = () => {
  const toast = useToast();
  const echartsRef = useRef<ReactECharts>(null);

  // وضعیت فیلتر راکتور و بچ آبشاری (پیش‌فرض راکتور ۳ با ۳۵ بچ وارد شده از اکسل)
  const [selectedReactorId, setSelectedReactorId] = useState<number | undefined>(1);
  const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined);

  // وضعیت تاریخ شمسی
  const [fromDateShamsi, setFromDateShamsi] = useState<string>('');
  const [toDateShamsi, setToDateShamsi] = useState<string>('');

  // تنظیمات محور و شاخص‌ها
  const [xAxisMode, setXAxisMode] = useState<'time' | 'dateTime' | 'step'>('dateTime');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [multiAxis, setMultiAxis] = useState<boolean>(true);
  const [smoothCurves, setSmoothCurves] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(false);

  // شاخص‌های انتخاب‌شده (پیش‌فرض ۴ شاخص حیاتی فرآیند)
  const [activeKeys, setActiveKeys] = useState<Set<keyof ProcessChartPoint>>(
    new Set(['productSpeed', 'agSpeed', 'distillationTopTemp', 'reactorPressure'])
  );

  // ۱. واکشی لیست بچ‌ها به تفکیک راکتور (Cascading Dropdown)
  const {
    data: batches = [],
    isLoading: isBatchesLoading,
    refetch: refetchBatches,
  } = useBatches(selectedReactorId);

  // به‌روزرسانی خودکار بچ انتخاب‌شده در صورت تغییر راکتور یا اولین بارگذاری
  useEffect(() => {
    if (batches.length > 0) {
      const currentExists = batches.some((b) => b.batchId === selectedBatchId);
      if (!currentExists) {
        // اولویت با بچ ۱ (۴۰۰۰۱۹) یا بچ با لاگ فرآیندی
        const bestBatch =
          batches.find((b) => b.batchId === 400019) ||
          batches.find((b) => b.logCount > 0) ||
          batches[0];
        setSelectedBatchId(bestBatch.batchId);
        if (bestBatch.startDateShamsi) setFromDateShamsi(bestBatch.startDateShamsi);
        if (bestBatch.endDateShamsi) setToDateShamsi(bestBatch.endDateShamsi);
      }
    }
  }, [batches, selectedBatchId]);

  // ۲. واکشی داده‌های نقاط نمودار بر اساس فیلترهای جاری
  const {
    data: chartPoints = [],
    isLoading: isDataLoading,
    isError,
    refetch: refetchData,
  } = useProcessChartData({
    reactorId: selectedReactorId,
    batchId: selectedBatchId,
    fromDateShamsi: fromDateShamsi || undefined,
    toDateShamsi: toDateShamsi || undefined,
  });

  const toggleMetric = (key: keyof ProcessChartPoint) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) {
          toast.warning('حداقل یک شاخص باید برای رسم نمودار فعال باشد.', 'شاخص نمودار');
          return prev;
        }
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectCategoryAll = (cat: 'product' | 'temp' | 'pressure' | 'chemistry') => {
    const catKeys = AVAILABLE_METRICS.filter((m) => m.category === cat).map((m) => m.key);
    setActiveKeys((prev) => {
      const next = new Set(prev);
      catKeys.forEach((k) => next.add(k));
      return next;
    });
  };

  const unselectCategoryAll = (cat: 'product' | 'temp' | 'pressure' | 'chemistry') => {
    const catKeys = AVAILABLE_METRICS.filter((m) => m.category === cat).map((m) => m.key);
    setActiveKeys((prev) => {
      const next = new Set(prev);
      catKeys.forEach((k) => {
        if (next.size > 1) next.delete(k);
      });
      return next;
    });
  };

  // اطلاعات بچ جاری انتخاب شده
  const activeBatchInfo = useMemo(() => {
    return batches.find((b) => b.batchId === selectedBatchId);
  }, [batches, selectedBatchId]);

  // دسته‌بندی فیلدها برای انتخابگر
  const categories = useMemo(() => {
    return [
      { id: 'product', title: 'محصول و آبگیری (AZG & AG)', icon: Droplets, color: 'text-amber-500' },
      { id: 'temp', title: 'دماهای فرآیند (°C)', icon: Thermometer, color: 'text-pink-500' },
      { id: 'pressure', title: 'فشارهای سیستم (bar)', icon: Gauge, color: 'text-blue-500' },
      { id: 'chemistry', title: 'شاخص‌های کیفی و خوراک', icon: FlaskConical, color: 'text-emerald-500' },
    ] as const;
  }, []);

  // محاسبه خلاصه آماری برای شاخص‌های فعال با آیکون‌های متناسب
  const metricStats = useMemo(() => {
    if (!chartPoints.length) return [];
    return AVAILABLE_METRICS.filter((m) => activeKeys.has(m.key)).map((m) => {
      const values = chartPoints.map((p) => Number(p[m.key]) || 0);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
      const nonZero = values.filter((v) => v > 0);
      const operating = nonZero.length > 0 ? nonZero[nonZero.length - 1] : (values[values.length - 1] || 0);
      const last = values[values.length - 1] || 0;

      let IconComponent = Activity;
      if (m.category === 'product') IconComponent = Droplets;
      else if (m.category === 'temp') IconComponent = Thermometer;
      else if (m.category === 'pressure') IconComponent = Gauge;
      else if (m.category === 'chemistry') IconComponent = FlaskConical;

      return {
        ...m,
        min: min.toFixed(2),
        max: max.toFixed(2),
        avg: avg.toFixed(2),
        last: last.toFixed(2),
        operating: operating.toFixed(2),
        IconComponent,
      };
    });
  }, [chartPoints, activeKeys]);

  // تنظیمات گزینه‌های ECharts
  const chartOption = useMemo(() => {
    if (!chartPoints.length) return {};

    // تولید برچسب‌های محور X
    const xLabels = chartPoints.map((p, idx) => {
      if (xAxisMode === 'time') return p.inspectionTime || `نقطه ${idx + 1}`;
      if (xAxisMode === 'step') return `#${idx + 1}`;
      return `${p.logDateShamsi} ${p.inspectionTime}`;
    });

    const activeMetricList = AVAILABLE_METRICS.filter((m) => activeKeys.has(m.key));

    // تعریف محورهای Y
    let yAxes: any[] = [];
    if (multiAxis) {
      yAxes = activeMetricList.map((m, index) => {
        const isRight = index % 2 === 1;
        return {
          type: 'value',
          name: `${m.label} (${m.unit})`,
          nameTextStyle: {
            color: m.color,
            fontSize: 10,
            fontFamily: 'BYekan',
            padding: [0, isRight ? 10 : 0, 0, isRight ? 0 : 10],
          },
          position: isRight ? 'right' : 'left',
          offset: Math.floor(index / 2) * 55,
          axisLine: {
            show: true,
            lineStyle: { color: m.color, width: 1.5 },
          },
          splitLine: {
            show: index === 0,
            lineStyle: { color: '#e2e8f0', type: 'dashed' },
          },
          axisLabel: {
            color: '#64748b',
            fontSize: 10,
            fontFamily: 'BYekan',
          },
        };
      });
    } else {
      yAxes = [
        {
          type: 'value',
          axisLine: { show: true, lineStyle: { color: '#94a3b8' } },
          splitLine: { show: true, lineStyle: { color: '#e2e8f0', type: 'dashed' } },
          axisLabel: { color: '#64748b', fontFamily: 'BYekan' },
        },
      ];
    }

    // تولید سری‌های نمودار
    const series = activeMetricList.map((m, index) => {
      const dataValues = chartPoints.map((p) => Number(p[m.key]) || 0);

      const baseSeries: any = {
        name: m.label,
        type: chartType === 'area' ? 'line' : chartType,
        yAxisIndex: multiAxis ? index : 0,
        data: dataValues,
        smooth: smoothCurves,
        itemStyle: { color: m.color },
        symbol: chartPoints.length > 50 ? 'none' : 'circle',
        symbolSize: 6,
      };

      if (chartType === 'area') {
        baseSeries.areaStyle = {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${m.color}88` },
              { offset: 1, color: `${m.color}05` },
            ],
          },
        };
      }

      if (chartType === 'line' || chartType === 'area') {
        baseSeries.lineStyle = { width: 2.5, color: m.color };
      }

      return baseSeries;
    });

    return {
      backgroundColor: '#ffffff',
      animationDuration: 800,
      grid: {
        top: 60,
        right: multiAxis ? Math.max(70, Math.ceil(activeMetricList.length / 2) * 55) : 50,
        bottom: 75,
        left: multiAxis ? Math.max(70, Math.ceil(activeMetricList.length / 2) * 55) : 55,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#0f172a',
            fontFamily: 'BYekan',
          },
        },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {
          color: '#f8fafc',
          fontFamily: 'BYekan',
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (!params || !params.length) return '';
          const dataIndex = params[0].dataIndex;
          const point = chartPoints[dataIndex];
          if (!point) return '';

          let res = `<div style="font-weight:bold; color:#fbbf24; margin-bottom:6px; font-size:12px; border-bottom:1px solid #334155; padding-bottom:4px;">
            راکتور ${point.reactorId === 1 ? '۳' : point.reactorId === 2 ? '۴' : point.reactorId} | بچ ${point.batchNumber} | تاریخ ${point.logDateShamsi} (ساعت ${point.inspectionTime})
          </div>`;

          if (point.operatorName) {
            res += `<div style="color:#94a3b8; font-size:11px; margin-bottom:4px;">اپراتور: ${point.operatorName}</div>`;
          }

          params.forEach((item: any) => {
            const metric = activeMetricList.find((m) => m.label === item.seriesName);
            const unit = metric ? metric.unit : '';
            res += `<div style="display:flex; justify-content:space-between; gap:16px; margin:3px 0; font-size:11px;">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.color};margin-left:6px;"></span>${item.seriesName}:</span>
              <strong style="color:#fff">${item.value} ${unit}</strong>
            </div>`;
          });

          if (point.description) {
            res += `<div style="color:#e2e8f0; font-size:10px; margin-top:6px; padding-top:4px; border-top:1px dashed #334155; max-width:240px;">
              توضیحات: ${point.description}
            </div>`;
          }

          return res;
        },
      },
      legend: {
        top: 10,
        type: 'scroll',
        textStyle: {
          fontFamily: 'BYekan',
          color: '#334155',
          fontSize: 11,
        },
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: chartType === 'bar',
        axisLine: { lineStyle: { color: '#94a3b8' } },
        axisLabel: {
          color: '#475569',
          fontFamily: 'BYekan',
          fontSize: 10,
          rotate: xAxisMode === 'dateTime' ? 30 : 0,
        },
      },
      yAxis: yAxes,
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          bottom: 10,
          height: 22,
          borderColor: '#e2e8f0',
          fillerColor: 'rgba(245, 158, 11, 0.15)',
          handleStyle: { color: '#f59e0b' },
          textStyle: { color: '#64748b', fontFamily: 'BYekan', fontSize: 10 },
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          zoomOnMouseWheel: true,
        },
      ],
      series: series,
    };
  }, [chartPoints, activeKeys, xAxisMode, chartType, multiAxis, smoothCurves]);

  // ذخیره تصویر چارت با کیفیت بالا
  const handleExportImage = () => {
    const inst = echartsRef.current?.getEchartsInstance();
    if (!inst) return;
    const url = inst.getDataURL({
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    const a = document.createElement('a');
    a.href = url;
    a.download = `HalalSazan_ProcessChart_Batch_${activeBatchInfo?.batchNumber || 'Report'}.png`;
    a.click();
    toast.success('تصویر نمودار با رزولوشن بالا دانلود گردید.', 'دانلود تصویر');
  };

  // خروجی CSV از نقاط داده فیلتر شده
  const handleExportCSV = () => {
    if (!chartPoints.length) {
      toast.warning('داده‌ای برای خروجی اکسل وجود ندارد.', 'هشدار');
      return;
    }
    const headers = [
      'ردیف',
      'راکتور',
      'شماره بچ',
      'تاریخ شمسی',
      'ساعت',
      'سرعت AZG',
      'حجم AZG',
      'سرعت AG',
      'حجم AG',
      'دمای ستون',
      'فشار راکتور',
      'عدد اسیدی',
      'اپراتور',
    ];
    const rows = chartPoints.map((p, idx) => [
      idx + 1,
      p.reactorId === 1 ? 'راکتور ۳' : 'راکتور ۴',
      p.batchNumber,
      p.logDateShamsi,
      p.inspectionTime,
      p.productSpeed,
      p.productAmount,
      p.agSpeed,
      p.agAmount,
      p.distillationTopTemp,
      p.reactorPressure,
      p.acidNumber,
      p.operatorName,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chemical_Batch_${activeBatchInfo?.batchNumber || 'Data'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('فایل گزارش CSV با موفقیت تولید و دانلود شد.', 'خروجی اکسل');
  };

  const handleRefresh = () => {
    refetchBatches();
    refetchData();
    toast.info('داده‌های پروسیجر با موفقیت بازخوانی شدند.', 'به‌روزرسانی');
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* هدر صفحه: نام ابزار، نشان اتصال دیتابیس و دکمه‌های کنترلی با استایل مدرن شیشه‌ای */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-gradient-to-r from-white via-slate-50/80 to-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 ring-4 ring-amber-500/10 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 font-title tracking-tight">
                استودیو تحلیل و نمودارساز پیشرفته فرآیند
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                دیتابیس زنده HalalSazan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              ترسیم داینامیک و چندمتغیره پارامترهای ترمودینامیکی و سینتیکی فرآیند استریفیکاسیون از روی استورد پروسیجر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:border-slate-300 hover:shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>خروجی CSV (اکسل)</span>
          </button>
          <button
            type="button"
            onClick={handleExportImage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:border-slate-300 hover:shadow-xs cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>دانلود تصویر نمودار</span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بازخوانی داده‌ها</span>
          </button>
        </div>
      </div>

      {/* نوار فیلتر آبشاری: انتخاب راکتور -> فیلتر خودکار بچ -> بازه زمانی شمسی */}
      <div className="p-4 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span>فیلتر آبشاری راکتور و بچ (Cascading Filter)</span>
          </div>
          {activeBatchInfo && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/80 text-slate-700 text-[11px] font-bold border border-slate-200/70">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>
                بچ فعال: شماره بچ {activeBatchInfo.batchNumber} (راکتور {activeBatchInfo.reactorId === 1 ? '۳' : '۴'})
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-amber-600">{activeBatchInfo.logCount} لاگ ثبت‌شده</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* ۱. انتخاب راکتور به سبک سگمنت‌کنترل مدرن */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              انتخاب واحد واکنش (راکتور)
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSelectedReactorId(undefined)}
                className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedReactorId === undefined
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                همه
              </button>
              <button
                type="button"
                onClick={() => setSelectedReactorId(1)}
                className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedReactorId === 1
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                راکتور ۳
              </button>
              <button
                type="button"
                onClick={() => setSelectedReactorId(2)}
                className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedReactorId === 2
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                راکتور ۴
              </button>
            </div>
          </div>

          {/* ۲. انتخاب بچ فیلتر شده */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              شماره بچ (فقط بچ‌های راکتور انتخابی)
            </label>
            <div className="relative">
              <select
                value={selectedBatchId ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setSelectedBatchId(val);
                  const b = batches.find((item) => item.batchId === val);
                  if (b?.startDateShamsi) setFromDateShamsi(b.startDateShamsi);
                  if (b?.endDateShamsi) setToDateShamsi(b.endDateShamsi);
                }}
                disabled={isBatchesLoading}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    بچ {b.batchNumber} (راکتور {b.reactorId === 1 ? '۳' : '۴'}) - {b.logCount} لاگ فرآیندی {b.startDateShamsi ? `[${b.startDateShamsi}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ۳. فیلتر بازه تاریخ شمسی با تقویم */}
          <div className="md:col-span-2">
            <PersianDatePicker
              label="از تاریخ شمسی"
              value={fromDateShamsi}
              onChange={setFromDateShamsi}
              placeholder="۱۴۰۴/۰۱/۰۱"
            />
          </div>

          <div className="md:col-span-2">
            <PersianDatePicker
              label="تا تاریخ شمسی"
              value={toDateShamsi}
              onChange={setToDateShamsi}
              placeholder="۱۴۰۴/۱۲/۲۹"
            />
          </div>

          {/* دکمه پاک‌سازی بازه تاریخ */}
          <div className="md:col-span-1">
            <button
              type="button"
              onClick={() => {
                if (activeBatchInfo) {
                  setFromDateShamsi(activeBatchInfo.startDateShamsi || '');
                  setToDateShamsi(activeBatchInfo.endDateShamsi || '');
                } else {
                  setFromDateShamsi('');
                  setToDateShamsi('');
                }
              }}
              title="بازنشانی تاریخ به پیش‌فرض بچ"
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ریست</span>
            </button>
          </div>
        </div>
      </div>

      {/* ردیف کارت‌های شاخص‌های کلیدی (طراحی لوکس مطابق رفرنس اصلی داشبورد با باکس آیکون پاستلی) */}
      {metricStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {metricStats.map((stat) => {
            const Icon = stat.IconComponent;
            // نمایش عدد شاخص: برای حجم تجمیعی، مقدار ماکزیمم کل را نشان بده. برای سرعت، پیک و میانگین عملیاتی
            const isCumulative = stat.key === 'productAmount' || stat.key === 'agAmount';
            const displayValue = isCumulative
              ? stat.max
              : stat.last !== '0.00'
              ? stat.last
              : stat.operating !== '0.00'
              ? stat.operating
              : stat.max;

            const valueBadgeText = isCumulative ? 'مجموع کل' : stat.last !== '0.00' ? 'جاری' : 'پیک عملیاتی';

            return (
              <div
                key={stat.key}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-500 truncate" title={stat.label}>
                      {stat.label}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-2xl lg:text-3xl font-black text-slate-900 font-numeric tracking-tight">
                        {Number(displayValue).toLocaleString('fa-IR')}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-numeric">
                        {stat.unit}
                      </span>
                    </div>
                  </div>

                  {/* باکس آیکون پاستلی رنگی مطابق رفرنس اصلی داشبورد */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                      border: `1.5px solid ${stat.color}30`,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* فوتر اطلاعات آماری کارت */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span>▲</span>
                    <span>{valueBadgeText}</span>
                  </div>
                  <div className="text-slate-500 font-medium">
                    میانگین: <strong className="text-slate-800 font-numeric">{Number(stat.avg).toLocaleString('fa-IR')}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* بخش اصلی نمودار و پنل انتخابگر شاخص‌ها در دو ستون */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* بلوک نمودار داینامیک (۹ ستون از ۱۲ ستون) */}
        <div className="xl:col-span-9 flex flex-col gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col">
            {/* نوار تنظیمات بالای نمودار: نوع نمودار، محور X، مقیاس چندگانه */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  <span>تنظیمات رسم نمودار:</span>
                </div>

                {/* انتخاب نوع نمودار */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 mr-1">
                  <button
                    type="button"
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      chartType === 'line' ? 'bg-white text-amber-600 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    خطی (Line)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('area')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      chartType === 'area' ? 'bg-white text-amber-600 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    مساحتی (Area)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      chartType === 'bar' ? 'bg-white text-amber-600 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    میله‌ای (Bar)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3.5 flex-wrap">
                {/* انتخاب محور افقی X */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold text-xs">محور افقی (X):</span>
                  <select
                    value={xAxisMode}
                    onChange={(e) => setXAxisMode(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="dateTime">تاریخ و ساعت کامل</option>
                    <option value="time">فقط ساعت شیفت</option>
                    <option value="step">شماره ردیف فرآیند</option>
                  </select>
                </div>

                {/* مقیاس چندگانه Multi-Axis */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={multiAxis}
                    onChange={(e) => setMultiAxis(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-0 accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>مقیاس چندمحوره (Multi-Axis)</span>
                </label>

                {/* نرم کردن خطوط */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={smoothCurves}
                    onChange={(e) => setSmoothCurves(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-0 accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>منحنی نرم</span>
                </label>
              </div>
            </div>

            {/* بوم رندر ECharts */}
            <div className="w-full h-[520px] relative">
              {isDataLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-10">
                  <LoadingState message="در حال استخراج و تحلیل داده‌های استورد پروسیجر..." />
                </div>
              ) : isError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ErrorState
                    title="خطا در اتصال به پروسیجر"
                    message="امکان دریافت داده‌های نمودار وجود ندارد."
                    onRetry={() => refetchData()}
                  />
                </div>
              ) : chartPoints.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Info className="w-8 h-8 text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">
                    هیچ رکوردی برای راکتور و بچ انتخاب‌شده یافت نشد.
                  </p>
                  <p className="text-xs text-slate-400">
                    لطفاً شماره بچ دیگری را انتخاب کرده یا فیلتر راکتور را روی حالت «همه» قرار دهید.
                  </p>
                </div>
              ) : (
                <ReactECharts
                  ref={echartsRef}
                  option={chartOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              )}
            </div>

            {/* نوار فوتر زیر نمودار: دکمه باز کردن جدول داده‌ها */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                  تعداد کل نقاط: <strong className="text-slate-900 font-numeric">{chartPoints.length}</strong> لاگ
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200/60">
                  شاخص‌های فعال: <strong className="text-amber-600 font-numeric">{activeKeys.size}</strong> شاخص
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTable((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-slate-700 hover:text-amber-700 hover:bg-amber-50 border border-slate-200/80 font-bold transition-all cursor-pointer"
              >
                <Table className="w-3.5 h-3.5 text-amber-600" />
                <span>{showTable ? 'بستن جدول خام داده‌ها' : 'مشاهده جدول خام داده‌ها'}</span>
              </button>
            </div>
          </div>

          {/* جدول جمع‌شونده داده‌های خام لاگ با استایل مدرن و های‌لایت پارامترها */}
          {showTable && chartPoints.length > 0 && (
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-black text-slate-800">
                    جدول ثبت لاگ‌های بچ {activeBatchInfo?.batchNumber} (راکتور {activeBatchInfo?.reactorId === 1 ? '۳' : '۴'})
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
                  پایگاه داده HalalSazan
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto overflow-x-auto text-xs rounded-xl border border-slate-200/80">
                <table className="w-full text-right border-collapse">
                  <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs z-10 border-b border-slate-200">
                    <tr className="text-slate-700 font-black text-[11px]">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">ساعت</th>
                      <th className="p-2.5">تاریخ شمسی</th>
                      <th className="p-2.5">سرعت AZG</th>
                      <th className="p-2.5">حجم AZG</th>
                      <th className="p-2.5">سرعت AG</th>
                      <th className="p-2.5">حجم AG</th>
                      <th className="p-2.5">دمای ستون (°C)</th>
                      <th className="p-2.5">فشار راکتور (bar)</th>
                      <th className="p-2.5">عدد اسیدی</th>
                      <th className="p-2.5">درجه خلوص</th>
                      <th className="p-2.5">اپراتور</th>
                      <th className="p-2.5">توضیحات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartPoints.map((p, i) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 odd:bg-white even:bg-slate-50/50 hover:bg-amber-50/40 transition-colors text-slate-700 font-semibold"
                      >
                        <td className="p-2.5 text-slate-400 font-numeric">{i + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 font-numeric">{p.inspectionTime}</td>
                        <td className="p-2.5 font-numeric text-slate-600">{p.logDateShamsi}</td>
                        <td className="p-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-black font-numeric">
                            {p.productSpeed}
                          </span>
                        </td>
                        <td className="p-2.5 font-numeric text-amber-900 font-bold">{p.productAmount}</td>
                        <td className="p-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-black font-numeric">
                            {p.agSpeed}
                          </span>
                        </td>
                        <td className="p-2.5 font-numeric text-cyan-900 font-bold">{p.agAmount}</td>
                        <td className="p-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-black font-numeric">
                            {p.distillationTopTemp}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-black font-numeric">
                            {p.reactorPressure}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black font-numeric">
                            {p.acidNumber}
                          </span>
                        </td>
                        <td className="p-2.5 font-numeric text-slate-700 font-bold">{p.productDegree}%</td>
                        <td className="p-2.5 text-slate-800 font-bold">{p.operatorName || '-'}</td>
                        <td className="p-2.5 text-slate-500 text-[11px] max-w-xs truncate" title={p.description}>
                          {p.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ستون سمت چپ: پنل انتخابگر جامع شاخص‌ها (۳ ستون از ۱۲ ستون) */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-800">انتخاب شاخص‌های نمودار</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black shadow-2xs">
                {activeKeys.size} فعال
              </span>
            </div>

            <p className="text-[11px] text-slate-500 py-2.5 leading-relaxed font-medium">
              هر کدام از شاخص‌های زیر را تیک بزنید تا به صورت زنده و با مقیاس مستقل به نمودار اضافه شوند:
            </p>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
              {categories.map((cat) => {
                const catMetrics = AVAILABLE_METRICS.filter((m) => m.category === cat.id);
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className="border border-slate-200/70 rounded-xl p-3 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span>{cat.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => selectCategoryAll(cat.id)}
                          className="text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                        >
                          همه
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => unselectCategoryAll(cat.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          هیچ‌کدام
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {catMetrics.map((m) => {
                        const isChecked = activeKeys.has(m.key);
                        return (
                          <div
                            key={m.key}
                            onClick={() => toggleMetric(m.key)}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'bg-white text-slate-900 border-r-4 shadow-2xs ring-1 ring-slate-200/80'
                                : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
                            }`}
                            style={isChecked ? { borderRightColor: m.color } : {}}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: m.color }}
                              />
                              <span className="text-[11px]">{m.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-numeric">({m.unit})</span>
                              {isChecked && (
                                <Check className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
