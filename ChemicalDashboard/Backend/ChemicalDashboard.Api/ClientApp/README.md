# سامانه پایش و داشبورد صنعتی خط تولید اتیل استات (Chemical Dashboard Web)
## معمار و توسعه‌دهنده فرانت‌اند: React + TypeScript + Vite + Tailwind CSS

این پروژه رابط کاربری مدرن، استاندارد و صنعتی سامانه مانیتورینگ خط تولید اتیل استات (شرکت پتروشیمی حلال سازان) است که در تعامل مستقیم با وب‌سرویس ASP.NET Core 10 و پایگاه داده SQL Server پیاده‌سازی شده است.

---

## ۱. پیش‌نیازها (Prerequisites)
- **Node.js**: نسخه ۲۲ یا بالاتر (آزموده شده روی v24.12.0)
- **npm**: نسخه ۱۰ یا بالاتر (آزموده شده روی 11.6.4)
- **.NET SDK**: نسخه ۱۰ (جهت اجرای همزمان وب‌سرویس بک‌اند)
- **SQL Server 2022**: دیتابیس `HalalSazan`

---

## ۲. ساختار پروژه (Folder Structure)

```
ChemicalDashboard/
├── ChemicalDashboard.sln
├── Backend/
│   ├── ChemicalDashboard.Api/           # کنترلرها، CORS، Swagger و Kestrel
│   ├── ChemicalDashboard.Application/   # اینترفیس‌ها و سرویس‌های بیزینس
│   ├── ChemicalDashboard.Contracts/     # مدل‌های DTO و ApiResponse
│   └── ChemicalDashboard.Infrastructure/# Dapper و اتصالات SQL Server
└── Frontend/
    └── ChemicalDashboard.Web/
        ├── public/
        │   ├── fonts/                   # فونت‌های یکان، تیتر و هما
        │   └── images/                  # تصاویر پس‌زمینه هدر و منو
        ├── src/
        │   ├── app/                     # کامپوننت ریشه App و کانتینرها
        │   ├── assets/
        │   │   ├── fonts/               # فایل‌های فونت برنامه
        │   │   └── images/              # تصاویر صنعتی هدر و سایدبار
        │   ├── components/
        │   │   ├── common/              # KpiCard, StatusCard, ChartCard
        │   │   ├── layout/              # AppLayout, Header, Sidebar
        │   │   ├── charts/              # نمودارهای ECharts و پنل تنظیمات
        │   │   ├── data-grid/           # جدول لاگ‌های اخیر و AG Grid
        │   │   └── feedback/            # ToastProvider, ToastViewport, Empty/Loading/ErrorState
        │   ├── features/                # ماژول‌های مستقل فیچرهای آتی
        │   ├── hooks/                   # هوک‌های سراسری مانند useToast
        │   ├── pages/                   # صفحات Dashboard, Production, Inventory, BatchLogs, SystemStatus, NotFound
        │   ├── routes/                  # پیکربندی مسیریابی استاتیک React Router
        │   ├── services/
        │   │   ├── api/                 # کلاینت متمرکز Axios و Error Normalizer
        │   │   ├── generated/           # تایپ‌ها و متدهای خودکار سواگر (@hey-api/openapi-ts)
        │   │   └── queries/             # هوک‌های داده‌گیری TanStack Query
        │   ├── styles/                  # فونت‌ها، توکن‌های تم و استایل‌های عمومی RTL
        │   └── types/                   # تایپ‌های لایه ویومدل فرانت‌اند
        ├── scripts/
        │   └── generate-api.mjs         # اسکریپت همگام‌سازی DTOها با سواگر
        ├── openapi.json                 # اسکیمای محلی آفلاین OpenAPI
        ├── .env                         # تنظیمات محیطی جاری
        ├── .env.example                 # نمونه تنظیمات محیطی
        ├── vite.config.ts               # تنظیمات Vite و پلاگین Tailwind
        ├── tsconfig.json                # تنظیمات تایپ‌اسکریپت
        └── package.json
```

---

## ۳. متغیرهای محیطی (Environment Variables)

