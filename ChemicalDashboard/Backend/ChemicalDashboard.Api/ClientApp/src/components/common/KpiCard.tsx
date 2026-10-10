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

const colorStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  amber: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.12)]',
  },
  blue: {
    bg: 'bg-sky-500/15',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.12)]',
  },
  green: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.12)]',
  },
  red: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.12)]',
  },
  purple: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.12)]',
  },
  cyan: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.12)]',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({ metric }) => {
  const style = colorStyles[metric.colorScheme] || colorStyles.blue;
  const Icon = iconMap[metric.colorScheme] || FlaskConical;
  const isUp = metric.trendDirection === 'up';

  return (
    <div
      className={`relative flex items-center justify-between p-4 rounded-xl bg-[#0f1c34]/90 border border-slate-700/40 backdrop-blur-md transition-all duration-200 hover:border-slate-600/60 ${style.glow}`}
    >
      {/* سمت راست: محتوا، عنوان، مقدار و برچسب روند */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs font-semibold text-slate-300 truncate">
          {metric.titleFa}
        </span>

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-black tracking-tight text-white font-['BYekan']">
            {typeof metric.value === 'number' ? metric.value.toLocaleString('fa-IR') : metric.value}
          </span>
          {metric.unit && (
            <span className="text-xs text-slate-400 font-medium">
              {metric.unit}
            </span>
          )}
        </div>

        {/* برچسب روند */}
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
              isUp ? 'text-emerald-400' : 'text-rose-400'
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
        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${style.bg} ${style.border}`}
      >
        <Icon className={`w-6 h-6 ${style.text}`} />
      </div>
    </div>
  );
};
