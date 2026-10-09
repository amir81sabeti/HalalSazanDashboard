import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductionPage } from '@/pages/ProductionPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { BatchLogsPage } from '@/pages/BatchLogsPage';
import { SystemStatusPage } from '@/pages/SystemStatusPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'production',
        element: <ProductionPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'batch-logs',
        element: <BatchLogsPage />,
      },
      {
        path: 'system-status',
        element: <SystemStatusPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
