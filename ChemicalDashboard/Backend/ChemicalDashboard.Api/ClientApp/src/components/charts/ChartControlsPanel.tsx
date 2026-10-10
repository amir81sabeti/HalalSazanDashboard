import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Search,
  LineChart,
  BarChart3,
  ScatterChart,
  AreaChart,
  Play,
  Bookmark,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface YIndicatorOption {
  id: string;
  label: string;
  checked: boolean;
}

const defaultIndicators: YIndicatorOption[] = [
  { id: 'prod_speed', label: 'سرعت تولید (AZG)', checked: true },
  { id: 'prod_total', label: 'مقدار کل محصول (AZG)', checked: true },
  { id: 'water_speed', label: 'سرعت آبگیری (AG)', checked: true },
  { id: 'water_total', label: 'مقدار کل آبگیری (AG)', checked: true },
  { id: 'acid_num', label: 'عدد اسیدی (AN)', checked: false },
  { id: 'reactor_temp', label: 'دمای راکتور', checked: false },
  { id: 'reactor_press', label: 'فشار راکتور', checked: false },
  { id: 'column_temp', label: 'دمای بالای ستون', checked: false },
  { id: 'column_press', label: 'فشار بالای ستون', checked: false },
  { id: 'condenser_temp', label: 'دمای آب ورودی کندانسور', checked: false },
  { id: 'condenser_press', label: 'فشار آب ورودی کندانسور', checked: false },
];

export const ChartControlsPanel: React.FC = () => {
  const toast = useToast();
  const [xAxis, setXAxis] = useState('تاریخ');
  const [indicators, setIndicators] = useState(defaultIndicators);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'area'>('line');
  const [scaleMode, setScaleMode] = useState<'actual' | 'normalized' | 'dual' | 'separate'>('actual');

  const toggleIndicator = (id: string) => {
    setIndicators((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, checked: !ind.checked } : ind))
    );
  };

  const filteredIndicators = indicators.filter((ind) =>
    ind.label.includes(searchQuery.trim())
  );

  const handleApply = () => {
    const selectedCount = indicators.filter((i) => i.checked).length;
    toast.success(`تنظیمات نمودار با ${selectedCount} شاخص فعال اعمال گردید.`, 'اعمال تغییرات');
  };

  const handleSaveTemplate = () => {
    toast.info('قالب جاری با موفقیت در حافظه مرورگر ذخیره شد.', 'ذخیره قالب');
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1c34]/95 border border-slate-700/50 rounded-xl p-3.5 backdrop-blur-md">
      {/* هدر پنل */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/40">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>تنظیمات نمودار</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pt-2.5 pr-0.5 text-xs">
        {/* انتخاب محور X */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            انتخاب محور X
          </label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full bg-[#091224] border border-slate-700/60 rounded-md px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="تاریخ">تاریخ</option>
            <option value="شماره بچ">شماره بچ</option>
            <option value="ساعت شیفت">ساعت شیفت</option>
          </select>
        </div>

        {/* انتخاب شاخص‌های Y */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-300">
              انتخاب شاخص‌های Y
            </label>
          </div>

          {/* نوار جستجوی شاخص‌ها */}
          <div className="relative mb-1.5">
            <input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#091224] border border-slate-700/60 rounded-md pr-7 pl-2 py-1 text-slate-200 text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1.5 pointer-events-none" />
          </div>

          {/* لیست شاخص‌ها */}
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {filteredIndicators.map((ind) => (
              <label
                key={ind.id}
                className="flex items-center gap-2 py-0.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={ind.checked}
                  onChange={() => toggleIndicator(ind.id)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0 accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="truncate">{ind.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* نوع نمودار */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
            نوع نمودار
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { type: 'line', icon: LineChart, label: 'خطی' },
              { type: 'bar', icon: BarChart3, label: 'ستونی' },
              { type: 'scatter', icon: ScatterChart, label: 'نقطه‌ای' },
              { type: 'area', icon: AreaChart, label: 'مساحتی' },
            ].map((btn) => {
              const Icon = btn.icon;
              const isActive = chartType === btn.type;
              return (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => setChartType(btn.type as any)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-md border text-[10px] transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-[#091224] border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* مقیاس نمایش */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            مقیاس نمایش
          </label>
          <div className="space-y-1">
            {[
              { id: 'actual', label: 'مقدار واقعی' },
              { id: 'normalized', label: 'مقادیر نرمال شده (۰ - ۱۰۰)' },
              { id: 'dual', label: 'محور دوم برای هر شاخص' },
              { id: 'separate', label: 'نمودار جداگانه برای هر شاخص' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-white cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="scaleMode"
                  value={item.id}
                  checked={scaleMode === item.id}
                  onChange={() => setScaleMode(item.id as any)}
                  className="accent-amber-500 w-3 h-3 cursor-pointer"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* دکمه‌های اقدام پایین پنل */}
      <div className="pt-3 border-t border-slate-700/40 space-y-2 mt-auto">
        <button
          type="button"
          onClick={handleApply}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-[#0e274d] hover:bg-[#133568] border border-blue-500/40 text-blue-300 text-xs font-bold transition-all shadow-md hover:shadow-blue-900/30 active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>اعمال تغییرات</span>
        </button>

        <button
          type="button"
          onClick={handleSaveTemplate}
          className="w-full flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg bg-transparent hover:bg-slate-800/40 border border-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
        >
          <Bookmark className="w-3 h-3 text-slate-400" />
          <span>ذخیره به عنوان قالب</span>
        </button>
      </div>
    </div>
  );
};
