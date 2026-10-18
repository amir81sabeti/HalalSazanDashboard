import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  TahmasbiSummaryData,
  MonthlyProductionItem,
  QualityStabilityBracket,
  BreakdownMonthItem,
  StopReasonItem,
  StopOccurrenceItem,
  ReactorComparisonMonthItem,
  MassBalanceItem,
  RawLogSampleItem,
} from '@/services/data/excelReportData';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestampUtc: string;
}

export interface ExcelFilterParams {
  reactorId?: number;
  batchId?: number;
  batchIds?: string;
  batchNumbers?: string;
  year?: number;
  month?: number;
  fromDateShamsi?: string;
  toDateShamsi?: string;
}

export interface BreakdownReportResponse {
  productionHours: number;
  totalStopHours: number;
  inProcessStopHours: number;
  standbyStopHours: number;
  monthlyBreakdown: BreakdownMonthItem[];
  stopReasons: StopReasonItem[];
  occurrenceTypes: { occurrenceName: string; hours: number; percent: number }[];
}

export interface RawLogsPagedResponse {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  items: RawLogSampleItem[];
}

/**
 * دریافت گزارش خلاصه وضعیت تولید و راندمان‌ها (Tahmasbi Report) از سرور
 */
export const useExcelTahmasbiReport = (filter: ExcelFilterParams) => {
  return useQuery<TahmasbiSummaryData>({
    queryKey: [
      'excel-tahmasbi',
      filter.reactorId ?? 'all',
      filter.batchId ?? 'all',
      filter.batchIds ?? '',
      filter.batchNumbers ?? '',
      filter.year ?? 'all',
      filter.month ?? 'all',
    ],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any>>('/api/excelreport/tahmasbi-report', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
          batchIds: filter.batchIds,
          batchNumbers: filter.batchNumbers,
          year: filter.year,
          month: filter.month,
          fromDateShamsi: filter.fromDateShamsi,
          toDateShamsi: filter.toDateShamsi,
        },
      });
      const d = response.data.data;
      return {
        inputAlcoholLiter: Number(d.totalAlcoholLiter || d.TotalAlcoholLiter || d.inputAlcoholLiter || 0),
        avgAlcoholDegree: Number(d.avgAlcoholDegree || d.AvgAlcoholDegree || 0),
        inputAcidLiter: Number(d.totalAcidKg || d.TotalAcidKg || d.inputAcidLiter || 0),
        outputAzeotropeLiter: Number(d.totalProductAmount || d.TotalProductAmount || d.outputAzeotropeLiter || 0),
        avgAzeotropeDegree: Number(d.avgProductDegree || d.AvgProductDegree || d.avgAzeotropeDegree || 0),
        outputWaterLiter: Number(d.totalWaterAmount || d.TotalWaterAmount || d.outputWaterLiter || 0),
        acidInjectHours: Number(d.acidInjectHours || d.AcidInjectHours || 0),
        alcoholInjectHours: Number(d.alcoholInjectHours || d.AlcoholInjectHours || 0),
        productHours: Number(d.productHours || d.ProductHours || 0),
        waterDrainHours: Number(d.waterDrainHours || d.WaterDrainHours || 0),
        netProductionHours: Number(d.netProductionHours || d.NetProductionHours || 0),
        stopHours: Number(d.stopHours || d.StopHours || 0),
        totalProductionHours: Number(d.totalProductionHours || d.TotalProductionHours || 0),
        productEfficiency: Number(d.productEfficiency || d.ProductEfficiency || 0),
        waterEfficiency: Number(d.waterEfficiency || d.WaterEfficiency || 0),
        productionEfficiency: Number(d.productionEfficiency || d.ProductionEfficiency || 0),
        acidInjectHoursFormatted: d.acidInjectHoursFormatted || d.AcidInjectHoursFormatted,
        alcoholInjectHoursFormatted: d.alcoholInjectHoursFormatted || d.AlcoholInjectHoursFormatted,
        productHoursFormatted: d.productHoursFormatted || d.ProductHoursFormatted,
        waterDrainHoursFormatted: d.waterDrainHoursFormatted || d.WaterDrainHoursFormatted,
        netProductionHoursFormatted: d.netProductionHoursFormatted || d.NetProductionHoursFormatted,
        stopHoursFormatted: d.stopHoursFormatted || d.StopHoursFormatted,
        totalProductionHoursFormatted: d.totalProductionHoursFormatted || d.TotalProductionHoursFormatted,
        flowRates: (d.flowRates || d.FlowRates || []).map((f: any) => ({
          name: f.name || f.Name,
          inOperationRate: Number(f.inOperationRate || f.InOperationRate || 0),
          overallRate: Number(f.overallRate || f.OverallRate || 0),
          unit: f.unit || f.Unit || 'L/h',
        })),
      };
    },
    staleTime: 30 * 1000,
  });
};

