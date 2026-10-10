import React from 'react';
import { FlaskConical, Droplet, Thermometer, Gauge, Database, ArrowUp, ArrowDown } from 'lucide-react';
import type { KpiMetric } from '@/types';

interface KpiCardProps {
  metric: KpiMetric;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  amber: FlaskConical,
  blue: Droplet,
  green: Thermometer,
  red: Gauge,
  purple: Database,
  cyan: FlaskConical,
};

const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  blue: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-200',
  },
  green: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  red: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({ metric }) => {
  const style = colorStyles[metric.colorScheme] || colorStyles.blue;
  const Icon = iconMap[metric.colorScheme] || FlaskConical;
  const isUp = metric.trendDirection === 'up';

  return (
    <div
      className="relative flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs transition-all duration-200 hover:shadow-sm"
    >
      {/* سمت راست: محتوا، عنوان، مقدار و برچسب روند */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-bold text-slate-600 truncate">
          {metric.titleFa}
        </span>

        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-2xl font-black tracking-tight text-slate-900 font-['BYekan']">
            {typeof metric.value === 'number' ? metric.value.toLocaleString('fa-IR') : metric.value}
          </span>
          {metric.unit && (
            <span className="text-xs text-slate-500 font-medium">
              {metric.unit}
            </span>
          )}
        </div>

        {/* برچسب روند */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
              isUp ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(metric.trendPercentage)}%
          </span>
          <span className="text-[10px] text-slate-400">
            {metric.trendLabel}
          </span>
        </div>
      </div>

      {/* سمت چپ: آیکون گرد شاخص */}
      <div
        className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${style.bg} ${style.border}`}
      >
        <Icon className={`w-5 h-5 ${style.text}`} />
      </div>
    </div>
  );
};
