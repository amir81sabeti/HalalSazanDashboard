import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'خطا در بارگذاری اطلاعات',
  message = 'امکان دریافت اطلاعات از سرور وجود ندارد.',
  onRetry,
  className = 'h-48',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 gap-2 text-rose-300 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-1">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-xs font-bold text-rose-200">{title}</h4>
      <p className="text-[11px] text-slate-400 max-w-xs">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors border border-rose-500/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تلاش مجدد</span>
        </button>
      )}
    </div>
  );
};
