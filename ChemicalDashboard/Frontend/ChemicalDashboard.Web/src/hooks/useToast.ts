import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '../components/feedback/ToastContext';

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast باید درون ToastProvider استفاده شود.');
  }
  return context;
}
