import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductionLogRecord } from '@/types';
import { PAGES_CONFIG } from '@/config/pages.config';

interface RecentLogsTableProps {
  logs: ProductionLogRecord[];
}

export const RecentLogsTable: React.FC<RecentLogsTableProps> = ({ logs }) => {
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* هدر جدول */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800">
          آخرین لاگ‌های ثبت شده
        </h3>
        {PAGES_CONFIG.batchLogs && (
          <Link
            to="/batch-logs"
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            مشاهده همه
          </Link>
        )}
      </div>

      {/* محتوای اسکرول‌شونده جدول */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-right border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-bold select-none">
              <th className="py-2 px-3 text-center w-12">ردیف</th>
              <th className="py-2 px-3">تاریخ</th>
              <th className="py-2 px-3">ساعت</th>
              <th className="py-2 px-3">سرعت AZG</th>
              <th className="py-2 px-3">سرعت AG</th>
              <th className="py-2 px-3">درجه محصول</th>
              <th className="py-2 px-3">عدد اسیدی</th>
              <th className="py-2 px-3 text-center">وضعیت</th>
              <th className="py-2 px-3">اپراتور</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {logs.map((log) => {
              const isWarning = log.status === 'هشدار';
              return (
                <tr
                  key={log.rowNumber}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-mono">
                    {log.rowNumber}
                  </td>
                  <td className="py-2 px-3 font-mono">{log.dateFa}</td>
                  <td className="py-2 px-3 font-mono">{log.timeStr}</td>
                  <td className="py-2 px-3 font-mono text-sky-600 font-bold">
                    {log.azgSpeed.toLocaleString('fa-IR')}
                  </td>
                  <td className="py-2 px-3 font-mono text-amber-600 font-bold">
                    {log.agSpeed.toLocaleString('fa-IR')}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-800">{log.productDegree}</td>
                  <td className="py-2 px-3 font-mono text-slate-800">{log.acidNumber}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isWarning
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600">{log.operatorName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
