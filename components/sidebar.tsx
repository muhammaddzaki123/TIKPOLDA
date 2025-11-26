'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building, RadioTower, UserCheck, Archive, ArrowRightLeft,
  CheckSquare, ClipboardList, X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [showDeveloperInfo, setShowDeveloperInfo] = useState(false);

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
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-gradient-to-b from-[#0B1221] via-[#0d2436] to-[#0B1221] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full"></div>
                <Image src="/icon.svg" width={36} height={36} alt="Logo POLDA NTB" className="relative" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white">Logistik</span>
                <span className="text-xs text-cyan-400 font-medium">POLDA NTB</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="md:hidden p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center space-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-lg border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-700/40 hover:text-white hover:border hover:border-slate-600/50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
                      ? 'text-cyan-400 scale-110'
                      : 'text-slate-400 group-hover:text-cyan-400 group-hover:scale-110'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer/Copyright */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
          <div className="p-3 sm:p-4">
            {/* Developer Info - Expandable */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDeveloperInfo ? 'max-h-32 mb-3 opacity-100' : 'max-h-0 mb-0 opacity-0'
              }`}
            >
              <div className="bg-slate-800/60 rounded-lg p-2.5 sm:p-3 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
                <a 
                  href="https://www.linkedin.com/in/muhammad-dzaki-al-qushoyyi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider mb-1">Developed by</p>
                      <p className="text-[11px] sm:text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                        Muhammad Dzaki Al-Qushoyyi
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                        Teknik Informatika
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-cyan-400/80 truncate">Universitas Mataram</p>
                    </div>
                    <svg 
                      width="12" 
                      height="12" 
                      className="sm:w-[14px] sm:h-[14px]" 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" className="text-slate-500 group-hover:text-cyan-400 transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 3h6v6" stroke="currentColor" className="text-slate-500 group-hover:text-cyan-400 transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 14L21 3" stroke="currentColor" className="text-slate-500 group-hover:text-cyan-400 transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Copyright - Clickable */}
            <button
              onClick={() => setShowDeveloperInfo(!showDeveloperInfo)}
              className="w-full text-center py-2 px-2 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group"
            >
              <p className="text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                © {new Date().getFullYear()} POLDA NTB. All rights reserved.
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-[8px] sm:text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {showDeveloperInfo ? 'Hide' : 'Show'} Developer Info
                </span>
                <svg 
                  width="10" 
                  height="10" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className={`text-slate-500 group-hover:text-cyan-400 transition-all duration-300 ${
                    showDeveloperInfo ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
