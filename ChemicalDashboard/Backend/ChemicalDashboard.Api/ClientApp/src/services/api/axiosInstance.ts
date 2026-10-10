import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

/**
 * مدل استاندارد خطای API در فرانت‌اند
 */
export interface NormalizedApiError {
  status: number;
  message: string;
  details?: unknown;
  timestamp: string;
}

/**
 * تعیین آدرس پایه API از متغیرهای محیطی با مقدار پیش‌فرض ایمن برای توسعه
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? '' : 'http://localhost:5226');

/**
 * کلاینت سراسری Axios با تنظیمات متمرکز، تایم‌اوت و رهگیری درخواست‌ها
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// اینترسپتور درخواست‌ها (Request Interceptor)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // در صورت نیاز به افزودن توکن یا هدرهای ردیابی در فازهای آتی، اینجا اضافه می‌شود
    return config;
  },
  (error: unknown) => {
    return Promise.reject(normalizeError(error));
  }
);

// اینترسپتور پاسخ‌ها (Response Interceptor)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: unknown) => {
    return Promise.reject(normalizeError(error));
  }
);

/**
 * تبدیل خطاهای شبکه و سرور به ساختار نرمال‌شده و کاربرپسند بدون افشای جزییات محرمانه
 */
export function normalizeError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const status = axiosError.response?.status || 0;

    let message = 'خطا در برقراری ارتباط با سرور.';
    if (status === 0) {
      message = 'سرور وب بک‌اند در دسترس نیست. لطفاً از روشن بودن سرویس مطمئن شوید.';
    } else if (status === 400) {
      message = axiosError.response?.data?.message || 'اطلاعات ارسالی نامعتبر است.';
    } else if (status === 404) {
      message = 'منبع درخواستی در سرور یافت نشد.';
    } else if (status === 500) {
      message = axiosError.response?.data?.message || 'خطای داخلی در سرور رخ داده است.';
    } else if (status === 503) {
      message = axiosError.response?.data?.message || 'پایگاه داده یا سرویس موقتاً در دسترس نیست.';
    }

    return {
      status,
      message,
      details: axiosError.response?.data,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      status: -1,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    status: -1,
    message: 'خطای پیش‌بینی نشده‌ای رخ داده است.',
    timestamp: new Date().toISOString(),
  };
}