در فایل `.env` آدرس سرویس وب مشخص شده است:
```ini
# آدرس وب‌سرویس دات‌نت کور
VITE_API_BASE_URL=http://localhost:5226
```

---

## ۴. راه‌اندازی و اجرای برنامه (Running Locally)

### گام اول: اجرای بک‌اند
در پوشه بک‌اند دستور زیر را اجرا کنید:
```bash
cd Backend/ChemicalDashboard.Api
dotnet run --launch-profile http
```
وب‌سرویس روی آدرس `http://localhost:5226` و سواگر روی `http://localhost:5226/swagger` در دسترس خواهد بود.

### گام دوم: اجرای فرانت‌اند
در پوشه `Frontend/ChemicalDashboard.Web` دستورات زیر را وارد نمایید:
```bash
# نصب پکیج‌ها (در صورت نیاز)
npm install

# اجرای سرور توسعه Vite
npm run dev
```
رابط کاربری در آدرس `http://localhost:5173/` قابل مشاهده است.

---

## ۵. همگام‌سازی خودکار کلاینت و DTOها از روی Swagger

برای به‌روزرسانی تایپ‌ها و کلاینت API پس از تغییر پروسیجرها یا DTOهای دات‌نت، دستور زیر را اجرا کنید:
```bash
npm run api:generate
```
این اسکریپت:
1. ابتدا سلامت سواگر در حال اجرا در `http://localhost:5226/swagger/v1/swagger.json` را بررسی کرده و فایل `openapi.json` را دریافت می‌کند.
2. با ابزار `@hey-api/openapi-ts` تمام کدهای تایپ‌اسکریپت را در پوشه `src/services/generated` بازتولید می‌نماید.
3. در صورت آفلاین بودن بک‌اند، از آخرین نسخه ذخیره‌شده `openapi.json` استفاده می‌کند.

همچنین برای اجرای مستقل با اسکیمای محلی:
```bash
npm run api:generate:local
```

---

## ۶. تست و بررسی صحت کدها (Checks & Build)

```bash
# بررسی اعتبارسنجی Linter بدون خطا:
npm run lint

# بیلد نهایی عملیاتی (Production Build):
npm run build
```

---

## ۷. صفحات و مسیرهای برنامه (Static Routes)
1. **داشبورد اصلی (`/`)**: نمایش کامل شاخص‌های کلیدی، وضعیت بچ و راکتور فعال، نمودارهای روند، فشار، دما، عدد اسیدی، توزیع محصولات، آخرین لاگ‌ها و پنل تنظیمات نمودار مطابق با اسکرین‌شات مرجع.
2. **تحلیل روند و خط تولید (`/production`)**: وضعیت ۴ راکتور، ستون تقطیر، ریبویلر و کندانسور.
3. **سوابق و مقایسه بچ‌ها (`/batch-logs`)**: جدول داده‌ای AG Grid Community با قابلیت سورت، فیلتر و خروجی CSV.
4. **موجودی مخازن و گزارشات انبار (`/inventory`)**: پایش ظرفیت مزرعه مخازن TK-101 تا TK-202 و سوابق ورود و خروج خوراک.
5. **تست سلامت و اتصال سرور (`/system-status`)**: پایش زنده سلامت API و SQL Server و اجرای واقعی پروسیجرهای `dbo.sp_SelectTest` و `dbo.sp_InsertTest`.
6. **صفحه پیدا نشد (`*`)**: خطای ۴۰۴ با طراحی هماهنگ.

---

## ۸. سیستم اعلان اختصاصی (Custom Toaster)
از هیچ کامپوننت پیش‌فرض مرورگر (`alert`) استفاده نشده است. کامپوننت‌های `ToastProvider` و `ToastViewport` همراه با هوک `useToast` اعلان‌های زیبا در ۴ نوع Success، Error، Warning و Info را با متن‌های فارسی و استایل هماهنگ ارائه می‌دهند.
```typescript
import { useToast } from '@/hooks/useToast';

const toast = useToast();
toast.success('اطلاعات با موفقیت ذخیره شد.');
toast.error('خطا در اتصال به پایگاه داده.');
```
