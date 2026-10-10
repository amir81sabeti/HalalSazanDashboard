import React from 'react';
import { Info, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ChartCard } from '@/components/common/ChartCard';

interface TankItem {
  id: string;
  name: string;
  material: string;
  capacity: number;
  currentLevel: number;
  unit: string;
  temperature: number;
  color: string;
}

const tanks: TankItem[] = [
  {
    id: 'TK-101',
    name: 'مخزن ذخیره محصول نهایی TK-101',
    material: 'اتیل استات خالص (Ethyl Acetate)',
    capacity: 100000,
    currentLevel: 74500,
    unit: 'لیتر',
    temperature: 24.2,
    color: '#3b82f6',
  },
  {
    id: 'TK-102',
    name: 'مخزن ذخیره اتیل استات تجاری TK-102',
    material: 'اتیل استات گرید صنعتی',
    capacity: 80000,
    currentLevel: 51200,
    unit: 'لیتر',
    temperature: 25.0,
    color: '#06b6d4',
  },
  {
    id: 'TK-201',
    name: 'مخزن خوراک اتانول TK-201',
    material: 'اتانول ۹۶٪ (Ethanol)',
    capacity: 120000,
    currentLevel: 88400,
    unit: 'لیتر',
    temperature: 22.8,
    color: '#f59e0b',
  },
  {
    id: 'TK-202',
    name: 'مخزن خوراک اسید استیک TK-202',
    material: 'اسید استیک گلاسیال (Acetic Acid)',
    capacity: 100000,
    currentLevel: 42000,
    unit: 'لیتر',
    temperature: 21.5,
    color: '#ef4444',
  },
];

export const InventoryPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* یادداشت معماری درباره موجودی انبار */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">وضعیت موجودی انبار و مخازن (Tank Farm Storage):</p>
          <p className="text-blue-300/80 leading-relaxed mt-0.5">
            مخازن و ترازنامه انبار در این صفحه طبق داده‌های ایستگاه اندازه‌گیری فرموله شده‌اند. با تکمیل وب‌سرویس انبار در بک‌اند، این تراز با سیستم باسکول و تحویل به مشتری همگام خواهد شد.
          </p>
        </div>
      </div>

      {/* هدر صفحه */}
      <div>
        <h2 className="text-lg font-bold text-white">موجودی مخازن و اقلام انبار مواد شیمیایی</h2>
        <p className="text-xs text-slate-400 mt-0.5">پایش ظرفیت مخازن خوراک، حلال‌ها و محصولات تولیدی</p>
      </div>

      {/* کارت‌های مخازن مزرعه مخازن (Tank Farm) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {tanks.map((tank) => {
          const fillPercent = Math.round((tank.currentLevel / tank.capacity) * 100);
          return (
            <div
              key={tank.id}
              className="flex flex-col p-4 rounded-xl bg-[#0f1c34]/90 border border-slate-700/40 backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                <span className="text-xs font-bold text-slate-100">{tank.id}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {tank.temperature} °C
                </span>
              </div>

              <div className="mt-2.5">
                <span className="text-xs font-semibold text-slate-300 block truncate">
                  {tank.material}
                </span>

                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-xl font-black text-white font-mono">
                    {tank.currentLevel.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-xs text-slate-400">{tank.unit}</span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>ظرفیت تکمیل:</span>
                    <span className="font-bold text-slate-200">{fillPercent}٪</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: tank.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>خالی: {((tank.capacity - tank.currentLevel)).toLocaleString('fa-IR')}</span>
                    <span>کل: {tank.capacity.toLocaleString('fa-IR')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* جدول گردش اقلام ورودی و خروجی انبار */}
      <ChartCard title="آخرین تراکنش‌های حواله و ورود و خروج مخازن" subtitle="سوابق تخلیه تانکر خوراک و بارگیری محصول">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#0b1424] text-slate-400 border-b border-slate-700/50">
                <th className="py-2.5 px-3">نوع تراکنش</th>
                <th className="py-2.5 px-3">شماره حواله</th>
                <th className="py-2.5 px-3">ماده شیمیایی</th>
                <th className="py-2.5 px-3">مخزن مبدا/مقصد</th>
                <th className="py-2.5 px-3">حجم (لیتر)</th>
                <th className="py-2.5 px-3">تاریخ و ساعت</th>
                <th className="py-2.5 px-3">تحویل‌گیرنده/راننده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    ورود خوراک
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono">REC-1404-098</td>
                <td className="py-2.5 px-3">اسید استیک گلاسیال</td>
                <td className="py-2.5 px-3 font-mono">TK-202</td>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-100">25,000</td>
                <td className="py-2.5 px-3 font-mono">1404/03/16 11:30</td>
                <td className="py-2.5 px-3">شرکت حمل پترو ترابر</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-sky-400 font-bold text-[11px]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    خروج محصول
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono">INV-1404-412</td>
                <td className="py-2.5 px-3">اتیل استات خالص</td>
                <td className="py-2.5 px-3 font-mono">TK-101</td>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-100">30,000</td>
                <td className="py-2.5 px-3 font-mono">1404/03/15 15:00</td>
                <td className="py-2.5 px-3">مشتری: رنگ و رزین سینا</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};
