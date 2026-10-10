import React, { useState } from 'react';
import { Activity, Flame, Gauge, Info, RefreshCw } from 'lucide-react';
import { ChartCard } from '@/components/common/ChartCard';
import { useToast } from '@/hooks/useToast';

interface ReactorItem {
  id: number;
  name: string;
  status: 'در حال واکنش' | 'تخلیه و شستشو' | 'آماده به کار' | 'تعمیرات';
  temperature: number;
  pressure: number;
  currentBatch: number;
  feedRate: number;
  statusColor: string;
}

const initialReactors: ReactorItem[] = [
  {
    id: 1,
    name: 'راکتور ۱ (R-101)',
    status: 'در حال واکنش',
    temperature: 92.4,
    pressure: 1.55,
    currentBatch: 11,
    feedRate: 1450,
    statusColor: 'emerald',
  },
  {
    id: 2,
    name: 'راکتور ۲ (R-102)',
    status: 'در حال واکنش',
    temperature: 94.1,

    pressure: 1.62,
    currentBatch: 12,
    feedRate: 1620,
    statusColor: 'emerald',
  },
  {
    id: 3,
    name: 'راکتور ۳ (R-103)',
    status: 'تخلیه و شستشو',
    temperature: 42.0,
    pressure: 0.98,
    currentBatch: 10,
    feedRate: 0,
    statusColor: 'amber',
  },
  {
    id: 4,
    name: 'راکتور ۴ (R-104)',
    status: 'آماده به کار',
    temperature: 25.0,
    pressure: 1.0,
    currentBatch: 0,
    feedRate: 0,
    statusColor: 'sky',
  },
];

export const ProductionPage: React.FC = () => {
  const toast = useToast();
  const [reactors] = useState<ReactorItem[]>(initialReactors);

  const handleRefresh = () => {
    toast.info('داده‌های خط تولید به‌روزرسانی شدند.', 'بازخوانی');
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* پیام شفاف طبق الزامات سند معماری درباره وضعیت اندپوینت‌های عملیاتی */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">وضعیت اتصال اندپوینت‌های فرآیند تولید (Production APIs):</p>
          <p className="text-blue-800/80 leading-relaxed">
            در این فاز، ساختار معماری و رابط کاربری پایش راکتورها ایجاد شده است. با پیاده‌سازی پروسیجرهای خط تولید در فاز سوم، داده‌های بلادرنگ سنسورها (PLC/SCADA) از طریق API متصل خواهند شد.
          </p>
        </div>
      </div>

      {/* هدر صفحه و دکمه بازخوانی */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">پایش وضعیت راکتورها و خط تولید اتیل استات</h2>
          <p className="text-xs text-slate-500 mt-0.5">وضعیت ترمودینامیکی، خوراک‌دهی و پیشرفت بچ‌ها</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>بروزرسانی داده‌ها</span>
        </button>
      </div>

      {/* کارت‌های وضعیت ۴ راکتور اصلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {reactors.map((r) => (
          <div
            key={r.id}
            className="flex flex-col p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">{r.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${r.statusColor === 'emerald'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : r.statusColor === 'amber'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
              >
                {r.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3.5 text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">دما (°C)</span>
                  <span className="font-bold text-slate-900 font-mono">{r.temperature}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">فشار (bar)</span>
                  <span className="font-bold text-slate-900 font-mono">{r.pressure}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">نرخ خوراک (L/h)</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {r.feedRate ? r.feedRate.toLocaleString('fa-IR') : '—'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">بچ فعال</span>
                <span className="font-bold text-amber-600 font-mono">
                  {r.currentBatch ? `بچ ${r.currentBatch}` : '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* گزارش جدول عملیاتی تولید */}
      <ChartCard title="پارامترهای فنی ستون استری‌فیکاسیون و تقطیر" subtitle="مشخصات عملکردی ستون و ریبویلر">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">بخش فرآیندی</th>
                <th className="py-2.5 px-3 font-semibold">دمای طراحی (°C)</th>
                <th className="py-2.5 px-3 font-semibold">دمای جاری (°C)</th>
                <th className="py-2.5 px-3 font-semibold">فشار کاری (bar)</th>
                <th className="py-2.5 px-3 font-semibold">نسبت برگشت (Reflux)</th>
                <th className="py-2.5 px-3 font-semibold text-center">وضعیت ایمنی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold">پایین ستون تقطیر (Reboiler)</td>
                <td className="py-2.5 px-3 font-mono">105.0</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">103.8</td>
                <td className="py-2.5 px-3 font-mono">1.80</td>
                <td className="py-2.5 px-3 font-mono">1.4</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    نرمال
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold">بالای ستون تقطیر (Top Column)</td>
                <td className="py-2.5 px-3 font-mono">75.0</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">73.2</td>
                <td className="py-2.5 px-3 font-mono">2.10</td>
                <td className="py-2.5 px-3 font-mono">1.4</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    نرمال
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold">کندانسور و تفکیک‌گر فاز (Decanter)</td>
                <td className="py-2.5 px-3 font-mono">30.0</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">23.5</td>
                <td className="py-2.5 px-3 font-mono">0.25</td>
                <td className="py-2.5 px-3 font-mono">—</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    نرمال
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};
