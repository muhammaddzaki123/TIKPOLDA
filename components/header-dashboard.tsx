'use client';

import { useState } from 'react';
import { UserCircle, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import NotificationBell from './notifications/NotificationBell';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderDashboardProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function HeaderDashboard({ isSidebarOpen, setIsSidebarOpen }: HeaderDashboardProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
      redirect: true,
    });
  };

  return (
    <header className="flex items-center justify-between border-b bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm md:justify-end transition-colors">
      {/* Tombol Hamburger untuk Mobile */}
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <NotificationBell />

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 p-2 h-auto dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => setIsDropdownOpen(true)}
            >
              <UserCircle className="h-8 w-8 text-slate-600 dark:text-slate-300" />
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold dark:text-slate-200">{session?.user?.nama || 'Pengguna'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{session?.user?.role?.replace('_', ' ') || 'Role'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
            <DropdownMenuLabel className="dark:text-slate-200">Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-slate-700" />
            <DropdownMenuItem className="dark:text-slate-300 dark:hover:bg-slate-700">
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log-out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
