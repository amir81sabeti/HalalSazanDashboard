import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';

export interface RealtimeUpdatePayload {
  eventType: string;
  message: string;
  reactorId?: number;
  batchId?: number;
  batchNumber?: string;
  timestamp: string;
  payload?: any;
}

export interface ReactorLatestBatch {
  reactorId: number;
  reactorName: string;
  batchId: number;
  batchNumber: number;
  isActive: boolean;
  logCount: number;
  startDateShamsi: string;
  endDateShamsi: string;
  currentSpeed?: number;
  currentAcidNumber?: number;
}

interface RealtimeContextType {
  isConnected: boolean;
  isPulsing: boolean;
  lastUpdate: RealtimeUpdatePayload | null;
  latestActiveBatches: ReactorLatestBatch[];
  isLoadingLatest: boolean;
  triggerTestPulse: (message?: string) => Promise<void>;
  simulateMaterialEntry: (materialName: string, reactorId: number) => Promise<void>;
  fetchLatestActiveBatches: () => Promise<ReactorLatestBatch[]>;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdatePayload | null>(null);
  const [latestActiveBatches, setLatestActiveBatches] = useState<ReactorLatestBatch[]>([]);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);

  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hubConnectionRef = useRef<HubConnection | null>(null);

  const queryClient = useQueryClient();
  const { success } = useToast();

  // اجرای انیمیشن نبض و نمایش توستر سبز
  const triggerPulseEffect = useCallback(
    (message = 'دیتا بروز شد') => {
      setIsPulsing(true);

      // توستر سبز با عنوان سامانه و متن دیتا بروز شد
      success(message || 'دیتا بروز شد', 'سامانه پایش بلادرنگ (SignalR)');

      // بازنشانی کلیه کوئری‌های مرتبط با نمودارها و گزارشات جهت بارگذاری خودکار و آنی بدون رفرش
      queryClient.invalidateQueries({ queryKey: ['chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['chart-batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['golden-batch-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['excel-monthly-production'] });
      queryClient.invalidateQueries({ queryKey: ['excel-quality-stability'] });
      queryClient.invalidateQueries({ queryKey: ['excel-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['excel-reactor-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['excel-mass-balance'] });
      queryClient.invalidateQueries({ queryKey: ['excel-raw-logs'] });
      queryClient.invalidateQueries({ queryKey: ['excel-tahmasbi'] });
      queryClient.invalidateQueries({ queryKey: ['test-records'] });

      if (pulseTimerRef.current) {
        clearTimeout(pulseTimerRef.current);
      }
      pulseTimerRef.current = setTimeout(() => {
        setIsPulsing(false);
      }, 1500);
    },
    [queryClient, success]
  );

  // واکشی آخرین وضعیت بچ‌های فعال راکتورها
  const fetchLatestActiveBatches = useCallback(async (): Promise<ReactorLatestBatch[]> => {
    setIsLoadingLatest(true);
    try {
      const response = await axios.get<{ success: boolean; data: ReactorLatestBatch[] }>(
        '/api/realtime/latest-active-batches'
      );
      if (response.data?.data) {
        setLatestActiveBatches(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching latest active batches:', err);
      return [];
    } finally {
      setIsLoadingLatest(false);
    }
  }, []);

  // راه‌اندازی و اتصال سوکت سیگنال‌آر
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/production')
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    hubConnectionRef.current = connection;

    // ثبت شنونده رویداد بلادرنگ دریافت داده و نبض
    connection.on('ReceiveProductionUpdate', (data: RealtimeUpdatePayload) => {
      console.log('⚡ دریافت رویداد بلادرنگ از SignalR:', data);
      setLastUpdate(data);
      triggerPulseEffect(data.message || 'دیتا بروز شد');
    });

    // شروع کانکشن
    connection
      .start()
      .then(() => {
        console.log('✅ اتصال دائمی SignalR به سرور با موفقیت برقرار شد.');
        setIsConnected(true);
      })
      .catch((err) => {
        console.warn('⚠️ تلاش برای اتصال به هاب SignalR با خطا مواجه شد:', err);
        setIsConnected(false);
      });

    connection.onclose(() => setIsConnected(false));
    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));

    // واکشی اولیه آخرین بچ‌های فعال
    fetchLatestActiveBatches();

    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      connection.stop();
    };
  }, [triggerPulseEffect, fetchLatestActiveBatches]);

  // ارسال دستی ضربان قلب برای تست انیمیشن
  const triggerTestPulse = useCallback(
    async (message = 'دیتا بروز شد') => {
      try {
        await axios.post('/api/realtime/pulse', null, { params: { message } });
      } catch {
        // در صورت عدم دسترسی به سرور، انیمیشن کلاینت برای تست اجرا شود
        triggerPulseEffect(message);
      }
    },
    [triggerPulseEffect]
  );

  // شبیه‌سازی ورود ماده و فیلتر خودکار
  const simulateMaterialEntry = useCallback(
    async (materialName: string, reactorId: number) => {
      try {
        await axios.post('/api/realtime/material-entry', {
          materialName,
          reactorId,
          quantityKg: 1500,
        });
      } catch {
        triggerPulseEffect(`ماده اولیه ${materialName} ثبت شد. فیلتر بچ‌ها بروزرسانی گردید.`);
      }
    },
    [triggerPulseEffect]
  );

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        isPulsing,
        lastUpdate,
        latestActiveBatches,
        isLoadingLatest,
        triggerTestPulse,
        simulateMaterialEntry,
        fetchLatestActiveBatches,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
