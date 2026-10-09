/**
 * اسکریپت همگام‌سازی و تولید کدهای کلاینت TypeScript از روی سند سواگر ASP.NET Core
 * این اسکریپت در صورت در دسترس بودن بک‌اند، فایل openapi.json را به‌روزرسانی کرده
 * و سپس تایپ‌ها و متدهای کلاینت را بازتولید می‌کند.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5226';
const swaggerUrl = `${apiBaseUrl.replace(/\/$/, '')}/swagger/v1/swagger.json`;
const localSchemaPath = path.resolve(rootDir, 'openapi.json');

console.log('🔄 در حال بررسی ارتباط با سواگر دات‌نت کور در:', swaggerUrl);

async function syncAndGenerate() {

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(swaggerUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.text();
      fs.writeFileSync(localSchemaPath, data, 'utf-8');
      console.log('✅ سند سواگر با موفقیت از سرور دریافت و در openapi.json ذخیره شد.');
      updatedOnline = true;
    }
  } catch {
    console.log('⚠️ سرور بک‌اند در دسترس نیست یا در حال اجرا نیست.');
    if (fs.existsSync(localSchemaPath)) {
      console.log('ℹ️ از فایل محلی openapi.json قبلی جهت تولید تایپ‌ها استفاده می‌شود.');
    } else {
      console.error('❌ فایل محلی openapi.json وجود ندارد و سرور نیز در دسترس نیست.');
      process.exit(1);
    }
  }

  console.log('⚙️ در حال تولید کدهای TypeScript با ابزار @hey-api/openapi-ts...');
  try {
    execSync(`npx openapi-ts -i ./openapi.json -o ./src/services/generated`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('🎉 کدهای کلاینت و تایپ‌های DTO در مسیر src/services/generated با موفقیت بازتولید شدند.');
  } catch (err) {
    console.error('❌ خطا در فراخوانی openapi-ts:', err);
    process.exit(1);
  }
}

syncAndGenerate();
