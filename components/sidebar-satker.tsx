'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Warehouse,
  Users,
  History,
  Send,
  ChevronDown,
} from 'lucide-react';

// Tipe data baru untuk mendukung sub-menu
type SidebarItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: SidebarItem[];
};

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/satker-admin', icon: LayoutDashboard },
  { name: 'Inventaris HT', href: '/satker-admin/inventaris', icon: Warehouse },
  { name: 'Data Personil', href: '/satker-admin/personil', icon: Users },
  {
    name: 'Pinjam HT',
    href: '/satker-admin/peminjaman', // href dasar
    icon: Send,
    subItems: [
      { name: 'Ajukan Peminjaman', href: '/satker-admin/pengajuan', icon: Send },
      { name: 'Riwayat Peminjaman', href: '/satker-admin/riwayat', icon: History },
    ],
  },
];

export default function SidebarSatker() {
  const pathname = usePathname();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(
    sidebarItems.find(item => item.subItems?.some(sub => pathname.startsWith(sub.href)))?.name || null
  );

  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  return (
    <aside className="hidden w-64 flex-col bg-[#0d2436] p-4 text-white md:flex">
      <div className="mb-8 flex items-center justify-center space-x-3 border-b border-gray-700 pb-6">
        <Image src="/icon.svg" width={40} height={40} alt="Logo" />
        <span className="text-lg font-semibold">Logistik DITLANTAS</span>
      </div>
      <nav className="flex-1">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className="flex w-full items-center justify-between p-3 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        openSubMenu === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openSubMenu === item.name && (
                    <ul className="ml-4 mt-1 border-l border-slate-700 pl-3">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center space-x-3 rounded-md p-3 text-sm font-medium transition-colors ${
                              pathname === subItem.href
                                ? 'bg-slate-700 text-white'
                                : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
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
              )}
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