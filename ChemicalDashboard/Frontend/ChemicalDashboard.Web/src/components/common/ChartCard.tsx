import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col bg-[#0f1c34]/90 border border-slate-700/40 rounded-xl backdrop-blur-md overflow-hidden transition-all duration-200 hover:border-slate-600/60 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      <div className="flex-1 p-3 min-h-0 relative">{children}</div>
    </div>
  );
};
