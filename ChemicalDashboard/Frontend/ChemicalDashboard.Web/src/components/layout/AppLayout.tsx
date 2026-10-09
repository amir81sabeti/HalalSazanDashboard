import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastViewport } from '@/components/feedback/ToastViewport';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [year, setYear] = useState('1404');
  const [reactor, setReactor] = useState('all');
  const [cut, setCut] = useState('all');
  const [startDate] = useState('1404/01/01');
  const [endDate] = useState('1404/03/31');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070e1b] text-slate-100 select-none">
      {/* منوی کناری ثابت دسکتاپ و کشویی موبایل */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* بخش اصلی اپلیکیشن شامل هدر و محتوای صفحات */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          year={year}
          onYearChange={setYear}
          reactor={reactor}
          onReactorChange={setReactor}
          cut={cut}
          onCutChange={setCut}
          startDate={startDate}
          endDate={endDate}
        />

        {/* ناحیه محتوای پویای صفحه با اسکرول مستقل */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-4 bg-[#070e1b]">
          <div className="max-w-[1920px] mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* سامانه نوتیفیکیشن‌ها و اعلان‌های سیستم */}
      <ToastViewport />
    </div>
  );
};
