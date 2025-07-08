import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/stat-card';
import {
  PlusCircle,
  Users,
  Send,
  RadioTower,
  CheckCircle,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export default function SatkerDashboardPage() {
  const namaSatker = 'DITLANTAS'; // Ini akan dinamis sesuai user yang login

  return (
    <div className="space-y-8">
      {/* Bagian Header dan Sambutan */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard Admin <span className="text-blue-600">{namaSatker}</span>
        </h1>
        <p className="mt-1 text-slate-600">
          Selamat datang! Kelola aset dan personil unit Anda dari sini.
        </p>
      </div>

      {/* Bagian Tombol Aksi Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/satker-admin/inventaris">
          <Button className="h-24 w-full text-lg">
            <PlusCircle className="mr-3 h-6 w-6" />
            Input HT Baru
          </Button>
        </Link>
        <Link href="/satker-admin/pengajuan">
          <Button className="h-24 w-full text-lg" variant="secondary">
            <Send className="mr-3 h-6 w-6" />
            Ajukan Peminjaman
          </Button>
        </Link>
        <Link href="/satker-admin/personil">
          <Button className="h-24 w-full text-lg" variant="secondary">
            <Users className="mr-3 h-6 w-6" />
            Kelola Personil
          </Button>
        </Link>
      </div>

      {/* Bagian Kartu Statistik Unit */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total HT di Unit" value="75" icon={RadioTower} color="bg-blue-500" />
        <StatCard title="Total Personil" value="45" icon={UserCheck} color="bg-cyan-500" />
        <StatCard title="HT Digunakan" value="68" icon={AlertTriangle} color="bg-yellow-500" />
        <StatCard title="HT di Gudang" value="7" icon={CheckCircle} color="bg-green-500" />
      </div>

      {/* Bagian Status Pengajuan & Inventaris Terbaru */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Status Pengajuan Peminjaman</h3>
          <ul className="space-y-4">
            {/* Contoh Item Pengajuan */}
            <li className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">Peminjaman HT-LTS-002 untuk Budi W.</p>
                <p className="text-xs text-slate-500">Diajukan 2 jam yang lalu</p>
              </div>
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">Menunggu Persetujuan</Badge>
            </li>
            <li className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">Peminjaman HT-LTS-005 untuk Siti A.</p>
                <p className="text-xs text-slate-500">Diajukan kemarin</p>
              </div>
              <Badge variant="default" className="bg-green-500">Disetujui</Badge>
            </li>
             <li className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">Peminjaman HT-LTS-004 untuk Joko S.</p>
                <p className="text-xs text-slate-500">Diajukan 2 hari yang lalu</p>
              </div>
              <Badge variant="destructive">Ditolak</Badge>
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Inventaris HT Terbaru</h3>
          <ul className="space-y-4">
            <li className="text-sm">
              <p>HT <span className="font-semibold">HT-LTS-015</span> (Motorola APX 2000) ditambahkan.</p>
              <p className="text-xs text-slate-500">Ditugaskan ke: <span className="font-medium">Asep Sunandar</span></p>
            </li>
            <li className="text-sm">
               <p>HT <span className="font-semibold">HT-LTS-014</span> (Hytera PD788G) ditambahkan.</p>
               <p className="text-xs text-slate-500">Status: <span className="font-medium">Disimpan di Gudang</span></p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}