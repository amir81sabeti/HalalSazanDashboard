import { useQuery } from '@tanstack/react-query';
import { getApiHealth, getApiHealthDatabase } from '../generated/sdk.gen';
import type { HealthStatusResponseDto } from '../generated/types.gen';

/**
 * کوئری بررسی سلامت سرویس وب دات‌نت کور
 */
export function useApiHealth() {
  return useQuery<HealthStatusResponseDto | undefined>({
    queryKey: ['health', 'api'],
    queryFn: async () => {
      const response = await getApiHealth({ throwOnError: true });
      return response.data?.data;
    },
    refetchInterval: 30000, // هر ۳۰ ثانیه جهت پایش سلامت زنده
    retry: 1,
  });
}

/**
 * کوئری بررسی اتصال اختصاصی به سرور SQL Server
 */
export function useDatabaseHealth() {
  return useQuery<HealthStatusResponseDto | undefined>({
    queryKey: ['health', 'database'],
    queryFn: async () => {
      const response = await getApiHealthDatabase({ throwOnError: true });
      return response.data?.data;
    },
    refetchInterval: 30000,
    retry: 1,
  });
}
