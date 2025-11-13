'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building, RadioTower, UserCheck, Archive, ArrowRightLeft,
  CheckSquare, ClipboardList, X,
} from 'lucide-react';
import { useEffect } from 'react';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manajemen Admin & Satker', href: '/dashboard/admin', icon: Users },
  { name: 'Pemantauan Satker', href: '/dashboard/satker', icon: Building },
  { name: 'Inventaris Pusat', href: '/dashboard/inventaris', icon: RadioTower },
  { name: 'Manajemen Personil', href: '/dashboard/personil', icon: UserCheck },
  { name: 'Pusat Persetujuan', href: '/dashboard/persetujuan', icon: CheckSquare },
  { name: 'Riwayat Pinjam (Pusat)', href: '/dashboard/riwayat', icon: Archive },
  { name: 'Riwayat Mutasi', href: '/dashboard/riwayat-mutasi', icon: ClipboardList },
  { name: 'Riwayat Internal (Satker)', href: '/dashboard/riwayat-internal', icon: ArrowRightLeft },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Menutup sidebar saat navigasi di layar mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname, setIsSidebarOpen]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* PERUBAHAN 1: Menghapus 'p-4' dan menambahkan 'flex flex-col' */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-[#0d2436] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* PERUBAHAN 2: Menambahkan 'relative', 'justify-center', dan padding (px-4 pt-4 pb-6) */}
        <div className="relative mb-6 flex items-center justify-center px-4 pt-4 pb-6">
          <div className="flex items-center space-x-3">
            <Image src="/icon.svg" width={32} height={32} alt="Logo POLDA NTB" />
            <span className="text-base font-semibold">Logistik POLDA NTB</span>
          </div>
          {/* PERUBAHAN 3: Tombol 'X' diposisikan 'absolute' */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* PERUBAHAN 4: Menambahkan 'px-4' untuk padding horizontal */}
        <nav className="flex-1 px-4">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-md p-2.5 text-sm font-medium transition-colors ${
                    // Logika active link sudah baik
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* PERUBAHAN 5: 'mt-auto' sudah ada, ubah 'pt-4' menjadi 'p-4' */}
        <div className="mt-auto border-t border-gray-700 p-4">
          <p className="text-center text-xs text-gray-400">© 2025 Polda NTB</p>
        </div>
      </aside>
    </>
  );
}