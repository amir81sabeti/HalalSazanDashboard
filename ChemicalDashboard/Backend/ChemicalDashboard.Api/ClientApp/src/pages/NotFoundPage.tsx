import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 gap-4">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <AlertCircle className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h1 className="text-4xl font-black text-white font-mono">۴۰۴</h1>
        <h2 className="text-lg font-bold text-slate-200">صفحه مورد نظر یافت نشد</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          آدرس درخواستی شما در سامانه پایش خط تولید وجود ندارد یا به مسیر دیگری منتقل شده است.
        </p>
      </div>

      <Link
        to="/"
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
      >
        <Home className="w-4 h-4" />
        <span>بازگشت به داشبورد اصلی</span>
      </Link>
    </div>
  );
};
