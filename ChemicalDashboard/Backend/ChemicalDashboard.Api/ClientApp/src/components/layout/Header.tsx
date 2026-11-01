import React, { useState } from 'react';
import { Menu, Database, Activity, Zap, Radio, ChevronDown, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDatabaseHealth, useApiHealth } from '@/services/queries/useHealthQueries';
import { useRealtime } from '@/services/realtime/RealtimeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { data: apiHealth, isError: isApiError } = useApiHealth();
  const { data: dbHealth, isError: isDbError } = useDatabaseHealth();
  const { isConnected: isSignalRConnected, isPulsing, triggerTestPulse, latestActiveBatches, fetchLatestActiveBatches } = useRealtime();

  const [showBatchModal, setShowBatchModal] = useState(false);

  const isDbConnected = dbHealth?.status === 'Healthy' && !isDbError;
  const isApiConnected = apiHealth?.status === 'Healthy' && !isApiError;

  // باز کردن مدال آخرین بچ و همزمان دریافت آخرین وضعیت
  const handleOpenLatestBatches = async () => {
    setShowBatchModal(true);
    await fetchLatestActiveBatches();
  };

  // هدایت کاربر به داشبورد و فیلتر روی بچ انتخاب شده
  const handleNavigateToBatch = (batchId: number) => {
    setShowBatchModal(false);
    navigate(`/?batchId=${batchId}`);
    triggerTestPulse(`هدایت به بچ شماره ${batchId}`);
  };

  return (
    <>
      <header
        className="relative w-full border-b border-slate-700/70 shadow-xl overflow-hidden transition-all duration-300 min-h-[82px] lg:min-h-[92px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(7, 14, 27, 0.72) 0%, rgba(8, 17, 34, 0.40) 50%, rgba(6, 12, 24, 0.28) 100%), url('/images/header-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundColor: '#0a1324',
        }}
      >
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between px-4 lg:px-8 py-4 lg:py-5 gap-3.5">
          {/* سمت راست: دکمه همبرگری موبایل + عنوان داشبورد صنعتی */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="باز کردن منو"
              className="lg:hidden p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base lg:text-xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
                <span>داشبورد تولید استات اتیل</span>
              </h1>
              <p className="text-xs text-slate-300/90 font-sans tracking-wider mt-0.5 drop-shadow-sm">
                Ethyl Acetate Production Dashboard • مانیتورینگ بلادرنگ خط تولید
              </p>
            </div>
          </div>

          {/* مرکز / سمت چپ: دکمه آخرین بچ فعال + وضعیت اتصالات + تست نبض زنده */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* دکمه سراسری آخرین بچ فعال هر راکتور (Requirement 5) */}
            <button
              type="button"
              onClick={handleOpenLatestBatches}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md shadow-amber-500/25 active:scale-95 transition-all border border-amber-300"
              title="نمایش اطلاعات آخرین بچ فعال هر راکتور در خط تولید"
            >
              <Zap className="w-4 h-4 fill-amber-950" />
              <span>آخرین بچ فعال راکتورها</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* دکمه تست نبض ضربان قلب سیگنال‌آر در تمامی صفحات (Requirement 1) */}
            <button
              type="button"
              onClick={() => triggerTestPulse('دیتا بروز شد')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isPulsing
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/40 scale-105'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
              }`}
              title="ارسال دستی سیگنال ضربان و نبض به تمام نمودارها و تست توستر سبز"
            >
              <Activity className={`w-3.5 h-3.5 ${isPulsing ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
              <span>تست نبض زنده</span>
            </button>

            {/* وضعیت اتصال زنده سیگنال‌آر */}
            <div
              title={
                isSignalRConnected
                  ? 'ارتباط بلادرنگ WebSocket با سرور فعال است (SignalR Connected)'
                  : 'در حال برقراری اتصال بلادرنگ با هاب...'
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border backdrop-blur-md transition-colors ${
                isSignalRConnected
                  ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-900/50 text-amber-300 border-amber-500/40'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isSignalRConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span>{isSignalRConnected ? 'SignalR فعال' : 'اتصال سوکت...'}</span>
            </div>

            {/* نشانگر سلامت اتصال به دیتابیس SQL Server */}
            <div
              title={
                isDbConnected
                  ? 'اتصال به دیتابیس HalalSazan و API دات‌نت کور برقرار است.'
                  : 'ارتباط با دیتابیس یا سرور برقرار نیست.'
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border backdrop-blur-md transition-colors ${
                isDbConnected && isApiConnected
                  ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-900/50 text-rose-300 border-rose-500/40'
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
            <div className="hidden 2xl:flex flex-col text-left font-sans text-slate-200 leading-tight border-r border-slate-700/60 pr-3 mr-1">
              <span className="text-[11px] font-bold text-white tracking-wide">Process Data</span>
              <span className="text-[10px] text-amber-400">Better Decisions</span>
            </div>
          </div>
        </div>
      </header>

      {/* مدال وضعیت آخرین بچ فعال هر راکتور (قابل فراخوانی در تمام صفحات) */}
      {showBatchModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowBatchModal(false)}
        >
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Zap className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">آخرین وضعیت بچ‌های فعال در راکتورها</h3>
                  <p className="text-[11px] text-slate-400">سامانه هوشمند پایش خطوط تولید اتیل استات</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs font-bold"
              >
                بستن (✕)
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {latestActiveBatches.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  در حال بارگذاری وضعیت آخرین بچ‌ها...
                </div>
              ) : (
                latestActiveBatches.map((item) => (
                  <div
                    key={item.reactorId}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.reactorName}</span>
                        {item.isActive ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            در حال تولید
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold">
                            آماده‌باش
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-3">
                        <span>
                          شماره بچ: <strong className="text-amber-400 font-mono">{item.batchNumber > 0 ? item.batchNumber : 'نامشخص'}</strong>
                        </span>
                        <span>
                          لاگ‌ها: <strong className="text-white font-mono">{item.logCount}</strong>
                        </span>
                        {item.startDateShamsi && (
                          <span>شروع: <span className="font-mono">{item.startDateShamsi}</span></span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigateToBatch(item.batchId)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors shrink-0"
                    >
                      <span>مشاهده در داشبورد</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-left">
              <button
                type="button"
                onClick={() => {
                  setShowBatchModal(false);
                  navigate('/');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
              >
                <span>انتقال مستقیم به صفحه اصلی داشبورد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
