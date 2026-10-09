# پروژه معماری بک‌اند سیستم داشبورد شیمیایی (ChemicalDashboard)
## سیستم پایش و کنترل تولید اتیل استات (Ethyl Acetate Production Dashboard)

این پروژه زیرساخت و معماری پایه بک‌اند داشبورد صنعتی پالایشگاه و کارخانه شیمیایی را بر اساس استاندارد Clean Architecture و به تفکیک چهار لایه مستقل در **.NET 10** فراهم می‌کند.

---

## ۱. ساختار راه‌حل و پروژه‌ها (Solution Structure)

```text
ChemicalDashboard/
├── ChemicalDashboard.sln
├── README.md
├── Backend/
│   ├── ChemicalDashboard.Api/               # لایه وب، کنترلرها، Swagger UI و میدل‌ویرها
│   ├── ChemicalDashboard.Application/       # منطق تجاری، اینترفیس‌ها، ولیدیشن و ارکستراسیون
│   ├── ChemicalDashboard.Contracts/         # مدل‌های داده DTO، درخواست‌ها و پاسخ‌ها
│   └── ChemicalDashboard.Infrastructure/    # تعامل با دیتابیس با Dapper و Stored Procedures
└── Frontend/
    └── ChemicalDashboard.Web/               # رابط کاربری React + TypeScript + Vite + Tailwind CSS
```

---

## ۲. مسئولیت‌های هر لایه (Layer Responsibilities)

1. **ChemicalDashboard.Contracts**
   - حاوی مدل‌های انتقال داده (`DTO`) نظیر `TestRecordResponseDto`، `CreateTestRecordRequestDto`، `ApiResponse<T>` و `HealthStatusResponseDto`.
   - کاملاً مستقل و بدون هیچ وابستگی پروژه یا پکیج پایگاه داده.

2. **ChemicalDashboard.Application**
   - حاوی اینترفیس‌های سرویس‌ها (`ITestService`)، اینترفیس‌های ریپازیتوری (`ITestRepository`)، اینترفیس کارخانه اتصال (`IDbConnectionFactory`) و اینترفیس سلامت (`IDatabaseHealthCheck`).
   - حاوی پیاده‌سازی سرویس‌ها (`TestService`) و اعتبارسنجی منطق تجاری.
   - سرویس‌ها هیچ وابستگی مستقیمی به `SqlConnection` یا Dapper ندارند.
   - رفرنس‌ها: فقط به `ChemicalDashboard.Contracts`.

3. **ChemicalDashboard.Infrastructure**
   - پیاده‌سازی کارخانه اتصال `SqlConnectionFactory` با استفاده از `Microsoft.Data.SqlClient`.
   - اجرای منحصراً استورد پروسیجرها با Dapper (`CommandType.StoredProcedure`).
   - پیاده‌سازی ریپازیتوری `TestRepository` و سرویس سلامت `DatabaseHealthCheck`.
   - رفرنس‌ها: به `ChemicalDashboard.Application` و `ChemicalDashboard.Contracts`.

4. **ChemicalDashboard.Api**
   - کنترلرهای API نظیر `TestController` و `HealthController`.
   - بدون هیچ کوئری یا فراخوانی Dapper در لایه کنترلر.
   - ثبت تزریق وابستگی‌ها (DI) از طریق متدهای توسعه `AddApplicationServices` و `AddInfrastructureServices`.
   - مدیریت متمرکز خطاها از طریق `ExceptionHandlingMiddleware` بدون افشای جزییات داخلی به کلاینت.
   - مستندسازی و رابط کاربری Swagger UI فعال در محیط Development.
   - رفرنس‌ها: به `ChemicalDashboard.Application`, `ChemicalDashboard.Contracts`, و `ChemicalDashboard.Infrastructure`.

---

## ۳. پکیج‌های نصب‌شده (Installed NuGet Packages)

| پروژه | پکیج | نگارش | هدف و کاربرد |
|---|---|---|---|
| Infrastructure | `Dapper` | 2.1.89 | دسترسی سریع و بهینه به پایگاه داده از طریق Stored Procedure |
| Infrastructure | `Microsoft.Data.SqlClient` | 7.1.1 | برقراری اتصال ADO.NET به SQL Server |
| Infrastructure | `Microsoft.Extensions.Configuration.Abstractions` | 10.0.12 | خواندن رشته اتصال از فایل‌های پیکربندی |
| Application | `Microsoft.Extensions.Logging.Abstractions` | 10.0.12 | ثبت لاگ‌های ساختاریافته در لایه منطق تجاری |
| Api | `Swashbuckle.AspNetCore` | 10.3.0 | ایجاد OpenAPI و رابط تست Swagger UI برای .NET 10 |

---

## ۴. پیکربندی پایگاه داده (Database Configuration)

رشته اتصال به دیتابیس در فایل‌های پیکربندی `appsettings.json` و `appsettings.Development.json` قرار گرفته است:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=DESKTOP-3JJDKDN\\SQL2022;Database=HalalSazan;Integrated Security=True;TrustServerCertificate=True;Connect Timeout=30;"
}
```

- برای تغییر محیط (مثلاً Production)، کافی است رشته اتصال در متغیرهای محیطی یا فایل پیکربندی مربوطه تغییر یابد و نیازی به کامپایل مجدد برنامه نیست.
- رشته اتصال هرگز در کدها هاردکد نشده و از طریق `IDbConnectionFactory` تزریق می‌شود.

---

## ۵. اندپوینت‌های ایجاد شده (API Endpoints)

- `GET /api/test`: فراخوانی پروسیجر `dbo.sp_SelectTest` و بازیابی رکوردهای جدول `dbo.test`.
- `POST /api/test`: اعتبارسنجی مقادیر ورودی و فراخوانی پروسیجر `dbo.sp_InsertTest` جهت درج رکورد.
- `GET /api/health`: بررسی سریع و سبک وضعیت فعال بودن وب‌سرویس.
- `GET /api/health/database`: بررسی برقراری اتصال با سرور پایگاه داده SQL Server به صورت عندالمطالبه.
- `GET /swagger`: رابط کاربری Swagger UI جهت تست مستقیم اندپوینت‌ها در مرورگر.

---

## ۶. نحوه اجرای پروژه به صورت محلی (How to Run)

برای اجرای برنامه از خط فرمان:

```powershell
dotnet run --project ChemicalDashboard\Backend\ChemicalDashboard.Api\ChemicalDashboard.Api.csproj
```

سپس برای مشاهده Swagger UI در مرورگر:
```text
http://localhost:5226/swagger
```
یا بر روی آدرس HTTPS:
```text
https://localhost:7061/swagger
```
