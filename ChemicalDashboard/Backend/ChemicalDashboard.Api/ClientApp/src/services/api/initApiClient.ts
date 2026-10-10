import { client } from '../generated/client.gen';
import { API_BASE_URL } from './axiosInstance';

/**
 * پیکربندی کلاینت کدهای جنریت شده @hey-api با آدرس سرور
 */
export function initializeGeneratedApiClient(): void {
  client.setConfig({
    baseUrl: API_BASE_URL,
  });
}
