// app/dashboard/riwayat/page.tsx

import { PrismaClient } from '@prisma/client';
import { RiwayatPusatTable, RiwayatPusatGrouped } from './RiwayatPusatTable';

const prisma = new PrismaClient();

async function getGroupedRiwayatPusat(): Promise<RiwayatPusatGrouped[]> {
  const approvedPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: {
      status: 'APPROVED',
    },
    include: {
      satkerPengaju: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const allPeminjamanSatker = await prisma.peminjamanSatker.findMany({
    include: {
      ht: true,
    },
  });

  const groupedData = approvedPeminjaman.map((pengajuan) => {
    const htsForThisRequest = allPeminjamanSatker
      .filter(p => p.catatan?.includes(pengajuan.id.substring(0, 8)))
      .map(p => p.ht);

    return {
      ...pengajuan,
      approvedHts: htsForThisRequest,
    };
  });

  return groupedData;
}

export default async function RiwayatPusatPage() {
  const riwayatData = await getGroupedRiwayatPusat();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Peminjaman (Pusat ke Satker)</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk aset yang dipinjamkan dari gudang pusat ke Satuan Kerja.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <RiwayatPusatTable data={riwayatData} />
      </div>
    </div>
  );
}