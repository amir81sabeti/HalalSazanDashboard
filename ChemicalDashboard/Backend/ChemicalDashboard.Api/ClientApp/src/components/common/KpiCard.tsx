import React from 'react';
import { FlaskConical, Droplet, Thermometer, Gauge, Database, ArrowUp, ArrowDown } from 'lucide-react';
import type { KpiMetric } from '@/types';
import { useRealtime } from '@/services/realtime/RealtimeContext';

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

const colorStyles: Record<
  string,
  {
    cardBg: string;
    border: string;
    glow: string;
    iconBg: string;
    iconBorder: string;
    iconText: string;
    trendPositive: string;
    trendNegative: string;
  }
> = {
  blue: {
    cardBg: 'bg-gradient-to-b from-[#112d59] via-[#0c2243] to-[#08172e]',
    border: 'border-sky-400/40 hover:border-sky-300',
    glow: 'shadow-[0_6px_24px_-4px_rgba(14,165,233,0.28)] hover:shadow-[0_8px_32px_rgba(14,165,233,0.4)]',
    iconBg: 'bg-sky-500/25',
    iconBorder: 'border-sky-400/40',
    iconText: 'text-sky-200',
    trendPositive: 'text-emerald-300',
    trendNegative: 'text-rose-300',
  },
  purple: {
    cardBg: 'bg-gradient-to-b from-[#331448] via-[#240d33] to-[#180822]',
    border: 'border-purple-400/40 hover:border-purple-300',
    glow: 'shadow-[0_6px_24px_-4px_rgba(168,85,247,0.28)] hover:shadow-[0_8px_32px_rgba(168,85,247,0.4)]',
    iconBg: 'bg-purple-500/25',
    iconBorder: 'border-purple-400/40',
    iconText: 'text-purple-200',
    trendPositive: 'text-emerald-300',
    trendNegative: 'text-rose-300',
  },
  red: {
    cardBg: 'bg-gradient-to-b from-[#3d1323] via-[#2c0c18] to-[#1c070f]',
    border: 'border-rose-400/40 hover:border-rose-300',
    glow: 'shadow-[0_6px_24px_-4px_rgba(244,63,94,0.28)] hover:shadow-[0_8px_32px_rgba(244,63,94,0.4)]',
    iconBg: 'bg-rose-500/25',
    iconBorder: 'border-rose-400/40',
    iconText: 'text-rose-200',
    trendPositive: 'text-emerald-300',
    trendNegative: 'text-rose-300',
  },
  green: {
    cardBg: 'bg-gradient-to-b from-[#0c3a2d] via-[#08291f] to-[#051c15]',
    border: 'border-emerald-400/40 hover:border-emerald-300',
    glow: 'shadow-[0_6px_24px_-4px_rgba(16,185,129,0.28)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.4)]',
    iconBg: 'bg-emerald-500/25',
    iconBorder: 'border-emerald-400/40',
    iconText: 'text-emerald-200',
    trendPositive: 'text-emerald-300',
    trendNegative: 'text-rose-300',
  },
  cyan: {
    cardBg: 'bg-gradient-to-b from-[#0c313d] via-[#08232c] to-[#05171d]',
    border: 'border-teal-400/40 hover:border-teal-300',
    glow: 'shadow-[0_6px_24px_-4px_rgba(20,184,166,0.28)] hover:shadow-[0_8px_32px_rgba(20,184,166,0.4)]',
    iconBg: 'bg-teal-500/25',
    iconBorder: 'border-teal-400/40',
    iconText: 'text-teal-200',
    trendPositive: 'text-emerald-300',
    trendNegative: 'text-rose-300',
  },
  amber: {
    cardBg: 'bg-gradient-to-b from-[#3d270e] via-[#2b1b08] to-[#1b1004]',
    border: 'border-amber-400/45 hover:border-amber-300',
    glow: 'shadow-[0_6px_24px_-4px_rgba(245,158,11,0.28)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)]',
    iconBg: 'bg-amber-500/25',
    iconBorder: 'border-amber-400/40',
    iconText: 'text-amber-200',
    trendPositive: 'text-emerald-300',
    trendNegative: 'text-rose-300',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({ metric }) => {
  const { isPulsing } = useRealtime();
  const style = colorStyles[metric.colorScheme] || colorStyles.blue;
  const Icon = iconMap[metric.colorScheme] || FlaskConical;
  const isUp = metric.trendDirection === 'up';

  return (
    <div
      className={`relative flex items-center justify-between p-3.5 pt-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
        style.cardBg
      } ${style.border} ${style.glow} ${isPulsing ? 'heartbeat-pulse' : ''}`}
    >
      {/* سمت راست: محتوا، عنوان، مقدار و برچسب روند */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-bold text-slate-200 truncate">
          {metric.titleFa}
        </span>

        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-2xl font-black tracking-tight text-white font-['BYekan']">
            {typeof metric.value === 'number' ? metric.value.toLocaleString('fa-IR') : metric.value}
          </span>
          {metric.unit && (
            <span className="text-xs text-slate-300 font-medium">
              {metric.unit}
            </span>
          )}
        </div>

        {/* برچسب روند با فلش جهت */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
              isUp ? style.trendPositive : style.trendNegative
            }`}
          >
            {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(metric.trendPercentage)}%
          </span>
          <span className="text-[10px] text-slate-300">
            {metric.trendLabel}
          </span>
        </div>
      </div>

      {/* سمت چپ: آیکون گرد شاخص با شید نئونی */}
      <div
        className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${style.iconBg} ${style.iconBorder}`}
      >
        <Icon className={`w-5 h-5 ${style.iconText}`} />
      </div>
    </div>
  );
};
