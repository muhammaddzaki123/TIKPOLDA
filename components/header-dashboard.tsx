import { Bell, UserCircle } from 'lucide-react';

export default function HeaderDashboard() {
  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard Super Admin</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <Bell className="h-6 w-6" />
          {/* Contoh badge notifikasi */}
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center space-x-2">
          <UserCircle className="h-8 w-8 text-slate-600" />
          <div className="text-right">
            <p className="text-sm font-semibold">Nama Super Admin</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}