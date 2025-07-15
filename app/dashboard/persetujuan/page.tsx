// app/dashboard/persetujuan/page.tsx

import { PrismaClient } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTablePersetujuan } from './data-table';
import { columnsPeminjaman, PengajuanPeminjamanWithRelations } from './columns-peminjaman';
import { columnsMutasi, PengajuanMutasiWithRelations } from './columns-mutasi';

const prisma = new PrismaClient();

async function getPengajuanData() {
  const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: { status: 'PENDING' },
    include: {
      satkerPengaju: { select: { nama: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const pengajuanMutasi = await prisma.pengajuanMutasi.findMany({
    where: { status: 'PENDING' },
    include: {
      personil: { select: { nama: true, nrp: true } },
      satkerAsal: { select: { nama: true } },
      satkerTujuan: { select: { nama: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // TAMBAHAN: Ambil daftar HT yang tersedia di Gudang Pusat (satkerId is null)
  const htDiGudang = await prisma.hT.findMany({
    where: {
      satkerId: null, // Hanya yang di gudang
      status: 'BAIK'   // Hanya yang kondisinya baik
    },
    orderBy: { kodeHT: 'asc' }
  });

  return { pengajuanPeminjaman, pengajuanMutasi, htDiGudang };
}

export default async function PersetujuanPage() {
  const { pengajuanPeminjaman, pengajuanMutasi, htDiGudang } = await getPengajuanData();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Persetujuan</h1>
        <p className="text-sm text-slate-600">Proses pengajuan peminjaman dan mutasi dari Satuan Kerja.</p>
      </div>
      <Tabs defaultValue="mutasi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mutasi">Pengajuan Mutasi Personil ({pengajuanMutasi.length})</TabsTrigger>
          <TabsTrigger value="peminjaman">Pengajuan Peminjaman HT ({pengajuanPeminjaman.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mutasi" className="rounded-lg border bg-white p-4 shadow-sm">
          <DataTablePersetujuan
            columns={columnsMutasi}
            data={pengajuanMutasi as PengajuanMutasiWithRelations[]}
            tipe="mutasi"
          />
        </TabsContent>
        <TabsContent value="peminjaman" className="rounded-lg border bg-white p-4 shadow-sm">
           <DataTablePersetujuan
            columns={columnsPeminjaman}
            data={pengajuanPeminjaman as PengajuanPeminjamanWithRelations[]}
            tipe="peminjaman"
            htDiGudang={htDiGudang} // Kirim data HT yang tersedia ke komponen tabel
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}