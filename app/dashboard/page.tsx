import StatCard from '@/components/stat-card';
import { RadioTower, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Bagian Kartu Statistik */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total HT Terdaftar" value="1,250" icon={RadioTower} color="bg-blue-500" />
        <StatCard title="HT Tersedia" value="980" icon={CheckCircle} color="bg-green-500" />
        <StatCard title="HT Dipinjam" value="250" icon={AlertTriangle} color="bg-yellow-500" />
        <StatCard title="HT Dalam Perbaikan" value="20" icon={Wrench} color="bg-red-500" />
      </div>

      {/* Bagian Grafik dan Tabel (Placeholder) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri untuk Grafik */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-5 shadow">
            <h3 className="mb-4 text-lg font-semibold">Distribusi HT per Satker</h3>
            {/* Placeholder untuk chart. Anda bisa menggunakan pustaka seperti Recharts atau Chart.js di sini */}
            <div className="flex h-64 items-center justify-center rounded-md bg-slate-50 text-slate-400">
              Area Grafik
            </div>
          </div>
        </div>

        {/* Kolom Kanan untuk Aktivitas Terbaru */}
        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Aktivitas Peminjaman Terbaru</h3>
          <ul className="space-y-4">
            {/* Contoh item aktivitas */}
            <li className="flex items-center text-sm">
              <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                AS
              </div>
              <div>
                <p><span className="font-bold">Asep Sunandar</span> meminjam HT <span className="font-semibold">HT-001</span>.</p>
                <p className="text-xs text-slate-500">DITLANTAS - 2 jam yang lalu</p>
              </div>
            </li>
            <li className="flex items-center text-sm">
               <div className="mr-3 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                BW
              </div>
              <div>
                <p><span className="font-bold">Budi Waseso</span> mengembalikan HT <span className="font-semibold">HT-056</span>.</p>
                <p className="text-xs text-slate-500">DITSAMAPTA - 5 jam yang lalu</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}