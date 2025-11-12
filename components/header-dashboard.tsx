'use client';

import { UserCircle, LogOut, Menu } from 'lucide-react';
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

interface HeaderDashboardProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function HeaderDashboard({ isSidebarOpen, setIsSidebarOpen }: HeaderDashboardProps) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
      redirect: true,
    });
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm md:justify-end">
      {/* Tombol Hamburger untuk Mobile */}
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2 h-auto">
              <UserCircle className="h-8 w-8 text-slate-600" />
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold">{session?.user?.nama || 'Pengguna'}</p>
                <p className="text-xs text-slate-500">{session?.user?.role?.replace('_', ' ') || 'Role'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
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
