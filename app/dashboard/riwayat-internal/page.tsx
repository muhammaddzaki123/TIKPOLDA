// app/dashboard/riwayat-internal/page.tsx

import { PrismaClient } from '@prisma/client';
import { columns, PeminjamanWithDetails } from './columns';
import { DateRangePicker } from '@/components/date-range-picker';
// Kita gunakan kembali komponen data-table dari halaman riwayat sebelumnya
import { RiwayatDataTable } from '../riwayat/data-table';

const prisma = new PrismaClient();

// Fungsi untuk mengambil semua data riwayat peminjaman internal
async function getRiwayatInternal() {
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
      tanggalPinjam: 'desc',
    },
  });
  return data;
}

export default async function RiwayatInternalPage() {
  const riwayatData = await getRiwayatInternal();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Internal (Satker ke Personil)</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk semua transaksi peminjaman yang terjadi di dalam Satuan Kerja.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <DateRangePicker />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <RiwayatDataTable 
          columns={columns} 
          data={riwayatData}
          // Kita akan memfilter berdasarkan nama satker di sini
          filterColumn="satker_nama"
          filterPlaceholder="Cari berdasarkan nama Satker..."
        />
      </div>
    </div>
  );
}
