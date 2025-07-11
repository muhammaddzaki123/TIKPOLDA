// app/satker-admin/page.tsx

import StatCard from '@/components/stat-card';
import { RadioTower, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

async function getSatkerStats(satkerId: string) {
  if (!satkerId) {
    return {
      personilCount: 0,
      htCount: 0,
      htDipinjamCount: 0,
      htTersediaCount: 0,
    };
  }

  const personilCount = await prisma.personil.count({ where: { satkerId } });
  const htCount = await prisma.hT.count({ where: { satkerId } });
  const htDipinjamCount = await prisma.peminjaman.count({
    where: {
      ht: { satkerId },
      tanggalKembali: null,
    },
  });

  return {
    personilCount,
    htCount,
    htDipinjamCount,
    htTersediaCount: htCount - htDipinjamCount,
  };
}

export default async function SatkerDashboardPage() {
  const session = await getServerSession(authOptions);

  // Jika tidak ada sesi atau pengguna tidak memiliki satkerId, redirect
  if (!session?.user?.satkerId) {
    // Bisa diarahkan ke halaman error atau login
    redirect('/login');
  }

  const stats = await getSatkerStats(session.user.satkerId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard Admin <span className="text-cyan-600">{session.user.satker?.nama}</span>
        </h1>
        <p className="mt-1 text-slate-600">
          Selamat datang, {session.user.nama}! Kelola aset dan personil unit Anda dari sini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Personil di Unit" value={stats.personilCount.toString()} icon={Users} color="bg-cyan-500" />
        <StatCard title="Total HT di Unit" value={stats.htCount.toString()} icon={RadioTower} color="bg-indigo-500" />
        <StatCard title="HT Tersedia" value={stats.htTersediaCount.toString()} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="HT Dipinjam" value={stats.htDipinjamCount.toString()} icon={AlertTriangle} color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Aktivitas Terbaru di Satker Anda</h3>
          <div className="flex h-48 items-center justify-center rounded-md bg-slate-50 text-slate-400">
            Area untuk log aktivitas mendatang
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Status Pengajuan Anda</h3>
          <div className="flex h-48 items-center justify-center rounded-md bg-slate-50 text-slate-400">
            Area untuk daftar pengajuan mendatang
          </div>
        </div>
      </div>
    </div>
  );
}
