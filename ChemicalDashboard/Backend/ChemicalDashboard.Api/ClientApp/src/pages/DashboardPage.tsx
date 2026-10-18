import React, { useState } from 'react';
import { useDashboardData } from '@/services/queries/useDashboardData';
import { useBatches } from '@/services/queries/useProcessChartData';
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
import { ChartControlsPanel } from '@/components/charts/ChartControlsPanel';
import { RecentLogsTable } from '@/components/data-grid/RecentLogsTable';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Filter, RefreshCw, RotateCcw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // فیلترهای فعال داشبورد
  const [selectedReactorId, setSelectedReactorId] = useState<number | undefined>(1); // پیش‌فرض راکتور ۳
  const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined);
  const [fromDateShamsi, setFromDateShamsi] = useState<string>('');
  const [toDateShamsi, setToDateShamsi] = useState<string>('');

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

  return (
    <div className="flex flex-col gap-3.5 pb-6">
      {/* نوار فیلترهای پیشرفته و تقویم شمسی بالای داشبورد */}
      <section className="bg-white dark:bg-[#0c1428] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3 flex-1 min-w-[300px]">
            {/* ۱. انتخاب راکتور */}
            <div className="w-44">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                انتخاب راکتور
              </label>
              <select
                value={selectedReactorId ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setSelectedReactorId(val);
                  setSelectedBatchId(undefined);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="1">راکتور ۳ (فعال - ۳۵ بچ)</option>
                <option value="2">راکتور ۴</option>
                <option value="">همه راکتورها</option>
              </select>
            </div>

            {/* ۲. انتخاب بچ تولیدی */}
            <div className="w-56">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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

          {/* دکمه‌های کنترل و بروزرسانی */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              title="پاک کردن فیلترها"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              بازنشانی
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
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
          {/* ردیف اول: کارت‌های شاخص عملکرد کلیدی (KPIs) و وضعیت خط تولید جاری */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.id} metric={kpi} />
            ))}
            <StatusCard status={data.statusInfo} />
          </section>

          {/* بخش میانی: نمودارها همراه با پنل تنظیمات */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-3">
            {/* بلوک اصلی نمودارها (۹ ستون از ۱۲ ستون) */}
            <div className="xl:col-span-9 flex flex-col gap-3">
              {/* ردیف بالایی: روند تولید و آبگیری + مقایسه بین راکتورها */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <ChartCard
                  title="روند تولید و آبگیری"
                  subtitle="سرعت تولید و مقادیر تجمعی محصول و آبگیری"
                  className="lg:col-span-7 h-[310px]"
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
                  className="lg:col-span-5 h-[310px]"
                >
                  <ReactorComparisonChart
                    reactors={data.reactorComparison.reactors}
                    azgTotal={data.reactorComparison.azgTotal}
                    agTotal={data.reactorComparison.agTotal}
                  />
                </ChartCard>
              </div>

              {/* ردیف وسط: پارامترهای فیزیکی فرآیند (دما، فشار، عدد اسیدی و ریفلاکس) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ChartCard title="دمای فرآیند" subtitle="روغن ورودی، بالای ستون و ریفلاکس" className="h-[235px]">
                  <ProcessTemperatureChart
                    times={data.processTemperature.times}
                    reactorTemp={data.processTemperature.reactorTemp}
                    columnTopTemp={data.processTemperature.columnTopTemp}
                    refluxTemp={data.processTemperature.refluxTemp}
                  />
                </ChartCard>

                <ChartCard title="فشار فرآیند" subtitle="راکتور، بالای ستون و کندانسور" className="h-[235px]">
                  <ProcessPressureChart
                    times={data.processPressure.times}
                    reactorPressure={data.processPressure.reactorPressure}
                    columnTopPressure={data.processPressure.columnTopPressure}
                    condenserPressure={data.processPressure.condenserPressure}
                  />
                </ChartCard>

                <ChartCard title="عدد اسیدی و ریفلاکس" subtitle="نسبت برگشت و اسیدیته" className="h-[235px]">
                  <AcidAndRefluxChart
                    times={data.acidAndReflux.times}
                    acidNumber={data.acidAndReflux.acidNumber}
                    refluxRatio={data.acidAndReflux.refluxRatio}
                  />
                </ChartCard>
              </div>

              {/* ردیف پایینی: آخرین لاگ‌های ثبت شده + توزیع محصول + میانگین سرعت در بچ‌ها */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-5 h-[235px]">
                  <RecentLogsTable logs={data.recentLogs} />
                </div>

                <ChartCard
                  title="توزیع انواع محصول (AG و AZG)"
                  subtitle="درصد تفکیک اجزا در خروجی خط"
                  className="lg:col-span-3 h-[235px]"
                >
                  <ProductDistributionChart data={data.productDistribution} />
                </ChartCard>

                <ChartCard
                  title="میانگین سرعت تولید در بچ‌های اخیر"
                  subtitle="سرعت تولید بر حسب لیتر/کیلوگرم بر ساعت"
                  className="lg:col-span-4 h-[235px]"
                >
                  <BatchSpeedChart data={data.batchSpeedAverages} />
                </ChartCard>
              </div>
            </div>

            {/* پنل ابزار و تنظیمات نمودارها در سمت چپ */}
            <div className="xl:col-span-3 flex flex-col">
              <ChartControlsPanel />
            </div>
          </section>
        </>
      )}
    </div>
  );
};
