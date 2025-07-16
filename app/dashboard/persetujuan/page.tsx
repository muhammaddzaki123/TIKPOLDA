// app/dashboard/persetujuan/page.tsx

import { PrismaClient } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTablePersetujuan } from './data-table';
import { columnsPeminjaman, PengajuanPeminjamanWithRelations } from './columns-peminjaman';
import { columnsMutasi, PengajuanMutasiWithRelations } from './columns-mutasi';
import { columnsPengembalian, PengajuanPengembalianWithRelations } from './columns-pengembalian';

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

  const pengajuanPengembalian = await prisma.pengajuanPengembalian.findMany({
    where: { status: 'PENDING' },
    include: {
      satkerPengaju: { select: { nama: true } },
      ht: { select: { kodeHT: true, merk: true, serialNumber: true } }
    },
    orderBy: { createdAt: 'asc' },
  });

  const htDiGudang = await prisma.hT.findMany({
    where: {
      satkerId: null,
      status: 'BAIK'
    },
    orderBy: { kodeHT: 'asc' }
  });

  return { pengajuanPeminjaman, pengajuanMutasi, pengajuanPengembalian, htDiGudang };
}

export default async function PersetujuanPage() {
  const { pengajuanPeminjaman, pengajuanMutasi, pengajuanPengembalian, htDiGudang } = await getPengajuanData();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Persetujuan</h1>
        <p className="text-sm text-slate-600">Proses semua pengajuan dari Satuan Kerja.</p>
      </div>
      <Tabs defaultValue="peminjaman" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="peminjaman">Peminjaman HT ({pengajuanPeminjaman.length})</TabsTrigger>
          <TabsTrigger value="pengembalian">Pengembalian HT ({pengajuanPengembalian.length})</TabsTrigger>
          <TabsTrigger value="mutasi">Mutasi Personil ({pengajuanMutasi.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="peminjaman" className="rounded-lg border bg-white p-4 shadow-sm">
           <DataTablePersetujuan
            columns={columnsPeminjaman}
            data={pengajuanPeminjaman as PengajuanPeminjamanWithRelations[]}
            tipe="peminjaman"
            htDiGudang={htDiGudang}
          />
        </TabsContent>
        <TabsContent value="pengembalian" className="rounded-lg border bg-white p-4 shadow-sm">
          <DataTablePersetujuan
            columns={columnsPengembalian}
            data={pengajuanPengembalian as PengajuanPengembalianWithRelations[]}
            tipe="pengembalian"
          />
        </TabsContent>
        <TabsContent value="mutasi" className="rounded-lg border bg-white p-4 shadow-sm">
          <DataTablePersetujuan
            columns={columnsMutasi}
            data={pengajuanMutasi as PengajuanMutasiWithRelations[]}
            tipe="mutasi"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}