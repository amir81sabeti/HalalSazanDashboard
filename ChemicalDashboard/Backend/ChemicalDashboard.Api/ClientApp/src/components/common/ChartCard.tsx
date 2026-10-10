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
      className={`flex flex-col bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      <div className="flex-1 p-2.5 min-h-0 relative">{children}</div>
    </div>
  );
};
