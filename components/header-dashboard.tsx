// components/header-dashboard.tsx

'use client';

import { Bell, UserCircle, LogOut } from 'lucide-react';
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

export default function HeaderDashboard() {
  const { data: session } = useSession();

  // Fungsi ini akan menghancurkan sesi dan mengarahkan pengguna
  // ke halaman login. URL lengkap akan dibangun secara aman
  // oleh NextAuth menggunakan variabel NEXTAUTH_URL.
  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login', // Setelah logout, kembali ke halaman login
      redirect: true,        // Pastikan redirect terjadi
    });
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Dashboard {session?.user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Satker'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

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
              onClick={handleLogout} // Panggil fungsi logout
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