'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Warehouse, Users, Send, History, ClipboardPenLine, X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const sidebarItems = [
  { name: 'Dashboard', href: '/satker-admin', icon: LayoutDashboard },
  { name: 'Inventaris HT', href: '/satker-admin/inventaris', icon: Warehouse },
  { name: 'Data Personil', href: '/satker-admin/personil', icon: Users },
  { name: 'Peminjaman & Pengembalian', href: '/satker-admin/peminjaman', icon: History },
  { name: 'Riwayat Peminjaman', href: '/satker-admin/riwayat-peminjaman', icon: ClipboardPenLine },
  { name: 'Pengajuan', href: '/satker-admin/pengajuan', icon: Send },
];

interface SidebarSatkerProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function SidebarSatker({ isSidebarOpen, setIsSidebarOpen }: SidebarSatkerProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
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
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-[#0d2436] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="relative mb-6 flex items-center justify-center px-4 pt-4 pb-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image src="/icon.svg" width={32} height={32} alt="Logo" />
            <div className="flex flex-col">
              <span className="text-base font-semibold">Admin Satker</span>
              <span className="text-xs font-medium text-cyan-400">{session?.user.satker?.nama || 'Satuan Kerja'}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* PERUBAHAN 4 (Nav):
          - Menambahkan 'px-4' untuk padding horizontal
          - 'flex-1' akan otomatis mengisi ruang kosong
        */}
        <nav className="flex-1 px-4">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-md p-2.5 text-sm font-medium transition-colors ${
                    pathname === item.href || (item.href !== '/satker-admin' && pathname.startsWith(item.href))
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

        <div className="mt-auto border-t border-gray-700 p-4">
          <p className="text-center text-xs text-gray-400">© 2025 Polda NTB</p>
        </div>
      </aside>
    </>
  );
}