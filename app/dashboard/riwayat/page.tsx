// app/dashboard/riwayat/page.tsx

import { PrismaClient } from '@prisma/client';
import { columns, PeminjamanWithDetails } from './columns';
import { DateRangePicker } from '@/components/date-range-picker';
import { RiwayatDataTable } from './data-table'; // <-- Gunakan komponen baru

const prisma = new PrismaClient();

// Fungsi untuk mengambil semua data riwayat peminjaman
async function getRiwayatData(): Promise<PeminjamanWithDetails[]> {
  const data = await prisma.peminjaman.findMany({
    include: {
      ht: true,
      personil: {
        include: {
          satker: true,
        },
      },
    },
    orderBy: {
      tanggalPinjam: 'desc', // Tampilkan yang terbaru di atas
    },
  });
  return data;
}

export default async function RiwayatPeminjamanPage() {
  const riwayatData = await getRiwayatData();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Peminjaman Aset</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk seluruh aktivitas peminjaman dan pengembalian HT.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <DateRangePicker />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {/* Menggunakan komponen tabel baru yang lebih spesifik */}
        <RiwayatDataTable columns={columns} data={riwayatData} />
      </div>
    </div>
  );
}
