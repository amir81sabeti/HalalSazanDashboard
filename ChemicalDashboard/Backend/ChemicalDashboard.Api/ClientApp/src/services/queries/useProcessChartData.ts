import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface BatchFilterItem {
  batchId: number;
  batchNumber: number;
  reactorId: number;
  logCount: number;
  startDate?: string;
  startDateShamsi?: string;
  endDate?: string;
  endDateShamsi?: string;
}

export interface ProcessChartPoint {
  id: number;
  batchId: number;
  batchNumber: number;
  reactorId: number;
  inspectionTime: string;
  logDate: string;
  logDateShamsi: string;
  createdDate: string;
  productAmount: number;
  productSpeed: number;
  agAmount: number;
  agSpeed: number;
  distillationTopTemp: number;
  oilInputTemp: number;
  condenserWaterTemp: number;
  condenserOutWaterTemp: number;
  refluxFluidTemp: number;
  reactorPressure: number;
  distillationTopPressure: number;
  oilInputPressure: number;
  condenserWaterPressure: number;
  acidNumber: number;
  productDegree: number;
  refluxAmount: number;
  reactorLevel: number;
  alcoholLiter: number;
  alcoholDegree: number;
  acidKg: number;
  operatorName: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestampUtc: string;
}

export interface ChartFilterParams {
  reactorId?: number;
  batchId?: number;
  fromDateShamsi?: string;
  toDateShamsi?: string;
}

/**
 * دریافت لیست بچ‌ها به تفکیک راکتور جهت فیلتر آبشاری
 */
export const useBatches = (reactorId?: number) => {
  return useQuery<BatchFilterItem[]>({
    queryKey: ['chart-batches', reactorId ?? 'all'],
    queryFn: async () => {
      const params = reactorId ? { reactorId } : {};
      const response = await axios.get<ApiResponse<BatchFilterItem[]>>('/api/chart/batches', { params });
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
};

/**
 * دریافت داده‌های جامع نقاط لاگ فرآیند جهت رسم نمودار داینامیک
 */
export const useProcessChartData = (filter: ChartFilterParams) => {
  return useQuery<ProcessChartPoint[]>({
    queryKey: ['chart-data', filter.reactorId ?? 'all', filter.batchId ?? 'all', filter.fromDateShamsi, filter.toDateShamsi],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ProcessChartPoint[]>>('/api/chart/data', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
          fromDateShamsi: filter.fromDateShamsi,
          toDateShamsi: filter.toDateShamsi,
        },
      });
      return response.data.data;
    },
    staleTime: 30 * 1000,
  });
};
