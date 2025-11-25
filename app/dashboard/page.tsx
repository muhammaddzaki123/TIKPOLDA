// app/dashboard/page.tsx

import { prisma } from '@/lib/prisma';
import { HTStatus } from '@prisma/client';
import { DashboardClient } from '@/components/dashboard/DashboardClient'; // <-- Impor komponen client
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fungsi untuk mengambil semua data yang dibutuhkan
async function getDashboardData() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Hitung statistik utama
  const [
    satkerCount,
    personilCount,
    htCount,
    dipinjamCount,
    rusakRinganCount,
    rusakBeratCount,
    hilangCount,
    currentMonthPeminjaman,
    lastMonthPeminjaman,
    currentMonthPengembalian,
    lastMonthPengembalian,
  ] = await prisma.$transaction([
    prisma.satker.count(),
    prisma.personil.count(),
    prisma.hT.count(),
    prisma.peminjaman.count({ where: { tanggalKembali: null } }),
    prisma.hT.count({ where: { status: HTStatus.RUSAK_RINGAN } }),
    prisma.hT.count({ where: { status: HTStatus.RUSAK_BERAT } }),
    prisma.hT.count({ where: { status: HTStatus.HILANG } }),
    prisma.peminjaman.count({
      where: {
        tanggalPinjam: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    }),
    prisma.peminjaman.count({
      where: {
        tanggalPinjam: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    }),
    prisma.peminjaman.count({
      where: {
        tanggalKembali: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
          not: null,
        },
      },
    }),
    prisma.peminjaman.count({
      where: {
        tanggalKembali: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
          not: null,
        },
      },
    }),
  ]);

  const stats = {
    satkerCount,
    personilCount,
    htCount,
    dipinjamCount,
    tersediaCount: htCount - dipinjamCount,
    rusakCount: rusakRinganCount + rusakBeratCount,
    hilangCount,
  };

  // Hitung trend
  const peminjamanTrend = lastMonthPeminjaman > 0
    ? ((currentMonthPeminjaman - lastMonthPeminjaman) / lastMonthPeminjaman) * 100
    : 0;
  const pengembalianTrend = lastMonthPengembalian > 0
    ? ((currentMonthPengembalian - lastMonthPengembalian) / lastMonthPengembalian) * 100
    : 0;

  const trends = {
    peminjaman: {
      current: currentMonthPeminjaman,
      previous: lastMonthPeminjaman,
      percentage: peminjamanTrend,
    },
    pengembalian: {
      current: currentMonthPengembalian,
      previous: lastMonthPengembalian,
      percentage: pengembalianTrend,
    },
  };

  // Ambil data detail untuk setiap kartu
  const includeOptions = {
    include: {
      satker: true,
      peminjaman: { where: { tanggalKembali: null }, include: { personil: true } },
    }
  };

  const allHt = await prisma.hT.findMany(includeOptions);
  const htRusak = allHt.filter(ht => ht.status === 'RUSAK_RINGAN' || ht.status === 'RUSAK_BERAT');
  const htHilang = allHt.filter(ht => ht.status === 'HILANG');
  const htDipinjam = allHt.filter(ht => ht.peminjaman.length > 0);
  const htTersedia = allHt.filter(ht => ht.peminjaman.length === 0);

  const htData = { allHt, htRusak, htHilang, htDipinjam, htTersedia };

  // Ambil data peminjaman 6 bulan terakhir untuk chart
  const sixMonthsAgo = subMonths(now, 6);
  const peminjamanHistory = await prisma.peminjaman.findMany({
    where: {
      tanggalPinjam: {
        gte: sixMonthsAgo,
      },
    },
    include: {
      personil: true,
    },
    orderBy: {
      tanggalPinjam: 'asc',
    },
  });

  // Group by month
  const monthlyData = peminjamanHistory.reduce((acc, peminjaman) => {
    const month = format(new Date(peminjaman.tanggalPinjam), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { peminjaman: 0, pengembalian: 0 };
    }
    acc[month].peminjaman += 1;
    if (peminjaman.tanggalKembali) {
      acc[month].pengembalian += 1;
    }
    return acc;
  }, {} as Record<string, { peminjaman: number; pengembalian: number }>);

  const chartData = Object.entries(monthlyData).map(([date, data]) => ({
    date,
    peminjaman: data.peminjaman,
    pengembalian: data.pengembalian,
  }));

  // Ambil aktivitas terkini (10 terakhir)
  const recentActivities = await prisma.peminjaman.findMany({
    take: 10,
    orderBy: {
      tanggalPinjam: 'desc',
    },
    include: {
      personil: true,
      ht: true,
    },
  });

  const activities = recentActivities.map((peminjaman) => ({
    id: peminjaman.id.toString(),
    type: peminjaman.tanggalKembali ? 'pengembalian' as const : 'peminjaman' as const,
    description: `${peminjaman.tanggalKembali ? 'Pengembalian' : 'Peminjaman'} HT ${peminjaman.ht.serialNumber}`,
    user: peminjaman.personil.nama,
    timestamp: peminjaman.tanggalKembali || peminjaman.tanggalPinjam,
    status: peminjaman.tanggalKembali ? 'success' as const : undefined,
  }));

  // Data distribusi HT per satker
  const htPerSatker = allHt.reduce((acc, ht) => {
    const satkerName = ht.satker?.nama || 'Gudang Pusat';
    if (!acc[satkerName]) {
      acc[satkerName] = 0;
    }
    acc[satkerName] += 1;
    return acc;
  }, {} as Record<string, number>);

  const satkerDistribution = Object.entries(htPerSatker)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 satker

  return { stats, htData, trends, chartData, activities, satkerDistribution };
}

export default async function DashboardPage() {
  const { stats, htData, trends, chartData, activities, satkerDistribution } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Super Admin</h1>
        <p className="mt-1 text-slate-600">
          Selamat datang! Pantau seluruh aktivitas sistem dari sini.
        </p>
      </div>
      
      {/* Render komponen client dengan data dari server */}
      <DashboardClient 
        stats={stats} 
        htData={htData} 
        trends={trends}
        chartData={chartData}
        activities={activities}
        satkerDistribution={satkerDistribution}
      />
    </div>
  );
}