// app/satker-admin/page.tsx

import StatCard from '@/components/stat-card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RecentActivityCard from '@/components/satker/RecentActivityCard';
import StatusPengajuanCard from '@/components/satker/StatusPengajuanCard';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function getRecentActivities(satkerId: string) {
  // Get recent peminjaman
  const recentPeminjaman = await prisma.peminjaman.findMany({
    where: { ht: { satkerId } },
    include: { personil: true, ht: true },
    orderBy: { tanggalPinjam: 'desc' },
    take: 3,
  });

  // Get recent pengajuan mutasi
  const recentMutasi = await prisma.pengajuanMutasi.findMany({
    where: { satkerAsalId: satkerId },
    include: { personil: true, satkerTujuan: true },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  // Combine and format activities
  const activities = [
    ...recentPeminjaman.map((p) => ({
      id: p.id,
      type: 'PEMINJAMAN' as const,
      description: `${p.personil.nama} meminjam HT ${p.ht.serialNumber}`,
      timestamp: p.tanggalPinjam,
    })),
    ...recentMutasi.map((m) => ({
      id: m.id,
      type: 'MUTASI' as const,
      description: `Pengajuan mutasi ${m.personil.nama} ke ${m.satkerTujuan.nama}`,
      timestamp: m.createdAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

  return activities;
}

async function getPengajuanStatus(satkerId: string) {
  // Get pengajuan peminjaman
  const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: { satkerId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  // Get pengajuan mutasi
  const pengajuanMutasi = await prisma.pengajuanMutasi.findMany({
    where: { satkerAsalId: satkerId },
    include: { personil: true },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  // Get pengajuan pengembalian
  const pengajuanPengembalian = await prisma.pengajuanPengembalian.findMany({
    where: { satkerId },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  // Combine and format
  const pengajuanList = [
    ...pengajuanPeminjaman.map((p) => ({
      id: p.id,
      type: 'PEMINJAMAN' as const,
      description: `Peminjaman ${p.jumlah} HT untuk ${p.keperluan}`,
      status: p.status,
      createdAt: p.createdAt,
    })),
    ...pengajuanMutasi.map((m) => ({
      id: m.id,
      type: 'MUTASI' as const,
      description: `Mutasi ${m.personil.nama}`,
      status: m.status,
      createdAt: m.createdAt,
    })),
    ...pengajuanPengembalian.map((p) => ({
      id: p.id,
      type: 'PENGEMBALIAN' as const,
      description: `Pengembalian HT: ${p.alasan}`,
      status: p.status,
      createdAt: p.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return pengajuanList;
}

export default async function SatkerDashboardPage() {
  const session = await getServerSession(authOptions);

  // Jika tidak ada sesi atau pengguna tidak memiliki satkerId, redirect
  if (!session?.user?.satkerId) {
    // Bisa diarahkan ke halaman error atau login
    redirect('/login');
  }

  const [stats, activities, pengajuanList] = await Promise.all([
    getSatkerStats(session.user.satkerId),
    getRecentActivities(session.user.satkerId),
    getPengajuanStatus(session.user.satkerId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Dashboard Admin <span className="text-cyan-600">{session.user.satker?.nama}</span>
        </h1>
        <p className="mt-1 text-slate-600">
          Selamat datang, {session.user.nama}! Kelola aset dan personil unit Anda dari sini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Personil di Unit" 
          value={stats.personilCount.toString()} 
          iconName="Users" 
          color="bg-cyan-500" 
          href="/satker-admin/personil"
        />
        <StatCard 
          title="Total HT di Unit" 
          value={stats.htCount.toString()} 
          iconName="RadioTower" 
          color="bg-indigo-500" 
          href="/satker-admin/inventaris"
        />
        <StatCard 
          title="HT Tersedia" 
          value={stats.htTersediaCount.toString()} 
          iconName="CheckCircle" 
          color="bg-green-500" 
          href="/satker-admin/inventaris"
        />
        <StatCard 
          title="HT Dipinjam" 
          value={stats.htDipinjamCount.toString()} 
          iconName="AlertTriangle" 
          color="bg-yellow-500" 
          href="/satker-admin/peminjaman"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-lg bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold dark:text-slate-100">Aktivitas Terbaru di Satker Anda</h3>
          <RecentActivityCard activities={activities} />
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold dark:text-slate-100">Status Pengajuan Anda</h3>
          <StatusPengajuanCard pengajuanList={pengajuanList} />
        </div>
      </div>
    </div>
  );
}
