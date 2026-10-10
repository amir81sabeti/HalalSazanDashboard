import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/components/feedback/ToastContext';
import { router } from '@/routes';
import { initializeGeneratedApiClient } from '@/services/api';

// راه‌اندازی اولیه کلاینت کدهای جنریت شده OpenAPI
initializeGeneratedApiClient();

// پیکربندی کلاینت سراسری TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // ۳۰ ثانیه کش
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
