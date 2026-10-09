import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'در حال دریافت اطلاعات...',
  className = 'h-48',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-400 ${className}`}
    >
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};