/**
 * دریافت روند تولید در ماه به تفکیک روز و تولید تجمعی از سرور
 */
export const useExcelMonthlyProduction = (filter: ExcelFilterParams, year?: number) => {
  return useQuery<MonthlyProductionItem[]>({
    queryKey: ['excel-monthly-production', filter.reactorId ?? 'all', filter.batchId ?? 'all', year ?? 1405],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any[]>>('/api/excelreport/monthly-production', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
          year: year ?? 1405,
        },
      });
      return response.data.data.map((item) => ({
        date: item.dateStr || item.DateStr,
        amount: Number(item.dailyAmount || item.DailyAmount || 0),
        sharePercent: Number(item.sharePercent || item.SharePercent || 0),
        cumulative: Number(item.cumulativeAmount || item.CumulativeAmount || 0),
      }));
    },
    staleTime: 30 * 1000,
  });
};

/**
 * دریافت گزارش پایداری کیفی سیستم در ۵ بازه استاندارد از سرور
 */
export const useExcelQualityStability = (filter: ExcelFilterParams) => {
  return useQuery<QualityStabilityBracket[]>({
    queryKey: ['excel-quality-stability', filter.reactorId ?? 'all', filter.batchId ?? 'all'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any[]>>('/api/excelreport/quality-stability', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
          fromDateShamsi: filter.fromDateShamsi,
          toDateShamsi: filter.toDateShamsi,
        },
      });
      return response.data.data.map((item) => ({
        code: item.code || item.Code,
        rangeName: item.rangeName || item.RangeName,
        volumeLiter: Number(item.volumeLiter || item.VolumeLiter || 0),
        volumePercent: Number(item.volumePercent || item.VolumePercent || 0),
        hours: Number(item.hours || item.Hours || 0),
        hoursPercent: Number(item.hoursPercent || item.HoursPercent || 0),
        ratePerHour: Number(item.ratePerHour || item.RatePerHour || 0),
      }));
    },
    staleTime: 30 * 1000,
  });
};

/**
 * دریافت گزارش جامع توقفات و راندمان از سرور
 */
export const useExcelBreakdownReport = (filter: ExcelFilterParams) => {
  return useQuery<BreakdownReportResponse>({
    queryKey: [
      'excel-breakdown',
      filter.reactorId ?? 'all',
      filter.batchId ?? 'all',
      filter.batchIds ?? '',
      filter.batchNumbers ?? '',
      filter.year ?? 'all',
    ],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any>>('/api/excelreport/breakdown', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
          batchIds: filter.batchIds,
          batchNumbers: filter.batchNumbers,
          year: filter.year,
        },
      });
      const d = response.data.data;
      return {
        productionHours: Number(d.productionHours || d.ProductionHours || 0),
        totalStopHours: Number(d.totalStopHours || d.TotalStopHours || 0),
        inProcessStopHours: Number(d.inProcessStopHours || d.InProcessStopHours || 0),
        standbyStopHours: Number(d.standbyStopHours || d.StandbyStopHours || 0),
        monthlyBreakdown: (d.monthlyBreakdown || d.MonthlyBreakdown || []).map((m: any) => ({
          monthNumber: m.monthNumber || m.MonthNumber,
          monthName: m.monthName || m.MonthName,
          year: filter.year ?? 1404,
          productionHours: Number(m.productionHours || m.ProductionHours || 0),
          stopHours: Number(m.stopHours || m.StopHours || 0),
          availabilityPercent: Number(m.availabilityPercent || m.AvailabilityPercent || 0),
        })),
        stopReasons: (d.stopReasons || d.StopReasons || []).map((r: any) => ({
          reason: r.reason || r.Reason,
          hours: Number(r.hours || r.Hours || 0),
          percent: Number(r.percent || r.Percent || 0),
        })),
        occurrenceTypes: (d.occurrenceTypes || d.OccurrenceTypes || []).map((o: any) => ({
          occurrenceName: o.occurrenceName || o.OccurrenceName,
          hours: Number(o.hours || o.Hours || 0),
          percent: Number(o.percent || o.Percent || 0),
        })),
      };
    },
    staleTime: 30 * 1000,
  });
};

