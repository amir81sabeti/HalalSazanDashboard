import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  FileSpreadsheet,
  Database,
  Settings,
  Factory,
  X,
  LineChart,
} from 'lucide-react';

import { PAGES_CONFIG, type PageKey } from '@/config/pages.config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  key: PageKey;
  to: string;
  labelFa: string;
  icon: React.ComponentType<{ className?: string }>;
}

const allNavItems: NavItem[] = [
  { key: 'dashboard', to: '/', labelFa: 'داشبورد', icon: LayoutDashboard },
  { key: 'dynamicChart', to: '/dynamic-chart', labelFa: 'نمودار تحلیل داینامیک', icon: LineChart },
  { key: 'production', to: '/production', labelFa: 'تحلیل روند و تولید', icon: TrendingUp },
  { key: 'batchLogs', to: '/batch-logs', labelFa: 'سوابق و مقایسه بچ‌ها', icon: Layers },
  { key: 'inventory', to: '/inventory', labelFa: 'موجودی و گزارشات انبار', icon: FileSpreadsheet },
  { key: 'systemStatus', to: '/system-status', labelFa: 'داده‌های تست و سلامت سرور', icon: Database },
];

const navItems = allNavItems.filter((item) => PAGES_CONFIG[item.key]);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* اوورلی تاریک برای حالت تبلت و موبایل */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="بستن منو"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-64 flex flex-col justify-between border-l border-slate-800/80 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8, 16, 34, 0.68) 0%, rgba(9, 18, 38, 0.35) 45%, rgba(6, 13, 26, 0.75) 100%), url('/images/sidebar-bg-right.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundColor: '#0a1324',
        }}
      >
        {/* بخش بالایی: لوگو و عنوان سامانه */}
        <div>
          <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-slate-700/40 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white tracking-wide font-sans">
                  Ethyl Acetate
                </span>
                <span className="text-[11px] text-amber-400 font-bold">
                  خط تولید اتیل استات
                </span>
              </div>
            </div>

            {/* دکمه بستن در موبایل */}
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن منوی کناری"
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* منوی ناوبری ثابت (Static Navigation) */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 font-black'
                        : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.labelFa}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* بخش پایینی: شعار صنعتی و نماد خط تولید */}
        <div className="p-4 border-t border-slate-700/40 bg-black/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer p-2 rounded-lg transition-colors text-xs">
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">تنظیمات سامانه</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-amber-400/90 font-mono tracking-wider font-bold">
              Better Process, Brighter Tomorrow
            </p>
            <p className="text-[10px] text-slate-300 mt-0.5">
              شرکت پتروشیمی حلال سازان
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
