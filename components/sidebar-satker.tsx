// File: components/sidebar-satker.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Warehouse,
  Users,
  Send,
  History,
  ClipboardPenLine, // Ikon ini akan kita gunakan untuk riwayat
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// Definisikan item menu untuk Admin Satker
const sidebarItems = [
  { name: 'Dashboard', href: '/satker-admin', icon: LayoutDashboard },
  { name: 'Inventaris HT', href: '/satker-admin/inventaris', icon: Warehouse },
  { name: 'Data Personil', href: '/satker-admin/personil', icon: Users },
  { name: 'Peminjaman & Pengembalian', href: '/satker-admin/peminjaman', icon: History },
  // --- MENU BARU DITAMBAHKAN DI SINI ---
  { name: 'Riwayat Peminjaman', href: '/satker-admin/riwayat-peminjaman', icon: ClipboardPenLine },
  { name: 'Pengajuan', href: '/satker-admin/pengajuan', icon: Send },
];

export default function SidebarSatker() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden w-64 flex-col bg-[#0d2436] p-4 text-white md:flex">
      <div className="mb-8 flex flex-col items-center justify-center space-y-3 border-b border-gray-700 pb-6 text-center">
        <Image src="/icon.svg" width={40} height={40} alt="Logo" />
        <span className="text-lg font-semibold">Admin Satker</span>
        {/* Menampilkan nama Satker yang dikelola oleh admin yang sedang login */}
        <span className="text-sm font-medium text-cyan-400">{session?.user.satker?.nama || 'Satuan Kerja'}</span>
      </div>
      <nav className="flex-1">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 rounded-md p-3 text-sm font-medium transition-colors ${
                  // Logika untuk highlight menu aktif
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
      <div className="mt-auto border-t border-gray-700 pt-4">
        <p className="text-center text-xs text-gray-400">© 2025 Polda NTB</p>
      </div>
    </aside>
  );
}