/**
 * دریافت گزارش مقایسه تولید ماهانه رآکتورها از سرور
 */
export const useExcelReactorComparison = (year?: number) => {
  return useQuery<ReactorComparisonMonthItem[]>({
    queryKey: ['excel-reactor-comparison', year ?? 1405],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any[]>>('/api/excelreport/reactor-comparison', {
        params: { year: year ?? 1405 },
      });
      return response.data.data.map((item) => ({
        monthNumber: item.monthNumber || item.MonthNumber,
        monthName: item.monthName || item.MonthName,
        year: 1405,
        reactor3: Number(item.reactor3 || item.Reactor3 || 0),
        reactor4: Number(item.reactor4 || item.Reactor4 || 0),
        reactor36: Number(item.reactor36 || item.Reactor36 || 0),
        total: Number(item.total || item.Total || 0),
      }));
    },
    staleTime: 30 * 1000,
  });
};

/**
 * دریافت موازنه جرمی و بازده شیمیایی از سرور
 */
export const useExcelMassBalance = (filter: ExcelFilterParams) => {
  return useQuery<MassBalanceItem[]>({
    queryKey: ['excel-mass-balance', filter.reactorId ?? 'all', filter.batchId ?? 'all'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any[]>>('/api/excelreport/mass-balance', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
        },
      });
      return response.data.data.map((item) => ({
        component: item.component || item.Component,
        inputLiter: Number(item.inputLiter || item.InputLiter || 0),
        outputLiter: Number(item.outputLiter || item.OutputLiter || 0),
        remainingLiter: Number(item.remainingLiter || item.RemainingLiter || 0),
        theoreticalKg: Number(item.theoreticalKg || item.TheoreticalKg || 0),
        deviationLiter: Number(item.deviationLiter || item.DeviationLiter || 0),
      }));
    },
    staleTime: 30 * 1000,
  });
};

/**
 * دریافت لاگ‌های خام پایگاه داده با جستجو و پیجینیشن از سرور
 */
export const useExcelRawLogs = (
  filter: ExcelFilterParams,
  search?: string,
  pageIndex: number = 1,
  pageSize: number = 20
) => {
  return useQuery<RawLogsPagedResponse>({
    queryKey: ['excel-raw-logs', filter.reactorId ?? 'all', filter.batchId ?? 'all', search ?? '', pageIndex, pageSize],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any>>('/api/excelreport/raw-logs', {
        params: {
          reactorId: filter.reactorId,
          batchId: filter.batchId,
          search: search || undefined,
          pageIndex,
          pageSize,
        },
      });
      const d = response.data.data;
      return {
        totalCount: d.totalCount || d.TotalCount || 0,
        pageIndex: d.pageIndex || d.PageIndex || 1,
        pageSize: d.pageSize || d.PageSize || 20,
        items: (d.items || d.Items || []).map((l: any) => ({
          id: l.id || l.Id,
          date: l.dateStr || l.DateStr,
          reactorNum: l.reactorNum || l.ReactorNum,
          batchNum: l.batchNum || l.BatchNum,
          inspectionTime: l.inspectionTime || l.InspectionTime,
          alcoholIn: Number(l.alcoholIn || l.AlcoholIn || 0),
          alcoholDeg: Number(l.alcoholDeg || l.AlcoholDeg || 0),
          acidIn: Number(l.acidIn || l.AcidIn || 0),
          acidNum: Number(l.acidNum || l.AcidNum || 0),
          productAmount: Number(l.productAmount || l.ProductAmount || 0),
          productDeg: Number(l.productDeg || l.ProductDeg || 0),
          waterOut: Number(l.waterOut || l.WaterOut || 0),
          reactorPress: Number(l.reactorPress || l.ReactorPress || 0),
          distilTopTemp: Number(l.distilTopTemp || l.DistilTopTemp || 0),
          refluxAmount: Number(l.refluxAmount || l.RefluxAmount || 0),
          desc: l.desc || l.Desc || '',
        })),
      };
    },
    staleTime: 15 * 1000,
  });
};
