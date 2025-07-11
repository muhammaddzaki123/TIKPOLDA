// app/dashboard/page.tsx

import { PrismaClient, HTStatus } from '@prisma/client';
import StatCard from '@/components/stat-card'; // Pastikan path ini benar
import {
  Building,
  RadioTower,
  Users,
  CheckCircle,
  AlertTriangle,
  Wrench,
  HelpCircle,
} from 'lucide-react';

const prisma = new PrismaClient();

// Fungsi untuk mengambil data statistik dengan cara yang lebih aman
async function getDashboardStats() {
  // Ambil setiap statistik secara terpisah agar mudah dilacak
  const satkerCount = await prisma.satker.count();
  const personilCount = await prisma.personil.count();
  const htCount = await prisma.hT.count();
  
  // Hitung jumlah HT yang sedang aktif dipinjam
  const dipinjamCount = await prisma.peminjaman.count({
    where: { tanggalKembali: null },
  });

  // Hitung jumlah HT berdasarkan status fisiknya
  const rusakRinganCount = await prisma.hT.count({ where: { status: HTStatus.RUSAK_RINGAN } });
  const rusakBeratCount = await prisma.hT.count({ where: { status: HTStatus.RUSAK_BERAT } });
  const hilangCount = await prisma.hT.count({ where: { status: HTStatus.HILANG } });

  // Hitung HT yang tersedia (total HT dikurangi yang dipinjam)
  const tersediaCount = htCount - dipinjamCount;

  return {
    satkerCount,
    personilCount,
    htCount,
    dipinjamCount,
    tersediaCount,
    rusakCount: rusakRinganCount + rusakBeratCount,
    hilangCount,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Super Admin</h1>
        <p className="mt-1 text-slate-600">
          Selamat datang! Pantau seluruh aktivitas sistem dari sini.
        </p>
      </div>

      {/* Bagian Kartu Statistik Utama */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">Ringkasan Sistem</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Satuan Kerja" value={stats.satkerCount.toString()} icon={Building} color="bg-blue-500" />
          <StatCard title="Total Personil" value={stats.personilCount.toString()} icon={Users} color="bg-cyan-500" />
          <StatCard title="Total Unit HT" value={stats.htCount.toString()} icon={RadioTower} color="bg-indigo-500" />
        </div>
      </div>

      {/* Bagian Kartu Status HT */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">Status Aset HT</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="HT Tersedia" value={stats.tersediaCount.toString()} icon={CheckCircle} color="bg-green-500" />
          <StatCard title="HT Dipinjam" value={stats.dipinjamCount.toString()} icon={AlertTriangle} color="bg-yellow-500" />
          <StatCard title="HT Rusak" value={stats.rusakCount.toString()} icon={Wrench} color="bg-orange-500" />
          <StatCard title="HT Hilang" value={stats.hilangCount.toString()} icon={HelpCircle} color="bg-red-500" />
        </div>
      </div>
    </div>
  );
}