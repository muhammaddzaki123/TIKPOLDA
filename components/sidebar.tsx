"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HandMetal, LayoutDashboard, FilePlus2 } from "lucide-react";

// TODO: Ganti dengan link dinamis berdasarkan role user
const adminSatkerLinks = [
  { href: "/admin-satker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-satker/ht-saya", label: "HT Saya", icon: HandMetal },
  { href: "/admin-satker/buat-peminjaman", label: "Buat Peminjaman", icon: FilePlus2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">POLDA NTB</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul>
          {adminSatkerLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center p-3 my-1 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}