/**
 * تایپ‌های عمومی لایه رابط کاربری (Frontend ViewModels and UI Types)
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface FilterState {
  year: string;
  reactor: string;
  cut: string;
  batchNumber: string;
  startDate: string;
  endDate: string;
  searchQuery: string;
}

export interface KpiMetric {
  id: string;
  titleFa: string;
  titleEn?: string;
  value: string | number;
  unit: string;
  trendPercentage: number;
  trendDirection: 'up' | 'down' | 'neutral';
  trendLabel: string;
  colorScheme: 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'cyan';
  isVerifiedBackendMetric: boolean;
  definitionNote?: string;
}

export interface ProductionStatusInfo {
  statusText: string;
  isActive: boolean;
  currentBatch: number;
  reactorNumber: number;
  startTimeFa: string;
  elapsedHours: number;
}

export interface ProductionLogRecord {
  rowNumber: number;
  dateFa: string;
  timeStr: string;
  azgSpeed: number; // سرعت AZG (لیتر/ساعت)
  agSpeed: number;  // سرعت AG (لیتر/ساعت)
  productDegree: number; // درجه محصول
  acidNumber: number;   // عدد اسیدی (AN)
  status: 'عادی' | 'هشدار' | 'بحرانی';
  operatorName: string;
}

export interface ChartSettingsState {
  xAxis: string;
  selectedIndicators: string[];
  chartType: 'line' | 'bar' | 'scatter' | 'area';
  scaleMode: 'actual' | 'normalized' | 'dual-axis' | 'separate';
}
