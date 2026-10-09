import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import type { ToastItem, ToastType } from '@/types';

const toastConfig: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    borderColor: string;
    bgColor: string;
    iconColor: string;
    badgeText: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-950/90',
    iconColor: 'text-emerald-400',
    badgeText: 'موفقیت',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-rose-500/50',
    bgColor: 'bg-rose-950/90',
    iconColor: 'text-rose-400',
    badgeText: 'خطا',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-950/90',
    iconColor: 'text-amber-400',
    badgeText: 'هشدار',
  },
  info: {
    icon: Info,
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-950/90',
    iconColor: 'text-cyan-400',
    badgeText: 'اطلاع‌رسانی',
  },
};

const ToastItemComponent: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 w-84 md:w-96 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 text-right">
        {toast.title && (
          <h4 className="text-xs font-bold text-slate-100 mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-slate-200 leading-relaxed break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="بستن اعلان"
        className="shrink-0 text-slate-400 hover:text-slate-100 transition-colors p-1 -m-1 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastViewport: React.FC = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 start-5 z-50 flex flex-col gap-2 pointer-events-auto"
    >
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onDismiss={hideToast} />
      ))}
    </div>
  );
};
