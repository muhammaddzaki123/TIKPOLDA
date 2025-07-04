import SidebarSatker from '@/components/sidebar-satker';
import HeaderDashboard from '@/components/header-dashboard'; // Bisa pakai header yang sama

export default function SatkerAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100">
      <SidebarSatker />
      <div className="flex flex-1 flex-col">
        {/* Kita bisa modifikasi header ini nanti untuk menampilkan nama Admin Satker */}
        <HeaderDashboard /> 
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}