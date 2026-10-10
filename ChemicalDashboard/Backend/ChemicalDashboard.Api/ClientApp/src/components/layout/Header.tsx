import React from 'react';
import { Menu, Calendar, Database } from 'lucide-react';
import { useDatabaseHealth, useApiHealth } from '@/services/queries/useHealthQueries';

interface HeaderProps {
  onToggleSidebar: () => void;
  year: string;
  onYearChange: (y: string) => void;
  reactor: string;
  onReactorChange: (r: string) => void;
  cut: string;
  onCutChange: (c: string) => void;
  startDate: string;
  endDate: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  year,
  onYearChange,
  reactor,
  onReactorChange,
  cut,
  onCutChange,
  startDate,
  endDate,
}) => {
  const { data: apiHealth, isError: isApiError } = useApiHealth();
  const { data: dbHealth, isError: isDbError } = useDatabaseHealth();

  const isDbConnected = dbHealth?.status === 'Healthy' && !isDbError;
  const isApiConnected = apiHealth?.status === 'Healthy' && !isApiError;

  return (
    <header
      className="relative w-full border-b border-slate-700/60 shadow-lg overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(7, 14, 27, 0.94) 0%, rgba(9, 18, 36, 0.88) 50%, rgba(7, 14, 27, 0.94) 100%), url('/images/header-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0a1324',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 lg:px-6 py-3.5 gap-3.5">
        {/* سمت راست: دکمه همبرگری موبایل + عنوان داشبورد */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="باز کردن منو"
            className="lg:hidden p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base lg:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>داشبورد تولید استات اتیل</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              Ethyl Acetate Production Dashboard
            </p>
          </div>
        </div>

        {/* مرکز / فیلترهای عملیاتی بالا (مطابق اسکرین‌شات مرجع) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* فیلتر سال */}
          <div className="flex items-center bg-[#0a1324]/90 border border-slate-700/60 rounded-lg px-2.5 py-1 text-slate-200">
            <span className="text-[11px] text-slate-400 ml-1.5 font-semibold">سال:</span>
            <select
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="1404" className="bg-slate-900">۱۴۰۴</option>
              <option value="1403" className="bg-slate-900">۱۴۰۳</option>
              <option value="1402" className="bg-slate-900">۱۴۰۲</option>
            </select>
          </div>

          {/* فیلتر راکتور */}
          <div className="flex items-center bg-[#0a1324]/90 border border-slate-700/60 rounded-lg px-2.5 py-1 text-slate-200">
            <span className="text-[11px] text-slate-400 ml-1.5 font-semibold">راکتور:</span>
            <select
              value={reactor}
              onChange={(e) => onReactorChange(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">همه</option>
              <option value="1" className="bg-slate-900">راکتور ۱</option>
              <option value="2" className="bg-slate-900">راکتور ۲</option>
              <option value="3" className="bg-slate-900">راکتور ۳</option>
              <option value="4" className="bg-slate-900">راکتور ۴</option>
            </select>
          </div>

          {/* فیلتر مقطع */}
          <div className="flex items-center bg-[#0a1324]/90 border border-slate-700/60 rounded-lg px-2.5 py-1 text-slate-200">
            <span className="text-[11px] text-slate-400 ml-1.5 font-semibold">مقطع:</span>
            <select
              value={cut}
              onChange={(e) => onCutChange(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">همه</option>
              <option value="initial" className="bg-slate-900">مقطع ابتدایی</option>
              <option value="mid" className="bg-slate-900">مقطع میانی</option>
              <option value="final" className="bg-slate-900">مقطع نهایی</option>
            </select>
          </div>

          {/* بازه تاریخ و شماره بچ */}
          <div className="flex items-center bg-[#0a1324]/90 border border-slate-700/60 rounded-lg px-2.5 py-1 text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-amber-400 ml-2" />
            <span className="text-slate-400 text-[11px] ml-1.5 font-semibold">بازه:</span>
            <span className="font-mono text-white text-[11px]">
              {startDate} تا {endDate}
            </span>
          </div>
        </div>

        {/* سمت چپ: نشانگر سلامت اتصال واقعی به SQL Server و بک‌اند دات‌نت */}
        <div className="flex items-center gap-3">
          <div
            title={
              isDbConnected
                ? 'اتصال به پایگاه داده HalalSazan و API دات‌نت کور برقرار است.'
                : 'اتصال به پایگاه داده یا وب‌سرویس برقرار نیست.'
            }
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              isDbConnected && isApiConnected
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDbConnected ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isDbConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <Database className="w-3.5 h-3.5" />
            <span>{isDbConnected ? 'SQL Server متصل' : 'دیتابیس آفلاین'}</span>
          </div>

          {/* شعار بالایی هدر */}
          <div className="hidden xl:flex flex-col text-left font-sans text-slate-300 leading-tight">
            <span className="text-[11px] font-semibold text-slate-200">Process Data</span>
            <span className="text-[10px] text-slate-400">Better Decisions</span>
          </div>
        </div>
      </div>
    </header>
  );
};
