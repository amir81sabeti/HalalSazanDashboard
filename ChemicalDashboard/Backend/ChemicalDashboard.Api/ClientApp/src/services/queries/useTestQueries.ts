import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiTest, postApiTest } from '../generated/sdk.gen';
import type { CreateTestRecordRequestDto, TestRecordResponseDto } from '../generated/types.gen';

/**
 * کوئری دریافت رکوردهای جدول dbo.test از سرور SQL Server
 */
export function useTestRecords() {
  return useQuery<TestRecordResponseDto[]>({
    queryKey: ['test-records'],
    queryFn: async () => {
      const response = await getApiTest({ throwOnError: true });
      return response.data?.data || [];
    },
  });
}

/**
 * میوتیشن ثبت رکورد جدید در دیتابیس توسط پروسیجر dbo.sp_InsertTest
 */
export function useCreateTestRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTestRecordRequestDto) => {
      const response = await postApiTest({
        body: payload,
        throwOnError: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-records'] });
    },
  });
}
