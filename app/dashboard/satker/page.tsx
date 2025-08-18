// app/dashboard/satker/page.tsx

import { PrismaClient } from '@prisma/client';
import { SatkerMonitoringCard } from '@/components/satker/SatkerMonitoringCard';
const prisma = new PrismaClient();

// Fungsi untuk mengambil data satker beserta semua detail relasinya
async function getSatkerMonitoringData() {
  const satkers = await prisma.satker.findMany({
    include: {
      // Sertakan semua personil yang terhubung dengan satker ini
      personil: {
        orderBy: { nama: 'asc' }
      },
      // Sertakan semua HT yang terhubung dengan satker ini
      ht: {
        orderBy: { serialNumber: 'asc' },
        include: {
          // Untuk setiap HT, cari tahu peminjaman yang sedang aktif
          peminjaman: {
            where: { tanggalKembali: null }, // Hanya yang belum dikembalikan
            include: {
              personil: true, // Sertakan detail personil yang meminjam (termasuk subSatker)
            },
          },
        },
      },
      // Sertakan hitungan total untuk statistik
      _count: {
        select: { personil: true, ht: true },
      },
    },
    orderBy: {
      nama: 'asc',
    },
  });

  return satkers;
}


export default async function SatkerMonitoringPage() {
  const satkerData = await getSatkerMonitoringData();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Pemantauan Satuan Kerja</h1>
            <p className="text-sm text-slate-600">
                Pantau statistik, personil, dan aset HT untuk setiap Satuan Kerja.
            </p>
        </div>
      </div>

      {/* Tampilkan data dalam bentuk kartu-kartu monitoring */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {satkerData.map((satker) => (
          <SatkerMonitoringCard key={satker.id} satker={satker} />
        ))}

        {satkerData.length === 0 && (
            <div className="col-span-full mt-10 text-center">
                <p className="text-slate-500">
                    Belum ada data Satker untuk ditampilkan.
                </p>
                <p className="text-sm text-slate-400">
                    Silakan tambahkan Admin & Satker baru di halaman Manajemen Admin.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}