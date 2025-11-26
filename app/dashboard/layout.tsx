'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import HeaderDashboard from '@/components/header-dashboard';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex flex-1 flex-col">
          <HeaderDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900 transition-colors">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
