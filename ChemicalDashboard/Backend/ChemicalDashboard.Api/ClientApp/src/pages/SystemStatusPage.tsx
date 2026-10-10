import React, { useState } from 'react';
import { Database, Server, Plus, RefreshCw, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { useApiHealth, useDatabaseHealth } from '@/services/queries/useHealthQueries';
import { useTestRecords, useCreateTestRecord } from '@/services/queries/useTestQueries';
import { useToast } from '@/hooks/useToast';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';

export const SystemStatusPage: React.FC = () => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  // فراخوانی کوئری‌های واقعی سلامت وب‌سرویس و ارتباط با دیتابیس
  const {
    data: apiHealth,
    isLoading: isApiLoading,
    refetch: refetchApi,
  } = useApiHealth();

  const {
    data: dbHealth,
    isLoading: isDbLoading,
    refetch: refetchDb,
  } = useDatabaseHealth();

  // فراخوانی کوئری رکوردهای تستی جدول dbo.test
  const {
    data: records,
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useTestRecords();

  // میوتیشن درج رکورد تستی با Stored Procedure
  const createMutation = useCreateTestRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) {
      toast.warning('لطفاً هر دو فیلد نام و سن را تکمیل فرمایید.', 'ورودی نامعتبر');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        age: age.trim(),
      });
      toast.success('رکورد تستی با موفقیت از طریق پروسیجر dbo.sp_InsertTest ثبت گردید.', 'ثبت موفق');
      setName('');
      setAge('');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ثبت رکورد در پایگاه داده.', 'خطای دیتابیس');
    }
  };

  const handleRefreshAll = () => {
    refetchApi();
    refetchDb();
    refetchRecords();
    toast.info('تمام اتصالات و رکوردهای پایگاه داده بازخوانی شدند.', 'بروزرسانی');
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500" />
            <span>وضعیت سلامت سامانه و اتصال به پایگاه داده (Live Backend Integration)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            پایش بلادرنگ وضعیت سرور Kestrel، سلامت ارتباط با SQL Server و تست استورد پروسیجرهای فعال
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تست مجدد اتصالات</span>
        </button>
      </div>

      {/* وضعیت اتصالات دوگانه: وب‌سرویس و دیتابیس */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* کارت وضعیت وب‌سرویس Kestrel */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-900">سرویس وب ASP.NET Core 10</span>
            </div>
            {isApiLoading ? (
              <span className="text-[10px] text-slate-400">در حال بررسی...</span>
            ) : apiHealth?.status === 'Healthy' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                سالم و فعال
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3" />
                قطع یا خطا
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 mt-3 space-y-1.5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {apiHealth?.description || 'پاسخ دریافتی از اندپوینت GET /api/Health'}
            </p>
            <div className="text-[10px] text-slate-400 font-mono">
              زمان ثبت: {apiHealth?.timestampUtc || '—'}
            </div>
          </div>
        </div>

        {/* کارت وضعیت پایگاه داده HalalSazan در SQL Server */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900">ارتباط با دیتابیس HalalSazan</span>
            </div>
            {isDbLoading ? (
              <span className="text-[10px] text-slate-400">در حال بررسی...</span>
            ) : dbHealth?.status === 'Healthy' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                متصل و سالم
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3" />
                عدم دسترسی
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 mt-3 space-y-1.5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {dbHealth?.description || 'پاسخ دریافتی از اندپوینت GET /api/Health/database'}
            </p>
            <div className="text-[10px] text-slate-400 font-mono">
              زمان تست: {dbHealth?.timestampUtc || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* فرم ارسال رکورد واقعی به جدول dbo.test به همراه جدول نمایش رکوردهای دیتابیس */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* فرم ثبت رکورد */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>ثبت رکورد در جدول dbo.test (POST /api/Test)</span>
          </h3>

          <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                نام اپراتور یا شناسه (Name):
              </label>
              <input
                type="text"
                placeholder="مثلاً: علی رضایی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                سن یا کد آزمایشی (Age):
              </label>
              <input
                type="text"
                placeholder="مثلاً: 35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-sm shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending ? (
                <span>در حال ثبت...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>اجرای پروسیجر dbo.sp_InsertTest</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* لیست رکوردهای واقعی بازیابی‌شده از سرور */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-500" />
              <span>رکوردهای موجود در پایگاه داده (GET /api/Test via sp_SelectTest)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              تعداد: {records?.length || 0} رکورد
            </span>
          </div>

          <div className="flex-1 overflow-x-auto mt-2">
            {isRecordsLoading ? (
              <LoadingState message="در حال واکشی رکوردهای پایگاه داده..." className="h-40" />
            ) : isRecordsError ? (
              <ErrorState
                title="خطا در واکشی داده‌ها"
                message="امکان اتصال به پروسیجر dbo.sp_SelectTest وجود ندارد."
                onRetry={() => refetchRecords()}
                className="h-40"
              />
            ) : records && records.length > 0 ? (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 w-16 text-center font-semibold">شناسه (Id)</th>
                    <th className="py-2.5 px-3 font-semibold">نام (Name)</th>
                    <th className="py-2.5 px-3 font-semibold">سن (Age)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{r.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="py-2 px-3 font-mono text-amber-600 font-bold">{r.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                هیچ رکوردی در جدول dbo.test یافت نشد. می‌توانید از فرم بالا یک رکورد جدید ثبت نمایید.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
