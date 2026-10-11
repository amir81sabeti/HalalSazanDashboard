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

  // وضعیت فیلتر راکتور و بچ آبشاری
  const [selectedReactorId, setSelectedReactorId] = useState<number | undefined>(undefined);
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
        // بچ با بیشترین لاگ یا اولین بچ را انتخاب کن
        const bestBatch = batches.find((b) => b.logCount > 0) || batches[0];
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

  // محاسبه خلاصه آماری برای شاخص‌های فعال
  const metricStats = useMemo(() => {
    if (!chartPoints.length) return [];
    return AVAILABLE_METRICS.filter((m) => activeKeys.has(m.key)).map((m) => {
      const values = chartPoints.map((p) => Number(p[m.key]) || 0);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
      const last = values[values.length - 1] || 0;
      return {
        ...m,
        min: min.toFixed(2),
        max: max.toFixed(2),
        avg: avg.toFixed(2),
        last: last.toFixed(2),
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
      {/* هدر صفحه: نام ابزار، نشان اتصال دیتابیس و دکمه‌های کنترلی */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 font-title">
                استودیو تحلیل و نمودارساز پیشرفته فرآیند
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                دیتابیس زنده HalalSazan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ترسیم داینامیک و چندمتغیره پارامترهای ترمودینامیکی و سینتیکی فرآیند استریفیکاسیون از روی استورد پروسیجر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>خروجی CSV (اکسل)</span>
          </button>
          <button
            type="button"
            onClick={handleExportImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>دانلود تصویر نمودار</span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بازخوانی داده‌ها</span>
          </button>
        </div>
      </div>

      {/* نوار فیلتر آبشاری: انتخاب راکتور -> فیلتر خودکار بچ -> بازه زمانی شمسی */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>فیلتر آبشاری راکتور و بچ (Cascading Filter)</span>
          </div>
          {activeBatchInfo && (
            <span className="text-[11px] text-slate-500 font-semibold">
              بچ فعال: شماره بچ {activeBatchInfo.batchNumber} (راکتور {activeBatchInfo.reactorId === 1 ? '۳' : '۴'}) | دارای {activeBatchInfo.logCount} لاگ ثبت‌شده
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* ۱. انتخاب راکتور */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              انتخاب واحد واکنش (راکتور)
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setSelectedReactorId(undefined)}
                className={`py-1 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedReactorId === undefined
                    ? 'bg-white text-amber-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                همه
              </button>
              <button
                type="button"
                onClick={() => setSelectedReactorId(1)}
                className={`py-1 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedReactorId === 1
                    ? 'bg-white text-amber-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                راکتور ۳
              </button>
              <button
                type="button"
                onClick={() => setSelectedReactorId(2)}
                className={`py-1 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedReactorId === 2
                    ? 'bg-white text-amber-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                راکتور ۴
              </button>
            </div>
          </div>

          {/* ۲. انتخاب بچ فیلتر شده */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              شماره بچ (فقط بچ‌های راکتور انتخابی)
            </label>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
            >
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  بچ {b.batchNumber} (راکتور {b.reactorId === 1 ? '۳' : '۴'}) - {b.logCount} لاگ فرآیندی {b.startDateShamsi ? `[${b.startDateShamsi}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* ۳. فیلتر بازه تاریخ شمسی */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              از تاریخ شمسی
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="1405/06/10"
                value={fromDateShamsi}
                onChange={(e) => setFromDateShamsi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-2 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              تا تاریخ شمسی
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="1405/06/20"
                value={toDateShamsi}
                onChange={(e) => setToDateShamsi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-2 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
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
              className="w-full py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ریست
            </button>
          </div>
        </div>
      </div>

      {/* ردیف کارت‌های آماری شاخص‌های فعال */}
      {metricStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {metricStats.map((stat) => (
            <div
              key={stat.key}
              className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col justify-between"
              style={{ borderRight: `3.5px solid ${stat.color}` }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span className="truncate" title={stat.label}>{stat.label}</span>
                <span className="text-[10px] text-slate-400">({stat.unit})</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black text-slate-900 font-numeric">
                  {stat.last}
                </span>
                <span className="text-[10px] text-slate-500">جاری</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 mt-1 border-t border-slate-100">
                <span>میانگین: {stat.avg}</span>
                <span>ماکز: {stat.max}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* بخش اصلی نمودار و پنل انتخابگر شاخص‌ها در دو ستون */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* بلوک نمودار داینامیک (۹ ستون از ۱۲ ستون) */}
        <div className="xl:col-span-9 flex flex-col gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col">
            {/* نوار تنظیمات بالای نمودار: نوع نمودار، محور X، مقیاس چندگانه */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-800">تنظیمات رسم نمودار:</span>

                {/* انتخاب نوع نمودار */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 mr-2">
                  <button
                    type="button"
                    onClick={() => setChartType('line')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      chartType === 'line' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    خطی (Line)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('area')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      chartType === 'area' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    مساحتی (Area)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('bar')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      chartType === 'bar' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    میله‌ای (Bar)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* انتخاب محور افقی X */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">محور افقی (X):</span>
                  <select
                    value={xAxisMode}
                    onChange={(e) => setXAxisMode(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="dateTime">تاریخ و ساعت کامل</option>
                    <option value="time">فقط ساعت شیفت</option>
                    <option value="step">شماره ردیف فرآیند</option>
                  </select>
                </div>

                {/* مقیاس چندگانه Multi-Axis */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={multiAxis}
                    onChange={(e) => setMultiAxis(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-0 accent-amber-500 w-3.5 h-3.5"
                  />
                  <span>مقیاس چندمحوره (Multi-Axis)</span>
                </label>

                {/* نرم کردن خطوط */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={smoothCurves}
                    onChange={(e) => setSmoothCurves(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-0 accent-amber-500 w-3.5 h-3.5"
                  />
                  <span>منحنی نرم</span>
                </label>
              </div>
            </div>

            {/* بوم رندر ECharts */}
            <div className="w-full h-[510px] relative">
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
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>تعداد کل نقاط ثبت‌شده: <strong className="text-slate-800">{chartPoints.length}</strong> لاگ</span>
                <span>•</span>
                <span>تعداد شاخص‌های فعال: <strong className="text-amber-600">{activeKeys.size}</strong> شاخص</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTable((prev) => !prev)}
                className="flex items-center gap-1 text-slate-700 hover:text-amber-600 font-bold transition-colors cursor-pointer"
              >
                <Table className="w-3.5 h-3.5" />
                <span>{showTable ? 'مخفی کردن جدول لاگ‌ها' : 'مشاهده جدول خام داده‌ها'}</span>
              </button>
            </div>
          </div>

          {/* جدول جمع‌شونده داده‌های خام لاگ */}
          {showTable && chartPoints.length > 0 && (
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">
                  جدول ثبت لاگ‌های بچ {activeBatchInfo?.batchNumber} (راکتور {activeBatchInfo?.reactorId === 1 ? '۳' : '۴'})
                </h3>
                <span className="text-[11px] text-slate-400">مطابق داده‌های دیتابیس HalalSazan</span>
              </div>
              <div className="max-h-72 overflow-y-auto overflow-x-auto text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold text-[11px]">
                      <th className="p-2">#</th>
                      <th className="p-2">ساعت</th>
                      <th className="p-2">تاریخ شمسی</th>
                      <th className="p-2">سرعت AZG</th>
                      <th className="p-2">حجم AZG</th>
                      <th className="p-2">سرعت AG</th>
                      <th className="p-2">حجم AG</th>
                      <th className="p-2">دمای ستون (°C)</th>
                      <th className="p-2">فشار راکتور (bar)</th>
                      <th className="p-2">عدد اسیدی</th>
                      <th className="p-2">اپراتور</th>
                      <th className="p-2">توضیحات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartPoints.map((p, i) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors text-slate-700 font-semibold"
                      >
                        <td className="p-2 text-slate-400">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{p.inspectionTime}</td>
                        <td className="p-2">{p.logDateShamsi}</td>
                        <td className="p-2 text-amber-600">{p.productSpeed}</td>
                        <td className="p-2 text-amber-700">{p.productAmount}</td>
                        <td className="p-2 text-cyan-600">{p.agSpeed}</td>
                        <td className="p-2 text-blue-600">{p.agAmount}</td>
                        <td className="p-2 text-pink-600">{p.distillationTopTemp}</td>
                        <td className="p-2 text-indigo-600">{p.reactorPressure}</td>
                        <td className="p-2 text-emerald-600">{p.acidNumber}</td>
                        <td className="p-2 text-slate-800">{p.operatorName}</td>
                        <td className="p-2 text-slate-500 text-[11px] max-w-xs truncate" title={p.description}>
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
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">انتخاب شاخص‌های نمودار</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {activeKeys.size} فعال
              </span>
            </div>

            <p className="text-[11px] text-slate-500 py-2 leading-relaxed">
              هر کدام از شاخص‌های زیر را تیک بزنید تا به صورت زنده و با مقیاس مستقل به نمودار اضافه شوند:
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {categories.map((cat) => {
                const catMetrics = AVAILABLE_METRICS.filter((m) => m.category === cat.id);
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span>{cat.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => selectCategoryAll(cat.id)}
                          className="text-amber-600 hover:underline cursor-pointer"
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
                          <label
                            key={m.key}
                            onClick={() => toggleMetric(m.key)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'bg-white text-slate-900 border border-slate-200/80 shadow-2xs'
                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: m.color }}
                              />
                              <span className="text-[11px]">{m.label}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">({m.unit})</span>
                          </label>
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
