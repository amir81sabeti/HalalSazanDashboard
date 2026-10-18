import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface GoldenBatchExecutiveSummary {
  totalBatches: number;
  avgCycleTimeHours: number;
  avgPurityDegree: number;
  avgAcidNumber: number;
  totalProductionAmount: number;
  totalDowntimeHours: number;
  overallAlcoholRatio: number;
  qualityComplianceRate: number;
  goldenBatchId: number;
  goldenBatchNum: number;
  goldenScore: number;
  goldenPurity: number;
  goldenAN: number;
  goldenDurationHours: number;
  goldenProductAmount: number;
  goldenStartDate?: string;
  goldenEndDate?: string;
  goldenStartDateShamsi: string;
  goldenEndDateShamsi: string;
}

export interface BatchPerformanceItem {
  batchId: number;
  batchNum: number;
  reactorId: number;
  reactorNumber: number;
  startDate: string;
  endDate: string;
  startDateShamsi: string;
  endDateShamsi: string;
  durationHours: number;
  logCount: number;
  totalProductAmount: number;
  totalAlcoholIn: number;
  totalAcidIn: number;
  avgProductDegree: number;
  avgAcidNumber: number;
  avgTopTemp: number;
  avgOilTemp: number;
  avgReactorPressure: number;
  avgRefluxAmount: number;
  totalStopHours: number;
  stopCount: number;
  productionRatePerHour: number;
  alcoholConsumptionRatio: number;
  uptimePercent: number;
  performanceScore: number;
  batchRank: number;
  statusCategory: string;
}

export interface GoldenBatchDowntimeItem {
  occurrenceName: string;
  stopTypeName: string;
  occurrenceCount: number;
  totalHours: number;
  percentOfTotal: number;
}

export interface GoldenBatchRadarComparison {
  goldenBatchNum: number;
  goldenPurity: number;
  goldenRate: number;
  goldenAcidConversionScore: number;
  goldenYieldScore: number;
  goldenUptimeScore: number;
  plantAvgPurity: number;
  plantAvgRate: number;
  plantAvgAcidConversionScore: number;
  plantAvgUptimeScore: number;
}

export interface GoldenBatchDashboardResponse {
  summary: GoldenBatchExecutiveSummary;
  batches: BatchPerformanceItem[];
  downtimeBreakdown: GoldenBatchDowntimeItem[];
  radarBaseline: GoldenBatchRadarComparison;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestampUtc: string;
}

export interface GoldenBatchFilterParams {
  reactorId?: number;
  fromDateShamsi?: string;
  toDateShamsi?: string;
}

/**
 * هوک واکشی جامع داده‌های داشبورد بچ طلایی مستقیماً از SQL Server
 */
export const useGoldenBatchData = (filter: GoldenBatchFilterParams) => {
  return useQuery<GoldenBatchDashboardResponse>({
    queryKey: ['golden-batch-analytics', filter.reactorId ?? 'all', filter.fromDateShamsi, filter.toDateShamsi],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<GoldenBatchDashboardResponse>>('/api/goldenbatch/analytics', {
        params: {
          reactorId: filter.reactorId,
          fromDateShamsi: filter.fromDateShamsi,
          toDateShamsi: filter.toDateShamsi,
        },
      });
      return response.data.data;
    },
    staleTime: 30 * 1000,
  });
};
