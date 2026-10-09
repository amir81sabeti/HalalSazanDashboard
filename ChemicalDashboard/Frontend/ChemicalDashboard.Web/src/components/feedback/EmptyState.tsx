import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'اطلاعاتی یافت نشد',
  description = 'در این بازه زمانی هیچ داده‌ای برای نمایش ثبت نشده است.',
  action,
  className = 'h-48',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 gap-2 text-slate-400 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-1 border border-slate-700/40">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-xs font-bold text-slate-300">{title}</h4>
      <p className="text-[11px] text-slate-400 max-w-xs">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
