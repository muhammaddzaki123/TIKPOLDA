'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const menuItems = [
    { title: 'Dashboard', icon: 'fas fa-home', path: '/' },
    { title: 'Stok Barang', icon: 'fas fa-box', path: '/stok' },
    { title: 'Peminjaman', icon: 'fas fa-handshake', path: '/kelpeminjaman' },
    { title: 'Laporan', icon: 'fas fa-chart-bar', path: '/laporan' },
    { title: 'Pengaturan', icon: 'fas fa-cog', path: '/pengaturan' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-[#0B1221] text-white w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/icon.svg" alt="Logo" width={40} height={40} className="w-auto h-auto" />
            <span className="text-xl font-semibold">POLDA NTB</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className={`${item.icon} w-5`}></i>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <Link
            href="/signin"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-300`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="text-gray-600 hover:text-gray-900">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-3 border-l pl-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-user text-gray-600"></i>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">admin@polda.ntb.go.id</div>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-4 py-2 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">
                Dashboard
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Current Page</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
