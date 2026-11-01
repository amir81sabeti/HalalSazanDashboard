import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, X, Activity } from 'lucide-react';
import { useRealtime } from '@/services/realtime/RealtimeContext';

export type ChartTheme = 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'indigo' | 'default';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  theme?: ChartTheme;
  allowExpand?: boolean;
}

const themeStyles: Record<
  ChartTheme,
  {
    cardBg: string;
    cardBorder: string;
    hoverBorder: string;
    cardGlow: string;
    headerBg: string;
    headerBorder: string;
    badgeBg: string;
    badgeText: string;
    accentDot: string;
  }
> = {
  cyan: {
    cardBg: 'bg-gradient-to-b from-[#0c313d] via-[#09252e] to-[#061a21]',
    cardBorder: 'border-teal-400/40',
    hoverBorder: 'hover:border-teal-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(20,184,166,0.28)] hover:shadow-[0_8px_36px_rgba(20,184,166,0.45)]',
    headerBg: 'bg-[#0a2933]/80',
    headerBorder: 'border-teal-400/25',
    badgeBg: 'bg-teal-500/20 border border-teal-400/40',
    badgeText: 'text-teal-200',
    accentDot: 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]',
  },
  indigo: {
    cardBg: 'bg-gradient-to-b from-[#132854] via-[#0e1d40] to-[#09142e]',
    cardBorder: 'border-indigo-400/40',
    hoverBorder: 'hover:border-indigo-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(99,102,241,0.28)] hover:shadow-[0_8px_36px_rgba(99,102,241,0.45)]',
    headerBg: 'bg-[#0f2147]/80',
    headerBorder: 'border-indigo-400/25',
    badgeBg: 'bg-indigo-500/20 border border-indigo-400/40',
    badgeText: 'text-indigo-200',
    accentDot: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]',
  },
  emerald: {
    cardBg: 'bg-gradient-to-b from-[#0c3a2c] via-[#092c21] to-[#061f18]',
    cardBorder: 'border-emerald-400/40',
    hoverBorder: 'hover:border-emerald-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(16,185,129,0.28)] hover:shadow-[0_8px_36px_rgba(16,185,129,0.45)]',
    headerBg: 'bg-[#0a3125]/80',
    headerBorder: 'border-emerald-400/25',
    badgeBg: 'bg-emerald-500/20 border border-emerald-400/40',
    badgeText: 'text-emerald-200',
    accentDot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
  },
  purple: {
    cardBg: 'bg-gradient-to-b from-[#331444] via-[#260f33] to-[#1a0a24]',
    cardBorder: 'border-fuchsia-400/40',
    hoverBorder: 'hover:border-fuchsia-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(217,70,239,0.28)] hover:shadow-[0_8px_36px_rgba(217,70,239,0.45)]',
    headerBg: 'bg-[#2a1038]/80',
    headerBorder: 'border-fuchsia-400/25',
    badgeBg: 'bg-fuchsia-500/20 border border-fuchsia-400/40',
    badgeText: 'text-fuchsia-200',
    accentDot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.9)]',
  },
  amber: {
    cardBg: 'bg-gradient-to-b from-[#3d270f] via-[#2d1c0a] to-[#1f1306]',
    cardBorder: 'border-amber-400/45',
    hoverBorder: 'hover:border-amber-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(245,158,11,0.28)] hover:shadow-[0_8px_36px_rgba(245,158,11,0.45)]',
    headerBg: 'bg-[#33200c]/80',
    headerBorder: 'border-amber-400/25',
    badgeBg: 'bg-amber-500/20 border border-amber-400/40',
    badgeText: 'text-amber-200',
    accentDot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
  },
  rose: {
    cardBg: 'bg-gradient-to-b from-[#3d1222] via-[#2e0d19] to-[#200811]',
    cardBorder: 'border-rose-400/40',
    hoverBorder: 'hover:border-rose-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(244,63,94,0.28)] hover:shadow-[0_8px_36px_rgba(244,63,94,0.45)]',
    headerBg: 'bg-[#330f1c]/80',
    headerBorder: 'border-rose-400/25',
    badgeBg: 'bg-rose-500/20 border border-rose-400/40',
    badgeText: 'text-rose-200',
    accentDot: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]',
  },
  default: {
    cardBg: 'bg-gradient-to-b from-[#112340] via-[#0c1a30] to-[#081224]',
    cardBorder: 'border-sky-400/40',
    hoverBorder: 'hover:border-sky-300',
    cardGlow: 'shadow-[0_6px_28px_-4px_rgba(14,165,233,0.28)] hover:shadow-[0_8px_36px_rgba(14,165,233,0.45)]',
    headerBg: 'bg-[#0e1d36]/80',
    headerBorder: 'border-sky-400/25',
    badgeBg: 'bg-sky-500/20 border border-sky-400/40',
    badgeText: 'text-sky-200',
    accentDot: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]',
  },
};

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  className = '',
  theme = 'default',
  allowExpand = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPulsing } = useRealtime();
  const themeConfig = themeStyles[theme] || themeStyles.default;

  // بستن مدال با دکمه Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  return (
    <>
      <div
        className={`relative flex flex-col rounded-2xl overflow-hidden border backdrop-blur-md transition-all duration-300 ${
          themeConfig.cardBg
        } ${themeConfig.cardBorder} ${themeConfig.hoverBorder} ${themeConfig.cardGlow} ${
          isPulsing ? 'heartbeat-pulse' : ''
        } ${className}`}
      >
        {/* هدر کارت با شید مشخص و نقطه نئونی درخشان */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b ${themeConfig.headerBorder} ${themeConfig.headerBg}`}
        >
          <div
            className={
              allowExpand
                ? 'cursor-pointer select-none group flex items-center gap-2.5'
                : 'flex items-center gap-2.5'
            }
            onClick={() => allowExpand && setIsExpanded(true)}
            title={allowExpand ? 'کلیک جهت بزرگ‌نمایی کامل نمودار' : undefined}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${themeConfig.accentDot}`}
            />
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-sky-300 transition-colors">
                <span>{title}</span>
                {allowExpand && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-sky-300">
                    (نمایش بزرگ)
                  </span>
                )}
              </h3>
              {subtitle && (
                <p className="text-[10px] text-slate-300 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {headerAction}

            {allowExpand && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="بزرگ‌نمایی و نمایش تمام‌صفحه نمودار"
                aria-label="بزرگ‌نمایی نمودار"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* محتوای نمودار */}
        <div className="flex-1 p-3 min-h-0 relative">{children}</div>
      </div>

      {/* مدال تمام‌صفحه بزرگ‌نمایی نمودار */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className={`w-full max-w-7xl h-[88vh] flex flex-col ${themeConfig.cardBg} border ${themeConfig.cardBorder} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* نوار عنوان مدال */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${themeConfig.headerBorder} ${themeConfig.headerBg}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${themeConfig.badgeBg}`}>
                  <Activity className={`w-5 h-5 ${themeConfig.badgeText}`} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <span>{title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40">
                      نمای تمام‌صفحه
                    </span>
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-slate-300 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  title="بستن بزرگ‌نمایی (Esc)"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>کوچک‌نمایی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* بدنه نمودار در مدال با ارتفاع کامل */}
            <div className="flex-1 p-4 md:p-6 w-full h-full relative overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
