// components/header-dashboard.tsx

'use client'; // Jadikan Client Component untuk interaksi (klik, state)

import { Bell, UserCircle, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react'; // Import useSession dan signOut
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

export default function HeaderDashboard() {
  // Ambil data sesi pengguna yang sedang login
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({
      callbackUrl: '/login', // Arahkan ke halaman login setelah logout
    });
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {/* Tampilkan role pengguna secara dinamis */}
          Dashboard {session?.user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Satker'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Menu Dropdown untuk Profil Pengguna */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2 h-auto">
              <UserCircle className="h-8 w-8 text-slate-600" />
              <div className="hidden text-right md:block">
                {/* Tampilkan nama pengguna dari sesi */}
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
              onClick={handleLogout} // Panggil fungsi logout saat diklik
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