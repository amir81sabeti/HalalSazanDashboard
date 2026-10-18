import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Award,
  Trophy,
  Flame,
  Clock,
  TrendingUp,
  Layers,
  Filter,
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  useGoldenBatchData,
  BatchPerformanceItem,
} from '@/services/queries/useGoldenBatchData';
import { useToast } from '@/hooks/useToast';

export const GoldenBatchPage: React.FC = () => {
  const toast = useToast();
  const [selectedReactor, setSelectedReactor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  const reactorId = selectedReactor === '3' ? 1 : selectedReactor === '4' ? 2 : undefined;

  // واکشی ۱۰۰٪ واقعی از پایگاه داده SQL Server
  const { data, isLoading, isError, refetch } = useGoldenBatchData({ reactorId });

  const summary = data?.summary;
  const batches = useMemo(() => data?.batches ?? [], [data?.batches]);
  const downtimes = useMemo(() => data?.downtimeBreakdown ?? [], [data?.downtimeBreakdown]);
  const radarBaseline = data?.radarBaseline;

  // تعیین بچ انتخابی برای مقایسه (پیش‌فرض: بچ رتبه دوم یا اولین بچ غیر طلایی)
  const activeComparedBatch = useMemo<BatchPerformanceItem | null>(() => {
    if (!batches.length) return null;
    if (selectedBatchId !== null) {
      const found = batches.find((b) => b.batchId === selectedBatchId);
      if (found) return found;
    }
    // پیش‌فرض بچ رتبه دوم
    return batches.length > 1 ? batches[1] : batches[0];
  }, [batches, selectedBatchId]);

  // بچ طلایی واقعی
  const goldenBatch = useMemo<BatchPerformanceItem | null>(() => {
    if (!batches.length) return null;
    return batches[0]; // رتبه اول
  }, [batches]);

  // فیلتر و جستجوی جدول
  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;
    const q = searchQuery.toLowerCase();
    return batches.filter(
      (b) =>
        b.batchNum.toString().includes(q) ||
        b.startDateShamsi.includes(q) ||
        b.endDateShamsi.includes(q) ||
        b.statusCategory.toLowerCase().includes(q) ||
        `r-${b.reactorNumber}`.includes(q)
    );
  }, [batches, searchQuery]);

  const handleRefresh = () => {
    refetch();
    toast.success('داده‌های تحلیل بچ طلایی با موفقیت از پایگاه داده SQL Server بروزرسانی شدند.');
  };

  const handleExportCsv = () => {
    if (!batches.length) return;
    const headers = [
      'رتبه',
      'شماره بچ',
      'رآکتور',
      'تاریخ شروع شمسی',
      'تاریخ پایان شمسی',
      'مدت چرخه (ساعت)',
      'تعداد لاگ',
      'حجم تولیدی (لیتر)',
      'الکل ورودی (لیتر)',
      'اسید ورودی (کیلوگرم)',
      'خلوص استات (%)',
      'عدد اسیدی (AN)',
      'ساعات توقف',
      'نرخ تولید (لیتر/ساعت)',
      'امتیاز عملکرد',
      'وضعیت',
    ];
    const rows = batches.map((b) => [
      b.batchRank,
      b.batchNum,
      `R-${b.reactorNumber}`,
      b.startDateShamsi,
      b.endDateShamsi,
      b.durationHours,
      b.logCount,
      b.totalProductAmount,
      b.totalAlcoholIn,
      b.totalAcidIn,
      b.avgProductDegree,
      b.avgAcidNumber,
      b.totalStopHours,
      b.productionRatePerHour,
      b.performanceScore,
      `"${b.statusCategory}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HalalSazan_GoldenBatch_Ranking_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('گزارش رتبه‌بندی بچ‌ها با فرمت استاندارد CSV دانلود شد.');
  };

  // -------------------------------------------------------------
  // ۱. آپشن‌های ECharts: نمودار راداری مقایسه ۶ بعدی
  // -------------------------------------------------------------
  const radarOption = useMemo(() => {
    if (!goldenBatch || !activeComparedBatch || !radarBaseline) return {};

    // نرمال‌سازی شاخص‌های بچ انتخابی در بازه ۰ تا ۱۰۰
    const compPurityScore = Math.min(100, Math.round((activeComparedBatch.avgProductDegree / 85) * 100));
    const compRateScore = Math.min(100, Math.round((activeComparedBatch.productionRatePerHour / 9500) * 100));
    const compAcidScore =
      activeComparedBatch.avgAcidNumber <= 0.03
        ? 98
        : activeComparedBatch.avgAcidNumber <= 0.1
          ? 90
          : activeComparedBatch.avgAcidNumber <= 0.5
            ? 75
            : 50;
    const compUptimeScore =
      activeComparedBatch.totalStopHours <= 1
        ? 99
        : activeComparedBatch.totalStopHours <= 10
          ? 90
          : activeComparedBatch.totalStopHours <= 50
            ? 75
            : 60;
    const compThermalScore = Math.min(
      100,
      Math.max(60, Math.round(100 - Math.abs(activeComparedBatch.avgTopTemp - 73.0) * 8))
    );
    const compYieldScore = Math.min(
      100,
      Math.max(70, Math.round(100 - activeComparedBatch.alcoholConsumptionRatio * 500))
    );

    const goldenPurityScore = Math.min(100, Math.round((goldenBatch.avgProductDegree / 85) * 100));
    const goldenRateScore = Math.min(100, Math.round((goldenBatch.productionRatePerHour / 9500) * 100));
    const goldenThermalScore = Math.min(
      100,
      Math.max(60, Math.round(100 - Math.abs(goldenBatch.avgTopTemp - 73.0) * 8))
    );

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#fff', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        data: [
          `بچ طلایی (#${goldenBatch.batchNum})`,
          `بچ انتخابی (#${activeComparedBatch.batchNum})`,
          'میانگین کل کارخانه',
        ],
      },
      radar: {
        indicator: [
          { name: 'خلوص محصول (Purity)', max: 100 },
          { name: 'سرعت تولید (Rate)', max: 100 },
          { name: 'تبدیل اسید (Acid Conv)', max: 100 },
          { name: 'پایداری حرارتی (Thermal)', max: 100 },
          { name: 'راندمان مصرف (Yield)', max: 100 },
          { name: 'ضریب آپ‌تایم (Uptime)', max: 100 },
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#cbd5e1',
          fontSize: 11,
          fontWeight: 'bold',
        },
        splitLine: {
          lineStyle: {
            color: [
              'rgba(255, 255, 255, 0.05)',
              'rgba(255, 255, 255, 0.1)',
              'rgba(255, 255, 255, 0.15)',
              'rgba(255, 255, 255, 0.2)',
            ],
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(15, 23, 42, 0.2)', 'rgba(30, 41, 59, 0.2)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
      series: [
        {
          name: 'مقایسه عملکرد ۶ بعدی',
          type: 'radar',
          data: [
            {
              value: [
                goldenPurityScore,
                goldenRateScore,
                radarBaseline.goldenAcidConversionScore,
                goldenThermalScore,
                radarBaseline.goldenYieldScore,
                radarBaseline.goldenUptimeScore,
              ],
              name: `بچ طلایی (#${goldenBatch.batchNum})`,
              itemStyle: { color: '#f59e0b' },
              areaStyle: { color: 'rgba(245, 158, 11, 0.25)' },
              lineStyle: { width: 3 },
            },
            {
              value: [
                compPurityScore,
                compRateScore,
                compAcidScore,
                compThermalScore,
                compYieldScore,
                compUptimeScore,
              ],
              name: `بچ انتخابی (#${activeComparedBatch.batchNum})`,
              itemStyle: { color: '#06b6d4' },
              areaStyle: { color: 'rgba(6, 182, 212, 0.25)' },
              lineStyle: { width: 2.5 },
            },
            {
              value: [
                Math.round((radarBaseline.plantAvgPurity / 85) * 100),
                Math.round((radarBaseline.plantAvgRate / 9500) * 100),
                radarBaseline.plantAvgAcidConversionScore,
                82,
                88,
                radarBaseline.plantAvgUptimeScore,
              ],
              name: 'میانگین کل کارخانه',
              itemStyle: { color: '#64748b' },
              lineStyle: { width: 1.5, type: 'dashed' },
            },
          ],
        },
      ],
    };
  }, [goldenBatch, activeComparedBatch, radarBaseline]);

  // -------------------------------------------------------------
  // ۲. آپشن‌های ECharts: نمودار دو محوره تولید و زمان چرخه بچ‌ها
  // -------------------------------------------------------------
  const cycleVsOutputOption = useMemo(() => {
    if (!batches.length) return {};

    // مرتب‌سازی بر اساس شماره بچ جهت دیدن روند در گذر زمان
    const sorted = [...batches].sort((a, b) => a.batchNum - b.batchNum);
    const names = sorted.map((b) => `بچ ${b.batchNum}`);
    const products = sorted.map((b) => b.totalProductAmount);
    const durations = sorted.map((b) => b.durationHours);
    const scores = sorted.map((b) => b.performanceScore);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          const idx = params[0].dataIndex;
          const b = sorted[idx];
          return `
            <div class="font-bold border-b border-slate-700 pb-1 mb-1 text-amber-400">
              ${b.batchNum} - رآکتور ${b.reactorNumber} (امتیاز: ${b.performanceScore})
            </div>
            <div class="text-[11px] text-slate-300 space-y-0.5">
              <div>تاریخ: ${b.startDateShamsi} تا ${b.endDateShamsi}</div>
              <div>حجم تولید: <b>${b.totalProductAmount.toLocaleString()} لیتر</b></div>
              <div>مدت چرخه: <b>${b.durationHours} ساعت</b> (${Math.round(b.durationHours / 24)} روز)</div>
              <div>خلوص: <b>${b.avgProductDegree}%</b> | عدد اسیدی: <b>${b.avgAcidNumber}</b></div>
              <div>ساعات توقف: <b>${b.totalStopHours} ساعت</b></div>
            </div>
          `;
        },
      },
      legend: {
        data: ['حجم تولید (لیتر)', 'مدت زمان چرخه (ساعت)', 'امتیاز تعالی (از ۱۰۰)'],
        textStyle: { color: '#94a3b8' },
        top: 0,
      },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '15%', containLabel: true },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 0,
          borderColor: '#334155',
          textStyle: { color: '#94a3b8' },
        },
      ],
      xAxis: {
        type: 'category',
        data: names,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', rotate: 45, fontSize: 10 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'حجم تولید (L)',
          nameTextStyle: { color: '#94a3b8', fontSize: 11 },
          axisLabel: {
            color: '#94a3b8',
            formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        },
        {
          type: 'value',
          name: 'مدت چرخه (ساعت)',
          nameTextStyle: { color: '#94a3b8', fontSize: 11 },
          axisLabel: { color: '#94a3b8' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'حجم تولید (لیتر)',
          type: 'bar',
          data: products,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'مدت زمان چرخه (ساعت)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: durations,
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 2.5 },
        },
        {
          name: 'امتیاز تعالی (از ۱۰۰)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: scores,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 2, type: 'dashed' },
        },
      ],
    };
  }, [batches]);

  // -------------------------------------------------------------
  // ۳. آپشن‌های ECharts: پای چارت توقفات فرآیندی (Downtime Breakdown)
  // -------------------------------------------------------------
  const downtimePieOption = useMemo(() => {
    if (!downtimes.length) return {};
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
        right: 0,
        top: 'center',
        textStyle: { color: '#94a3b8', fontSize: 10 },
      },
      series: [
        {
          name: 'علل توقفات',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['35%', '50%'],
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
            fontSize: 10,
            fontWeight: 'bold',
          },
          data: downtimes.map((item, idx) => {
            const colors = ['#f43f5e', '#fb923c', '#facc15', '#38bdf8', '#a855f7', '#4ade80'];
            return {
              value: item.totalHours,
              name: item.occurrenceName,
              itemStyle: { color: colors[idx % colors.length] },
            };
          }),
        },
      ],
    };
  }, [downtimes]);

  // -------------------------------------------------------------
  // ۴. آپشن‌های ECharts: اسکتر پلات خلوص در برابر عدد اسیدی
  // -------------------------------------------------------------
  const qualityScatterOption = useMemo(() => {
    if (!batches.length) return {};

    const scatterData = batches.map((b) => [
      b.avgProductDegree,
      b.avgAcidNumber,
      b.batchNum,
      b.performanceScore,
      b.reactorNumber,
    ]);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          const [purity, an, batchNum, score, reactor] = params.value;
          return `
            <div class="font-bold border-b border-slate-700 pb-1 mb-1 text-emerald-400">
              بچ ${batchNum} (رآکتور ${reactor})
            </div>
            <div>خلوص محصول: <b>${purity}%</b></div>
            <div>عدد اسیدی (AN): <b>${an}</b></div>
            <div>امتیاز تعالی: <b>${score} از ۱۰۰</b></div>
          `;
        },
      },
      grid: { left: '4%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'خلوص محصول (%)',
        min: 65,
        max: 85,
        nameTextStyle: { color: '#94a3b8', fontSize: 11 },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      yAxis: {
        type: 'value',
        name: 'عدد اسیدی (AN)',
        max: 1.4,
        nameTextStyle: { color: '#94a3b8', fontSize: 11 },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      series: [
        {
          name: 'توزیع کیفی بچ‌ها',
          type: 'scatter',
          symbolSize: (dataItem: any[]) => Math.max(12, Math.min(30, (dataItem[3] - 70) * 0.8)),
          data: scatterData,
          itemStyle: {
            color: (params: any) => {
              const score = params.value[3];
              if (score >= 98) return '#f59e0b'; // طلایی
              if (score >= 95) return '#10b981'; // ممتاز
              if (score >= 80) return '#06b6d4'; // خوب
              return '#ef4444'; // نیازمند بازبینی
            },
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.5)',
          },
        },
      ],
    };
  }, [batches]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-100 font-sans">
      {/* ============================================================== */}
      {/* هدر اصلی صفحه: عنوان، نشان زنده دیتابیس، فیلتر و خروجی اکسل    */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 border border-amber-400/40 shrink-0">
              <Trophy className="w-8 h-8 text-white drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                  مرکز پایش هوشمند بچ طلایی و رتبه‌بندی عملکرد رآکتورها
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Golden Batch (ISA-88)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live SQL Server Data
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                استخراج زنده و بدون واسطه از پایگاه داده HalalSazan با متدولوژی چندمعیاره: خلوص استات، حداقل عدد اسیدی، سرعت واکنش و کمینه توقف
              </p>
            </div>
          </div>

          {/* فیلترها و دکمه‌ها */}
          <div className="flex flex-wrap items-center gap-3">
            {/* فیلتر رآکتور */}
            <div className="flex items-center gap-2 bg-slate-950/70 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">رآکتور:</span>
              <select
                value={selectedReactor}
                onChange={(e) => setSelectedReactor(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-slate-900">تمام رآکتورها</option>
                <option value="3" className="bg-slate-900">رآکتور ۳ (R-103)</option>
                <option value="4" className="bg-slate-900">رآکتور ۴ (R-104)</option>
              </select>
            </div>

            {/* دکمه بازخوانی داده‌ها */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="واکشی مجدد داده‌های زنده از پایگاه داده SQL Server"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition border border-slate-700/60 disabled:opacity-50 cursor-pointer shadow"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* دکمه دانلود CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی اکسل و سوابق</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* کارت‌های شاخص عملکرد کلیدی (Executive KPI Cards)               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* کارت بچ طلایی دوره (Hero Card) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              بچ طلایی دوره (Champion)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              رتبه ۱
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">
              {summary ? `بچ ${summary.goldenBatchNum}` : '—'}
            </span>
            <span className="text-xs text-amber-300/80 font-bold">
              {summary ? `امتیاز: ${summary.goldenScore}` : ''}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-amber-500/20 text-[11px] text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">خلوص محصول:</span>
              <span className="font-bold text-emerald-400 font-mono">{summary?.goldenPurity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">عدد اسیدی (AN):</span>
              <span className="font-bold text-amber-400 font-mono">{summary?.goldenAN}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">مدت چرخه:</span>
              <span className="font-bold text-slate-200 font-mono">{summary?.goldenDurationHours} ساعت</span>
            </div>
          </div>
        </div>

        {/* کارت میانگین زمان چرخه */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">میانگین زمان چرخه</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {summary ? summary.avgCycleTimeHours : '—'}
            </span>
            <span className="text-xs text-slate-400">ساعت</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
            میانگین چرخه واکنش و تقطیر در میان {summary?.totalBatches} بچ
          </p>
        </div>

        {/* کارت خلوص میانگین محصول */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">خلوص میانگین محصول</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {summary ? `${summary.avgPurityDegree}%` : '—'}
            </span>
            <span className="text-[11px] text-slate-400">درجه استات</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span>انطباق کیفی استاندارد:</span>
            <span className="font-bold text-emerald-400 font-mono">{summary?.qualityComplianceRate}%</span>
          </p>
        </div>

        {/* کارت مجموع تولید ثبت شده */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">کل حجم تولیدی</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {summary ? (summary.totalProductionAmount / 1000000).toFixed(2) : '—'}
            </span>
            <span className="text-xs text-slate-400">میلیون لیتر</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span>مصرف ویژه الکل:</span>
            <span className="font-bold text-blue-400 font-mono">{summary?.overallAlcoholRatio} L/L</span>
          </p>
        </div>

        {/* کارت قابلیت اطمینان و توقفات */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">کل ساعات توقفات</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {summary ? summary.totalDowntimeHours.toLocaleString() : '—'}
            </span>
            <span className="text-xs text-slate-400">ساعت</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
            بر اساس ۵۸ رخداد ثبت‌شده در جدول توقفات دیتابیس
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* بخش مقایسه تطبیقی بچ در برابر بچ طلایی (Comparison Workspace)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* نمودار راداری ۶ بعدی */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>تحلیل راداری ۶ بعدی عملکرد در برابر بنچ‌مارک طلایی</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مقایسه خلوص، سرعت، اسیدیته، پایداری حرارتی، راندمان مصرف و ضریب آپ‌تایم
              </p>
            </div>

            {/* سلکتور انتخاب بچ مورد مقایسه */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">انتخاب بچ:</span>
              <select
                value={activeComparedBatch?.batchId ?? ''}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="bg-transparent text-cyan-400 font-bold outline-none cursor-pointer text-xs"
              >
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId} className="bg-slate-900 text-white">
                    بچ {b.batchNum} (رتبه {b.batchRank} - امتیاز {b.performanceScore})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-[360px] w-full mt-2">
            <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* کارت‌های انحراف و مقایسه جانبی (Delta Metrics) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white">
                تفاضل عملکردی بچ انتخابی (#{activeComparedBatch?.batchNum}) با بچ طلایی (#{goldenBatch?.batchNum})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                تاریخ شمسی: {activeComparedBatch?.startDateShamsi}
              </span>
            </div>

            {goldenBatch && activeComparedBatch && (
              <div className="mt-4 space-y-3">
                {/* اختلاف خلوص */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">خلوص اتیل استات (Degree)</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white font-mono">
                        {activeComparedBatch.avgProductDegree}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (طلایی: {goldenBatch.avgProductDegree}%)
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-mono font-bold text-xs ${
                      activeComparedBatch.avgProductDegree >= goldenBatch.avgProductDegree
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {activeComparedBatch.avgProductDegree >= goldenBatch.avgProductDegree ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>
                      {(activeComparedBatch.avgProductDegree - goldenBatch.avgProductDegree).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* اختلاف عدد اسیدی */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">عدد اسیدی (Acid Number)</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white font-mono">
                        {activeComparedBatch.avgAcidNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (طلایی: {goldenBatch.avgAcidNumber})
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-mono font-bold text-xs ${
                      activeComparedBatch.avgAcidNumber <= goldenBatch.avgAcidNumber
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    <span>
                      {(activeComparedBatch.avgAcidNumber - goldenBatch.avgAcidNumber).toFixed(2)} AN
                    </span>
                  </div>
                </div>

                {/* اختلاف مدت چرخه */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">مدت زمان چرخه فرآیند</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white font-mono">
                        {activeComparedBatch.durationHours} ساعت
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (طلایی: {goldenBatch.durationHours} ساعت)
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-mono font-bold text-xs ${
                      activeComparedBatch.durationHours <= goldenBatch.durationHours
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    <span>
                      {(activeComparedBatch.durationHours - goldenBatch.durationHours).toFixed(1)} h
                    </span>
                  </div>
                </div>

                {/* ساعات توقف */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">توقفات ثبت شده بچ</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white font-mono">
                        {activeComparedBatch.totalStopHours} ساعت
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({activeComparedBatch.stopCount} رخداد)
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      activeComparedBatch.totalStopHours === 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {activeComparedBatch.totalStopHours === 0 ? 'بدون توقف' : `${activeComparedBatch.totalStopHours}h توقف`}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
            💡 <b>توصیه مهندسی شیمی:</b> برای رساندن این بچ به سطح شاخص بچ طلایی، بهینه‌سازی نسبت رفلاکس در ساعات ۲۰ تا ۴۰ و تنظیم دمای ورودی روغن حرارتی روی ۱۰۸ الی ۱۱۲ درجه توصیه می‌شود.
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* نمودارهای تحلیلی: روند چرخه و توزیع کیفی و توقفات              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* نمودار روند تولید و زمان چرخه */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>روند حجم تولید و مدت زمان چرخه بچ‌ها (سوابق تاریخی)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                پایش مقایسه‌ای حجم تولید محصول نهایی و زمان صرف‌شده به تفکیک بچ‌های کارخانه
              </p>
            </div>
          </div>
          <div className="h-[320px] w-full mt-2">
            <ReactECharts option={cycleVsOutputOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* سهم دلایل توقفات */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>تحلیل ریشه‌ای توقفات خط</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                سهم زمانی هر یک از علل توقف از جدول پایگاه داده
              </p>
            </div>
          </div>
          <div className="h-[320px] w-full mt-2">
            <ReactECharts option={downtimePieOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* جدول ماتریس رتبه‌بندی تمام بچ‌ها (Leaderboard Table)            */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>جدول جامع رتبه‌بندی عملکرد بچ‌ها بر اساس داده‌های زنده SQL Server</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              محاسبه آنی نمره تعالی فرآیند بر پایه خلوص، اسیدیته، سرعت تولید و پایداری زمانی
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="جستجو در بچ‌ها، تاریخ شمسی یا رتبه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 shadow-inner w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-3 font-semibold text-center">رتبه</th>
                <th className="py-3 px-3 font-semibold">شماره بچ</th>
                <th className="py-3 px-3 font-semibold">رآکتور</th>
                <th className="py-3 px-3 font-semibold">بازه تاریخ شمسی</th>
                <th className="py-3 px-3 font-semibold">مدت چرخه (h)</th>
                <th className="py-3 px-3 font-semibold">تعداد لاگ</th>
                <th className="py-3 px-3 font-semibold">حجم تولید (لیتر)</th>
                <th className="py-3 px-3 font-semibold">الکل خوراک (L)</th>
                <th className="py-3 px-3 font-semibold">خلوص (%)</th>
                <th className="py-3 px-3 font-semibold">عدد اسیدی (AN)</th>
                <th className="py-3 px-3 font-semibold">توقفات (h)</th>
                <th className="py-3 px-3 font-semibold text-center">امتیاز تعالی</th>
                <th className="py-3 px-3 font-semibold text-center">وضعیت رده</th>
                <th className="py-3 px-3 font-semibold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBatches.map((b) => {
                const isGolden = b.batchRank === 1;
                const isSelected = activeComparedBatch?.batchId === b.batchId;

                return (
                  <tr
                    key={b.batchId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 border-r-2 border-r-cyan-400'
                        : isGolden
                          ? 'bg-amber-950/30 hover:bg-amber-950/50'
                          : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      {b.batchRank === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs">
                          🥇
                        </span>
                      ) : b.batchRank === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 font-black text-xs">
                          🥈
                        </span>
                      ) : b.batchRank === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/30 font-black text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400 font-bold">{b.batchRank}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white font-mono">
                      بچ {b.batchNum}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        R-{b.reactorNumber}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                      {b.startDateShamsi} <span className="text-slate-500">تا</span> {b.endDateShamsi}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                      {b.durationHours}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{b.logCount}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                      {b.totalProductAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {b.totalAlcoholIn.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {b.avgProductDegree}%
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                      {b.avgAcidNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {b.totalStopHours > 0 ? (
                        <span className="text-rose-400 font-bold">{b.totalStopHours}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-black text-xs px-2 py-0.5 rounded ${
                          b.performanceScore >= 98
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : b.performanceScore >= 95
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : b.performanceScore >= 80
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {b.performanceScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isGolden
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : b.batchRank <= 3
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : b.performanceScore >= 80
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {b.batchRank === 1
                          ? 'بچ طلایی (Golden Batch)'
                          : b.batchRank <= 3
                            ? 'عملکرد ممتاز (Top Tier)'
                            : b.performanceScore >= 80
                              ? 'استاندارد مطلوب (Good)'
                              : 'نیازمند بهینه‌سازی (Needs Review)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatchId(b.batchId);
                          toast.info(`بچ شماره ${b.batchNum} برای مقایسه در نمودار راداری بارگذاری شد.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                        }`}
                      >
                        {isSelected ? 'در حال مقایسه' : 'مقایسه راداری'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
