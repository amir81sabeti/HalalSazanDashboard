import React, { useState, useMemo, useCallback } from 'react';
import { ModuleRegistry, AllCommunityModule, type ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Layers, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// ثبت ماژول‌های کامیونیتی AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

interface BatchLogRow {
  id: number;
  batchNumber: string;
  reactor: string;
  dateFa: string;
  timeStr: string;
  azgVolume: number;
  agVolume: number;
  productDegree: number;
  acidNumber: number;
  status: 'عادی' | 'هشدار' | 'متوقف';
  operator: string;
}

const sampleBatchLogs: BatchLogRow[] = [
  {
    id: 1,
    batchNumber: 'بچ ۱۲',
    reactor: 'راکتور ۲',
    dateFa: '1404/03/16',
    timeStr: '14:00',
    azgVolume: 7650,
    agVolume: 420,
    productDegree: 62.0,
    acidNumber: 0.28,
    status: 'عادی',
    operator: 'مهندس رضایی',
  },
  {
    id: 2,
    batchNumber: 'بچ ۱۲',
    reactor: 'راکتور ۲',
    dateFa: '1404/03/16',
    timeStr: '12:00',
    azgVolume: 9120,
    agVolume: 510,
    productDegree: 63.0,
    acidNumber: 0.31,
    status: 'عادی',
    operator: 'مهندس محمدی',
  },
  {
    id: 3,
    batchNumber: 'بچ ۱۲',
    reactor: 'راکتور ۲',
    dateFa: '1404/03/16',
    timeStr: '10:00',
    azgVolume: 6430,
    agVolume: 390,
    productDegree: 62.0,
    acidNumber: 0.27,
    status: 'عادی',
    operator: 'مهندس رضایی',
  },
  {
    id: 4,
    batchNumber: 'بچ ۱۱',
    reactor: 'راکتور ۱',
    dateFa: '1404/03/16',
    timeStr: '08:00',
    azgVolume: 8900,
    agVolume: 480,
    productDegree: 61.0,
    acidNumber: 0.33,
    status: 'هشدار',
    operator: 'مهندس کریمی',
  },
  {
    id: 5,
    batchNumber: 'بچ ۱۱',
    reactor: 'راکتور ۱',
    dateFa: '1404/03/15',
    timeStr: '16:00',
    azgVolume: 7200,
    agVolume: 410,
    productDegree: 62.0,
    acidNumber: 0.29,
    status: 'عادی',
    operator: 'مهندس محمدی',
  },
  {
    id: 6,
    batchNumber: 'بچ ۱۰',
    reactor: 'راکتور ۳',
    dateFa: '1404/03/15',
    timeStr: '12:00',
    azgVolume: 6980,
    agVolume: 395,
    productDegree: 62.5,
    acidNumber: 0.30,
    status: 'عادی',
    operator: 'مهندس احمدی',
  },
  {
    id: 7,
    batchNumber: 'بچ ۹',
    reactor: 'راکتور ۲',
    dateFa: '1404/03/14',
    timeStr: '18:00',
    azgVolume: 7430,
    agVolume: 430,
    productDegree: 61.8,
    acidNumber: 0.35,
    status: 'هشدار',
    operator: 'مهندس کریمی',
  },
  {
    id: 8,
    batchNumber: 'بچ ۸',
    reactor: 'راکتور ۴',
    dateFa: '1404/03/13',
    timeStr: '09:00',
    azgVolume: 6120,
    agVolume: 380,
    productDegree: 62.2,
    acidNumber: 0.26,
    status: 'عادی',
    operator: 'مهندس رضایی',
  },
];

export const BatchLogsPage: React.FC = () => {
  const toast = useToast();
  const [rowData] = useState<BatchLogRow[]>(sampleBatchLogs);
  const [quickSearch, setQuickSearch] = useState('');

  const colDefs: ColDef<BatchLogRow>[] = useMemo(
    () => [
      {
        headerName: 'ردیف',
        valueGetter: (params) => (params.node?.rowIndex ? params.node.rowIndex + 1 : 1),
        width: 80,
        sortable: false,
      },
      {
        field: 'batchNumber',
        headerName: 'شماره بچ',
        width: 120,
        filter: true,
      },
      {
        field: 'reactor',
        headerName: 'راکتور',
        width: 120,
        filter: true,
      },
      {
        field: 'dateFa',
        headerName: 'تاریخ',
        width: 120,
      },
      {
        field: 'timeStr',
        headerName: 'ساعت',
        width: 90,
      },
      {
        field: 'azgVolume',
        headerName: 'سرعت AZG (L/h)',
        width: 150,
        valueFormatter: (params) => params.value ? params.value.toLocaleString('fa-IR') : '—',
        cellClass: 'text-sky-400 font-bold',
      },
      {
        field: 'agVolume',
        headerName: 'سرعت AG (L/h)',
        width: 140,
        valueFormatter: (params) => params.value ? params.value.toLocaleString('fa-IR') : '—',
        cellClass: 'text-amber-400 font-bold',
      },
      {
        field: 'productDegree',
        headerName: 'درجه محصول',
        width: 120,
      },
      {
        field: 'acidNumber',
        headerName: 'عدد اسیدی (AN)',
        width: 130,
      },
      {
        field: 'status',
        headerName: 'وضعیت',
        width: 110,
        cellRenderer: (params: { value: string }) => {
          const isWarning = params.value === 'هشدار';
          return (
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                isWarning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        field: 'operator',
        headerName: 'اپراتور شیفت',
        flex: 1,
        minWidth: 140,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    }),
    []
  );

  const filteredData = useMemo(() => {
    if (!quickSearch.trim()) return rowData;
    const q = quickSearch.toLowerCase();
    return rowData.filter(
      (r) =>
        r.batchNumber.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q) ||
        r.reactor.toLowerCase().includes(q) ||
        r.dateFa.includes(q)
    );
  }, [rowData, quickSearch]);

  const handleExport = useCallback(() => {
    toast.success('فایل گزارش سوابق لاگ‌ها با فرمت CSV آماده دانلود گردید.', 'خروجی اکسل');
  }, [toast]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* هدر صفحه و کنترل‌های فیلتر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>سوابق و لاگ‌های خط تولید (Batch Production Logs)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            جدول داده‌ای پیشرفته بر پایه AG Grid Community با قابلیت مرتب‌سازی و فیلتر
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* نوار جستجوی سریع */}
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو در سوابق..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="bg-[#0f1c34] border border-slate-700/60 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* دکمه خروجی اکسل */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>خروجی CSV</span>
          </button>
        </div>
      </div>

      {/* کانتینر جدول حرفه‌ای AG Grid */}
      <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-700/50 bg-[#0f1c34]/90 backdrop-blur-md shadow-xl ag-theme-quartz-dark">
        <AgGridReact
          rowData={filteredData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          enableRtl={true}
          rowHeight={42}
          headerHeight={44}
        />
      </div>
    </div>
  );
};
