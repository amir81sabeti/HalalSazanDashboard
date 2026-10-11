import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductionPage } from '@/pages/ProductionPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { BatchLogsPage } from '@/pages/BatchLogsPage';
import { DynamicChartPage } from '@/pages/DynamicChartPage';
import { SystemStatusPage } from '@/pages/SystemStatusPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PAGES_CONFIG } from '@/config/pages.config';

// پیدا کردن اولین مسیر فعال در صورت غیرفعال بودن داشبورد اصلی
const getFallbackPath = (): string => {
  if (PAGES_CONFIG.dynamicChart) return '/dynamic-chart';
  if (PAGES_CONFIG.production) return '/production';
  if (PAGES_CONFIG.batchLogs) return '/batch-logs';
  if (PAGES_CONFIG.inventory) return '/inventory';
  if (PAGES_CONFIG.systemStatus) return '/system-status';
  return '/404';
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: PAGES_CONFIG.dashboard ? (
          <DashboardPage />
        ) : (
          <Navigate to={getFallbackPath()} replace />
        ),
      },
      ...(PAGES_CONFIG.dynamicChart
        ? [
            {
              path: 'dynamic-chart',
              element: <DynamicChartPage />,
            },
          ]
        : []),
      ...(PAGES_CONFIG.production
        ? [
            {
              path: 'production',
              element: <ProductionPage />,
            },
          ]
        : []),
      ...(PAGES_CONFIG.inventory
        ? [
            {
              path: 'inventory',
              element: <InventoryPage />,
            },
          ]
        : []),
      ...(PAGES_CONFIG.batchLogs
        ? [
            {
              path: 'batch-logs',
              element: <BatchLogsPage />,
            },
          ]
        : []),
      ...(PAGES_CONFIG.systemStatus
        ? [
            {
              path: 'system-status',
              element: <SystemStatusPage />,
            },
          ]
        : []),
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
