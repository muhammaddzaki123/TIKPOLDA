// components/sidebar.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building,
  RadioTower,
  UserCheck,
  History,
  Archive, // Menggunakan ikon baru untuk riwayat pusat
  ArrowRightLeft, // Menggunakan ikon baru untuk riwayat internal
} from 'lucide-react';

// Definisikan item menu baru untuk Super Admin
const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manajemen Admin & Satker', href: '/dashboard/admin', icon: Users },
  { name: 'Pemantauan Satker', href: '/dashboard/satker', icon: Building },
  { name: 'Inventaris Pusat', href: '/dashboard/inventaris', icon: RadioTower },
  { name: 'Manajemen Personil', href: '/dashboard/personil', icon: UserCheck },
  { name: 'Riwayat Pinjam (Pusat)', href: '/dashboard/riwayat', icon: Archive },
  { name: 'Riwayat Internal (Satker)', href: '/dashboard/riwayat-internal', icon: ArrowRightLeft },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col bg-[#0d2436] p-4 text-white md:flex">
      <div className="mb-8 flex items-center justify-center space-x-3 border-b border-gray-700 pb-6">
        <Image src="/icon.svg" width={40} height={40} alt="Logo POLDA NTB" />
        <span className="text-lg font-semibold">Logistik POLDA NTB</span>
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