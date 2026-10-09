import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductionLogRecord } from '@/types';

interface RecentLogsTableProps {
  logs: ProductionLogRecord[];
}

export const RecentLogsTable: React.FC<RecentLogsTableProps> = ({ logs }) => {
  return (
    <div className="flex flex-col h-full bg-[#0f1c34]/90 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-md">
      {/* هدر جدول */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/30">
        <h3 className="text-xs font-bold text-slate-100">
          آخرین لاگ‌های ثبت شده
        </h3>
        <Link
          to="/batch-logs"
          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          مشاهده همه
        </Link>
      </div>

      {/* محتوای اسکرول‌شونده جدول */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-right border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#0b1424] text-slate-400 border-b border-slate-700/40 font-semibold select-none">
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
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {logs.map((log) => {
              const isWarning = log.status === 'هشدار';
              return (
                <tr
                  key={log.rowNumber}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-mono">
                    {log.rowNumber}
                  </td>
                  <td className="py-2 px-3 font-mono">{log.dateFa}</td>
                  <td className="py-2 px-3 font-mono">{log.timeStr}</td>
                  <td className="py-2 px-3 font-mono text-sky-400 font-bold">
                    {log.azgSpeed.toLocaleString('fa-IR')}
                  </td>
                  <td className="py-2 px-3 font-mono text-amber-400 font-bold">
                    {log.agSpeed.toLocaleString('fa-IR')}
                  </td>
                  <td className="py-2 px-3 font-mono">{log.productDegree}</td>
                  <td className="py-2 px-3 font-mono">{log.acidNumber}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{log.operatorName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
