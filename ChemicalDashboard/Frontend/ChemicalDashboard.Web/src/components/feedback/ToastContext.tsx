import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { ToastItem, ToastType } from '@/types';

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => string;
  hideToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 5000): string => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => {
        // جلوگیری از تکرار پیام‌های عیناً یکسان
        const isDuplicate = prev.some((t) => t.message === message && t.type === type);
        if (isDuplicate) return prev;
        // حداکثر ۵ نوتیفیکیشن همزمان برای تمیزی رابط کاربری
        const updated = [...prev, newToast];
        return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
      });

      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }

      return id;
    },
    [hideToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => showToast('success', message, title, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => showToast('error', message, title, duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => showToast('warning', message, title, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => showToast('info', message, title, duration),
    [showToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      hideToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, showToast, hideToast, success, error, warning, info]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export { ToastContext, type ToastContextValue };
