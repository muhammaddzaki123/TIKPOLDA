'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building, RadioTower, UserCheck, Archive, ArrowRightLeft,
  CheckSquare, ClipboardList, X,
} from 'lucide-react';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session, status } = useSession();

  useEffect(() => {
    // Menutup sidebar saat navigasi di layar mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname, setIsSidebarOpen]);

  // Redirect to login if session is invalid
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  // Show loading or prevent render if no session
  if (!session?.user) {
    return null;
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-[#0d2436] p-4 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/icon.svg" width={32} height={32} alt="Logo POLDA NTB" />
            <span className="text-base font-semibold">Logistik POLDA NTB</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-md p-2.5 text-sm font-medium transition-colors ${
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
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
        <div className="mt-auto border-t border-gray-700 pt-4">
          <p className="text-center text-xs text-gray-400">© 2025 Polda NTB</p>
        </div>
      </aside>
    </>
  );
}
