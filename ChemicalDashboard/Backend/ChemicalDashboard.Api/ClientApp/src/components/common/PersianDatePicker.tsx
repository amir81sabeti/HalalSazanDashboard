import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEK_DAYS,
  toPersianDigits,
  toEnglishDigits,
  getDaysInJalaliMonth,
  getFirstDayOfWeekForMonth,
  getTodayJalali,
  formatJalaliDate,
  parseShamsiString,
} from '@/utils/persianDate';

export interface PersianDatePickerProps {
  value?: string; // فرمت استاندارد 1404/01/29 یا رشته خالی
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  minYear?: number;
  maxYear?: number;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value = '',
  onChange,
  placeholder = '۱۴۰۴/۰۱/۰۱',
  label,
  disabled = false,
  className = '',
  inputClassName = '',
  id,
  minYear = 1400,
  maxYear = 1410,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => getTodayJalali(), []);
  const todayStr = useMemo(() => formatJalaliDate(today.year, today.month, today.day), [today]);

  const parsedValue = useMemo(() => parseShamsiString(value), [value]);

  // ماه و سال جاری که در تقویم نمایش داده می‌شود
  const [viewYear, setViewYear] = useState<number>(() => parsedValue?.year ?? 1404);
  const [viewMonth, setViewMonth] = useState<number>(() => parsedValue?.month ?? today.month);

  // همگام‌سازی ماه و سال با مقدار ورودی زمانی که تغییر می‌کند
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [value]);

  // بستن منو با کلیک در بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // جابجایی ماه قبل
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => Math.max(minYear, y - 1));
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  // جابجایی ماه بعد
  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => Math.min(maxYear, y + 1));
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // انتخاب یک روز خاص
  const handleSelectDay = (day: number) => {
    const formatted = formatJalaliDate(viewYear, viewMonth, day);
    onChange(formatted);
    setIsOpen(false);
  };

  // انتخاب امروز
  const handleSelectToday = () => {
    onChange(todayStr);
    setViewYear(today.year);
    setViewMonth(today.month);
    setIsOpen(false);
  };

  // پاک کردن
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // سال‌های قابل انتخاب
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // تعداد روزهای ماه و آفست اولین روز هفته
  const daysInMonth = useMemo(() => getDaysInJalaliMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDayOfWeek = useMemo(() => getFirstDayOfWeekForMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 select-none">
          {label}
        </label>
      )}

      {/* اینپوت ورودی با آیکون تقویم */}
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(true)}
          onChange={(e) => {
            const raw = toEnglishDigits(e.target.value);
            onChange(raw);
          }}
          className={`w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl pr-8 pl-8 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono ${
            disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-700'
          } ${inputClassName}`}
        />

        {/* دکمه / آیکون باز کردن تقویم */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-0.5"
          title="باز کردن تقویم شمسی"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
        </button>

        {/* دکمه پاک کردن تاریخ در صورت پر بودن */}
        {value && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all"
            title="پاک کردن"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* پاپ‌اور تقویم شمسی */}
      {isOpen && !disabled && (
        <div
          dir="rtl"
          className="absolute z-50 top-full mt-2 right-0 w-[290px] bg-white dark:bg-[#0c1428] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* هدر تقویم: سال، ماه و ناوبری */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/80">
            {/* ماه بعد در جهت RTL (سمت راست = قبلی، سمت چپ = بعدی) */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* دراپ‌داون ماه و سال */}
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 px-2 rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {PERSIAN_MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 px-2 rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-amber-500 outline-none font-mono"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {toPersianDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* روزهای هفته (ش، ی، د، س، چ، پ، ج) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {PERSIAN_WEEK_DAYS.map((day, idx) => (
              <span
                key={day.short}
                className={`text-[11px] font-bold py-1 ${
                  idx === 6 ? 'text-rose-500 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                }`}
                title={day.full}
              >
                {day.short}
              </span>
            ))}
          </div>

          {/* شبکه روزهای ماه */}
          <div className="grid grid-cols-7 gap-1">
            {/* فضاهای خالی قبل از روز اول */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* روزهای ماه */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                parsedValue &&
                parsedValue.year === viewYear &&
                parsedValue.month === viewMonth &&
                parsedValue.day === dayNum;

              const isCurrentToday =
                today.year === viewYear && today.month === viewMonth && today.day === dayNum;

              const dayOfWeek = (firstDayOfWeek + i) % 7;
              const isFriday = dayOfWeek === 6;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50'
                      : isCurrentToday
                      ? 'border border-amber-500/80 text-amber-500 font-bold hover:bg-amber-500/10'
                      : isFriday
                      ? 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {toPersianDigits(dayNum)}
                </button>
              );
            })}
          </div>

          {/* فوتر با دکمه‌های سریع */}
          <div className="flex items-center justify-between gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-bold">
            <button
              type="button"
              onClick={handleSelectToday}
              className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline px-1 py-0.5 rounded"
            >
              <Sparkles className="w-3 h-3" />
              امروز
            </button>

            <button
              type="button"
              onClick={() => {
                setViewYear(1404);
                setViewMonth(1);
              }}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-1 py-0.5"
            >
              سال ۱۴۰۴
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-500 px-1 py-0.5"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
