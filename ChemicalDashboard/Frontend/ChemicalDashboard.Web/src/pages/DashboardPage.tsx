import React from 'react';
import { useDashboardData } from '@/services/queries/useDashboardData';
import { KpiCard } from '@/components/common/KpiCard';
import { StatusCard } from '@/components/common/StatusCard';
import { ChartCard } from '@/components/common/ChartCard';
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

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return <LoadingState message="در حال بارگذاری شاخص‌ها و اطلاعات خط تولید..." className="h-[75vh]" />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="عدم دریافت داده‌های داشبورد"
        message="امکان واکشی شاخص‌های عملیاتی از سرور وجود ندارد."
        onRetry={() => refetch()}
        className="h-[75vh]"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3.5 pb-6">
      {/* ردیف اول: کارت‌های شاخص عملکرد کلیدی (KPIs) و وضعیت خط تولید جاری */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} metric={kpi} />
        ))}
        <StatusCard status={data.statusInfo} />
      </section>

      {/* بخش میانی: نمودارها همراه با پنل تنظیمات در سمت چپ (یا راست در ساختار RTL) */}
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
            <ChartCard title="دمای فرآیند" subtitle="راکتور، بالای ستون و ریفلاکس" className="h-[235px]">
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
              title="توزیع انواع محصول (AG)"
              subtitle="درصد تفکیک اجزا در سپراتور"
              className="lg:col-span-3 h-[235px]"
            >
              <ProductDistributionChart data={data.productDistribution} />
            </ChartCard>

            <ChartCard
              title="میانگین سرعت تولید در بچ‌های اخیر"
              subtitle="سرعت تولید بر حسب لیتر بر ساعت"
              className="lg:col-span-4 h-[235px]"
            >
              <BatchSpeedChart data={data.batchSpeedAverages} />
            </ChartCard>
          </div>
        </div>

        {/* پنل ابزار و تنظیمات نمودارها در سمت راست (۳ ستون از ۱۲ ستون) */}
        <div className="xl:col-span-3 flex flex-col">
          <ChartControlsPanel />
        </div>
      </section>
    </div>
  );
};
