'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Warehouse,
  Users,
  History,
} from 'lucide-react';

// Menu yang lebih sederhana untuk Admin Satker
const sidebarItems = [
  { name: 'Dashboard', href: '/satker-admin', icon: LayoutDashboard },
  { name: 'Inventaris HT', href: '/satker-admin/inventaris', icon: Warehouse },
  { name: 'Data Personil', href: '/satker-admin/personil', icon: Users },
  { name: 'Riwayat Peminjaman', href: '/satker-admin/riwayat', icon: History },
];

export default function SidebarSatker() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col bg-[#0d2436] p-4 text-white md:flex">
      <div className="mb-8 flex items-center justify-center space-x-3 border-b border-gray-700 pb-6">
        <Image src="/logo-polda.png" width={40} height={40} alt="Logo" />
        <span className="text-lg font-semibold">Logistik DITLANTAS</span> {/* Nama Satker bisa dinamis */}
      </div>
      <nav className="flex-1">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 rounded-md p-3 text-sm font-medium transition-colors ${
                  pathname === item.href
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