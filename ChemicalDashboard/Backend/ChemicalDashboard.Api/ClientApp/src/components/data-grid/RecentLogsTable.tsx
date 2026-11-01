import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductionLogRecord } from '@/types';
import { PAGES_CONFIG } from '@/config/pages.config';

interface RecentLogsTableProps {
  logs: ProductionLogRecord[];
}

export const RecentLogsTable: React.FC<RecentLogsTableProps> = ({ logs }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#112340] via-[#0c1a30] to-[#081224] border border-sky-400/40 hover:border-sky-300 shadow-[0_6px_28px_-4px_rgba(14,165,233,0.28)] rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300">
      {/* هدر جدول */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-sky-400/25 bg-[#0e1d36]/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          <h3 className="text-xs font-bold text-white">
            <span>آخرین اطلاعات ثبت شده</span>
          </h3>
        </div>
        {PAGES_CONFIG.batchLogs && (
          <Link
            to="/batch-logs"
            className="text-[11px] text-sky-300 hover:text-sky-200 font-semibold transition-colors"
          >
            مشاهده همه
          </Link>
        )}
      </div>

      {/* محتوای اسکرول‌شونده جدول */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-right border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#0b162a]/90 text-slate-300 border-b border-white/10 font-bold select-none sticky top-0 backdrop-blur-md z-10">
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
          <tbody className="divide-y divide-white/5 text-slate-200">
            {logs.map((log) => {
              const isWarning = log.status === 'هشدار';
              return (
                <tr
                  key={log.rowNumber}
                  className="hover:bg-sky-500/15 transition-colors"
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-mono">
                    {log.rowNumber}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-300">{log.dateFa}</td>
                  <td className="py-2 px-3 font-mono text-slate-300">{log.timeStr}</td>
                  <td className="py-2 px-3 font-mono text-sky-300 font-bold">
                    {log.azgSpeed.toLocaleString('fa-IR')}
                  </td>
                  <td className="py-2 px-3 font-mono text-amber-300 font-bold">
                    {log.agSpeed.toLocaleString('fa-IR')}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-100">{log.productDegree}</td>
                  <td className="py-2 px-3 font-mono text-slate-100">{log.acidNumber}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isWarning
                          ? 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
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
