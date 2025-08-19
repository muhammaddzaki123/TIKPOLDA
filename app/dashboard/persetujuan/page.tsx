// app/dashboard/persetujuan/page.tsx

import { PrismaClient } from '@prisma/client';
import PersetujuanClient from './PersetujuanClient';

const prisma = new PrismaClient();

async function getPengajuanData() {
  const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: { 
      OR: [
        { status: { in: ['PENDING', 'APPROVED'] } },
        { trackingStatus: 'PERMINTAAN_PENGEMBALIAN' }
      ]
    },
    include: {
      satkerPengaju: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  }) as any[];

  const pengajuanMutasi = await prisma.pengajuanMutasi.findMany({
    where: { 
      status: { 
        in: ['PENDING', 'APPROVED'] 
      } 
    },
    include: {
      personil: { select: { nama: true, nrp: true } },
      satkerAsal: { select: { nama: true } },
      satkerTujuan: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ambil data peminjaman satker untuk tracking HT yang sedang dipinjam
  const peminjamanSatker = await prisma.peminjamanSatker.findMany({
    include: {
      ht: { select: { id: true, merk: true, serialNumber: true } },
      satker: { select: { nama: true } }
    }
  });

  const htDiGudang = await prisma.hT.findMany({
    where: {
      satkerId: null,
      status: 'BAIK'
    },
    orderBy: { serialNumber: 'asc' }
  });

  return { pengajuanPeminjaman, pengajuanMutasi, peminjamanSatker, htDiGudang };
}

export default async function PersetujuanPage() {
  const { pengajuanPeminjaman, pengajuanMutasi, peminjamanSatker, htDiGudang } = await getPengajuanData();

  return (
    <PersetujuanClient
      pengajuanPeminjaman={pengajuanPeminjaman}
      pengajuanMutasi={pengajuanMutasi}
      peminjamanSatker={peminjamanSatker}
      htDiGudang={htDiGudang}
    />
  );
}
