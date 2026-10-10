import React from 'react';
import type { ProductionStatusInfo } from '@/types';

interface StatusCardProps {
  status: ProductionStatusInfo;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  return (
    <div className="relative flex flex-col justify-between p-4 rounded-xl bg-[#0f1c34]/90 border border-slate-700/40 backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
        <span className="text-xs text-slate-300 font-semibold">
          وضعیت تولید فعلی
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{status.statusText}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mt-2.5 text-slate-300">
        <div>
          <span className="text-slate-400">بچ جاری: </span>
          <span className="font-bold text-white">{status.currentBatch}</span>
        </div>
        <div>
          <span className="text-slate-400">راکتور: </span>
          <span className="font-bold text-white">{status.reactorNumber}</span>
        </div>
        <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>شروع: {status.startTimeFa}</span>
          <span className="text-amber-400 font-semibold">{status.elapsedHours} ساعت</span>
        </div>
      </div>
    </div>
  );
};
