import React, { useState } from 'react';
import { useDashboardData } from '@/services/queries/useDashboardData';
import { useBatches } from '@/services/queries/useProcessChartData';
import { useRealtime } from '@/services/realtime/RealtimeContext';
import { KpiCard } from '@/components/common/KpiCard';
import { StatusCard } from '@/components/common/StatusCard';
import { ChartCard } from '@/components/common/ChartCard';
import { PersianDatePicker } from '@/components/common/PersianDatePicker';
import { ProductionTrendChart } from '@/components/charts/ProductionTrendChart';
import { ReactorComparisonChart } from '@/components/charts/ReactorComparisonChart';
import { ProcessTemperatureChart } from '@/components/charts/ProcessTemperatureChart';
import { ProcessPressureChart } from '@/components/charts/ProcessPressureChart';
import { AcidAndRefluxChart } from '@/components/charts/AcidAndRefluxChart';
import { ProductDistributionChart } from '@/components/charts/ProductDistributionChart';
import { BatchSpeedChart } from '@/components/charts/BatchSpeedChart';
import { RecentLogsTable } from '@/components/data-grid/RecentLogsTable';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Filter, RefreshCw, RotateCcw, Zap, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // فیلترهای فعال داشبورد
  const [selectedReactorId, setSelectedReactorId] = useState<number | undefined>(1); // پیش‌فرض راکتور ۳
  const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined);
  const [fromDateShamsi, setFromDateShamsi] = useState<string>('');
  const [toDateShamsi, setToDateShamsi] = useState<string>('');

  const { triggerTestPulse, fetchLatestActiveBatches } = useRealtime();

  // دریافت لیست بچ‌ها برای دراپ‌داون
  const { data: batches = [], isLoading: isBatchesLoading } = useBatches(selectedReactorId);

  // واکشی داده‌های زنده داشبورد متصل به دیتابیس
  const { data, isLoading, isError, refetch, isFetching } = useDashboardData({
    reactorId: selectedReactorId,
    batchId: selectedBatchId,
    fromDateShamsi: fromDateShamsi || undefined,
    toDateShamsi: toDateShamsi || undefined,
  });

  // پاک‌سازی فیلترها
  const handleResetFilters = () => {
    setSelectedBatchId(undefined);
    setFromDateShamsi('');
    setToDateShamsi('');
  };

  // انتخاب خودکار آخرین بچ فعال راکتور ۳ و ۴
  const handleSelectLatestActiveBatch = async () => {
    const latestList = await fetchLatestActiveBatches();
    const active = latestList.find((b) => b.reactorId === 1) || latestList[0];

    if (active && active.batchId > 0) {
      setSelectedReactorId(active.reactorId);
      setSelectedBatchId(active.batchId);
      if (active.startDateShamsi) setFromDateShamsi(active.startDateShamsi);
      if (active.endDateShamsi) setToDateShamsi(active.endDateShamsi);
    } else if (batches.length > 0) {
      const latest = batches[0];
      setSelectedReactorId(latest.reactorId || 1);
      setSelectedBatchId(latest.batchId);
      if (latest.startDateShamsi) setFromDateShamsi(latest.startDateShamsi);
      if (latest.endDateShamsi) setToDateShamsi(latest.endDateShamsi);
    }
    triggerTestPulse('انتقال خودکار به آخرین بچ فعال راکتور انجام شد.');
  };

  return (
    <div className="flex flex-col gap-3.5 pb-6">
      {/* نوار فیلترهای پیشرفته و تقویم شمسی بالای داشبورد - استایل دارک شیشه‌ای عمیق */}
      <section className="bg-gradient-to-r from-[#112340] via-[#0c1a30] to-[#081224] border border-sky-400/35 rounded-2xl p-3.5 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3 flex-1 min-w-[300px]">
            {/* ۱. انتخاب راکتور */}
            <div className="w-44">
              <label className="block text-[11px] font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                انتخاب راکتور
              </label>
              <select
                value={selectedReactorId ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setSelectedReactorId(val);
                  setSelectedBatchId(undefined);
                }}
                className="w-full bg-[#0b172a] border border-sky-400/35 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              >
                <option value="1">راکتور ۳</option>
                <option value="2">راکتور ۴</option>
                <option value="">همه راکتورها</option>
              </select>
            </div>

            {/* ۲. انتخاب بچ تولیدی */}
            <div className="w-56">
              <label className="block text-[11px] font-bold text-slate-200 mb-1.5">
                شماره بچ
              </label>
              <select
                value={selectedBatchId ?? ''}
                disabled={isBatchesLoading || batches.length === 0}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setSelectedBatchId(val);
                  if (val) {
                    const b = batches.find((item) => item.batchId === val);
                    if (b?.startDateShamsi) setFromDateShamsi(b.startDateShamsi);
                    if (b?.endDateShamsi) setToDateShamsi(b.endDateShamsi);
                  }
                }}
                className="w-full bg-[#0b172a] border border-sky-400/35 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              >
                <option value="">همه بچ‌های این دوره</option>
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    بچ {b.batchNumber} ({b.logCount} لاگ) {b.startDateShamsi ? `[${b.startDateShamsi}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* ۳. تقویم شمسی: از تاریخ */}
            <div className="w-44">
              <PersianDatePicker
                label="از تاریخ شمسی"
                value={fromDateShamsi}
                onChange={setFromDateShamsi}
                placeholder="۱۴۰۴/۰۱/۰۱"
              />
            </div>

            {/* ۴. تقویم شمسی: تا تاریخ */}
            <div className="w-44">
              <PersianDatePicker
                label="تا تاریخ شمسی"
                value={toDateShamsi}
                onChange={setToDateShamsi}
                placeholder="۱۴۰۴/۱۲/۲۹"
              />
            </div>
          </div>

          {/* دکمه‌های کنترل و عملیات زنده */}
          <div className="flex flex-wrap items-center gap-2">
            {/* دکمه اختصاصی آخرین بچ فعال راکتورها */}
            <button
              type="button"
              onClick={handleSelectLatestActiveBatch}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-200 bg-amber-500/25 hover:bg-amber-500/35 active:scale-95 rounded-xl transition-all border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              title="نمایش خودکار آخرین بچ فعال راکتورها"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>آخرین بچ فعال</span>
            </button>

            {/* دکمه تست نبض SignalR */}
            <button
              type="button"
              onClick={() => triggerTestPulse('دیتا بروز شد')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-200 bg-emerald-500/25 hover:bg-emerald-500/35 active:scale-95 rounded-xl transition-all border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              title="تست بلادرنگ ارسال پالس ضربان قلب و نبض نمودارها"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>تست نبض سیگنال‌آر</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl transition-all border border-white/10"
              title="پاک کردن فیلترها"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              بازنشانی
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-95 rounded-xl shadow-[0_0_16px_rgba(14,165,233,0.35)] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              بروزرسانی
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <LoadingState message="در حال واکشی اطلاعات زنده از پایگاه داده خط تولید..." className="h-[65vh]" />
      ) : isError || !data ? (
        <ErrorState
          title="عدم دریافت داده‌های داشبورد"
          message="امکان واکشی شاخص‌های عملیاتی از سرور وجود ندارد."
          onRetry={() => refetch()}
          className="h-[65vh]"
        />
      ) : (
        <>
          {/* ردیف اول: کارت‌های شاخص عملکرد کلیدی (KPIs) و وضعیت خط تولید جاری با تم‌های غنی و رنگی */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.id} metric={kpi} />
            ))}
            <StatusCard status={data.statusInfo} />
          </section>

          {/* بخش میانی: نمودارها با تمام عرض و تم‌های غنی و رنگ‌های متمایز و مشخص */}
          <section className="w-full flex flex-col gap-3.5">
            {/* ردیف بالایی: روند تولید و آبگیری + مقایسه بین راکتورها */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              <ChartCard
                title="روند تولید و آبگیری"
                subtitle="سرعت تولید و مقادیر تجمعی محصول و آبگیری"
                theme="cyan"
                className="lg:col-span-7 h-[330px]"
              >
                <ProductionTrendChart
                  dates={data.productionTrend.dates}
                  azgRates={data.productionTrend.azgRates}
                  agRates={data.productionTrend.agRates}
                  azgCumulative={data.productionTrend.azgCumulative}
                  agCumulative={data.productionTrend.agCumulative}
                />
              </ChartCard>

              <ChartCard
                title="مقایسه تولید بین راکتورها"
                subtitle="مقایسه حجم AZG و AG بین واحدهای واکنش"
                theme="indigo"
                className="lg:col-span-5 h-[330px]"
              >
                <ReactorComparisonChart
                  reactors={data.reactorComparison.reactors}
                  azgTotal={data.reactorComparison.azgTotal}
                  agTotal={data.reactorComparison.agTotal}
                />
              </ChartCard>
            </div>

            {/* ردیف وسط: پارامترهای فیزیکی فرآیند با تم‌های غنی تفکیک‌شده */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <ChartCard
                title="دمای فرآیند"
                subtitle="روغن ورودی، بالای ستون و ریفلاکس"
                theme="emerald"
                className="h-[250px]"
              >
                <ProcessTemperatureChart
                  times={data.processTemperature.times}
                  reactorTemp={data.processTemperature.reactorTemp}
                  columnTopTemp={data.processTemperature.columnTopTemp}
                  refluxTemp={data.processTemperature.refluxTemp}
                />
              </ChartCard>

              <ChartCard
                title="فشار فرآیند"
                subtitle="راکتور، بالای ستون و کندانسور"
                theme="indigo"
                className="h-[250px]"
              >
                <ProcessPressureChart
                  times={data.processPressure.times}
                  reactorPressure={data.processPressure.reactorPressure}
                  columnTopPressure={data.processPressure.columnTopPressure}
                  condenserPressure={data.processPressure.condenserPressure}
                />
              </ChartCard>

              <ChartCard
                title="عدد اسیدی و ریفلاکس"
                subtitle="نسبت برگشت و اسیدیته"
                theme="purple"
                className="h-[250px]"
              >
                <AcidAndRefluxChart
                  times={data.acidAndReflux.times}
                  acidNumber={data.acidAndReflux.acidNumber}
                  refluxRatio={data.acidAndReflux.refluxRatio}
                />
              </ChartCard>
            </div>

            {/* ردیف پایینی: آخرین اطلاعات ثبت شده + توزیع محصول + میانگین سرعت در بچ‌ها */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              <div className="lg:col-span-5 h-[250px]">
                <RecentLogsTable logs={data.recentLogs} />
              </div>

              <ChartCard
                title="توزیع انواع محصول (AG و AZG)"
                subtitle="درصد تفکیک اجزا در خروجی خط"
                theme="default"
                className="lg:col-span-3 h-[250px]"
              >
                <ProductDistributionChart data={data.productDistribution} />
              </ChartCard>

              <ChartCard
                title="میانگین سرعت تولید در بچ‌های اخیر"
                subtitle="سرعت تولید بر حسب لیتر/کیلوگرم بر ساعت"
                theme="amber"
                className="lg:col-span-4 h-[250px]"
              >
                <BatchSpeedChart data={data.batchSpeedAverages} />
              </ChartCard>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
