// app/dashboard/riwayat/page.tsx

import { PrismaClient } from '@prisma/client';
import { columns } from './columns';
import { DateRangePicker } from '@/components/date-range-picker';
import { RiwayatDataTable } from './data-table';

const prisma = new PrismaClient();

// Fungsi untuk mengambil data riwayat peminjaman dari Super Admin ke Satker
async function getRiwayatPusat() {
  const data = await prisma.peminjamanSatker.findMany({
    include: {
      ht: true,
      satker: true,
    },
    orderBy: {
      tanggalPinjam: 'desc',
    },
  });
  return data;
}

export default async function RiwayatPusatPage() {
  const riwayatData = await getRiwayatPusat();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Peminjaman (Pusat ke Satker)</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk aset yang dipinjamkan dari gudang pusat ke Satuan Kerja.
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
          filterColumn="ht_kodeHT"
          filterPlaceholder="Cari Kode HT..."
        />
      </div>
    </div>
  );
}
