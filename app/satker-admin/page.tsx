import StatCard from '@/components/stat-card';
import { RadioTower, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpRight } from 'lucide-react';

export default function SatkerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Tombol Aksi Cepat */}
      <div className="flex space-x-4">
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Input Peminjaman Baru
        </Button>
        <Button size="lg" variant="outline">
          <ArrowUpRight className="mr-2 h-5 w-5" />
          Input Pengembalian
        </Button>
      </div>
      
      {/* Kartu Statistik Khusus Satker */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total HT di Unit Ini" value="75" icon={RadioTower} color="bg-blue-500" />
        <StatCard title="HT Tersedia" value="50" icon={CheckCircle} color="bg-green-500" />
        <StatCard title="HT Dipinjam" value="23" icon={AlertTriangle} color="bg-yellow-500" />
        <StatCard title="HT Perbaikan" value="2" icon={Wrench} color="bg-red-500" />
      </div>

      {/* Tabel ringkasan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daftar HT yang Sedang Dipinjam */}
        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">HT yang Sedang Dipinjam</h3>
          <div className="text-sm text-slate-500">
            {/* Placeholder untuk tabel sederhana */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>HT-LTS-001 - Asep Sunandar</span>
                <span className="font-medium">Dipinjam 3 hari lalu</span>
              </div>
              <div className="flex justify-between">
                <span>HT-LTS-008 - Agus Harimurti</span>
                <span className="font-medium">Dipinjam 1 hari lalu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru di Satker Ini */}
        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Aktivitas Terbaru di Unit Ini</h3>
           <div className="text-sm text-slate-500">
            {/* Placeholder untuk daftar aktivitas */}
            <div className="space-y-3">
              <p><span className="font-bold">Admin</span> menambahkan HT baru <span className="font-semibold">HT-LTS-015</span>.</p>
              <p><span className="font-bold">Budi Waseso</span> mengembalikan HT <span className="font-semibold">HT-LTS-005</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}