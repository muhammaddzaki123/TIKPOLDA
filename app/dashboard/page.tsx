// app/dashboard/page.tsx

import { PrismaClient, HTStatus } from '@prisma/client';
import { DashboardClient } from '@/components/dashboard/DashboardClient'; // <-- Impor komponen client

const prisma = new PrismaClient();

// Fungsi untuk mengambil semua data yang dibutuhkan
async function getDashboardData() {
  // Hitung statistik utama
  const [satkerCount, personilCount, htCount, dipinjamCount, rusakRinganCount, rusakBeratCount, hilangCount] = await prisma.$transaction([
    prisma.satker.count(),
    prisma.personil.count(),
    prisma.hT.count(),
    prisma.peminjaman.count({ where: { tanggalKembali: null } }),
    prisma.hT.count({ where: { status: HTStatus.RUSAK_RINGAN } }),
    prisma.hT.count({ where: { status: HTStatus.RUSAK_BERAT } }),
    prisma.hT.count({ where: { status: HTStatus.HILANG } }),
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

  return { stats, htData };
}

export default async function DashboardPage() {
  const { stats, htData } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Super Admin</h1>
        <p className="mt-1 text-slate-600">
          Selamat datang! Pantau seluruh aktivitas sistem dari sini.
        </p>
      </div>
      
      {/* Render komponen client dengan data dari server */}
      <DashboardClient stats={stats} htData={htData} />
    </div>
  );
}