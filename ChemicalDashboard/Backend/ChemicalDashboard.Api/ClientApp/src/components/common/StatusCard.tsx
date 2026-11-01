import React from 'react';
import type { ProductionStatusInfo } from '@/types';
import { useRealtime } from '@/services/realtime/RealtimeContext';

interface StatusCardProps {
  status: ProductionStatusInfo;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  const { isPulsing } = useRealtime();

  return (
    <div
      className={`relative flex flex-col justify-between p-3.5 pt-4 rounded-2xl bg-gradient-to-b from-[#0c3a2d] via-[#08291f] to-[#051c15] border border-emerald-400/40 hover:border-emerald-300 shadow-[0_6px_24px_-4px_rgba(16,185,129,0.28)] backdrop-blur-md transition-all duration-300 overflow-hidden ${
        isPulsing ? 'heartbeat-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-emerald-400/25">
        <span className="text-xs text-slate-100 font-bold">
          وضعیت تولید فعلی
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>{status.statusText}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mt-2 text-slate-200">
        <div>
          <span className="text-slate-300 text-[11px]">بچ جاری: </span>
          <span className="font-bold text-white">{status.currentBatch}</span>
        </div>
        <div>
          <span className="text-slate-300 text-[11px]">راکتور: </span>
          <span className="font-bold text-white">{status.reactorNumber}</span>
        </div>
        <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-300 pt-1">
          <span>شروع: {status.startTimeFa}</span>
          <span className="text-amber-300 font-bold">{status.elapsedHours} ساعت</span>
        </div>
      </div>
    </div>
  );
};
