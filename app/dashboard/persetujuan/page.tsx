// app/dashboard/persetujuan/page.tsx

import { prisma } from '@/lib/prisma';
import PersetujuanClient from './PersetujuanClient';

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

  const pengajuanPengembalian = await prisma.pengajuanPengembalian.findMany({
    where: { status: 'PENDING' },
    include: {
      satkerPengaju: { select: { nama: true } },
      pengembalianDetails: { include: { ht: true } }
    },
    orderBy: { createdAt: 'desc' },
  }) as any[];

  return { pengajuanPeminjaman, pengajuanMutasi, peminjamanSatker, htDiGudang, pengajuanPengembalian };
}

export default async function PersetujuanPage() {
  const { pengajuanPeminjaman, pengajuanMutasi, peminjamanSatker, htDiGudang, pengajuanPengembalian } = await getPengajuanData();

  return (
    <PersetujuanClient
      pengajuanPeminjaman={pengajuanPeminjaman}
      pengajuanMutasi={pengajuanMutasi}
      peminjamanSatker={peminjamanSatker}
      htDiGudang={htDiGudang}
      pengajuanPengembalian={pengajuanPengembalian}
    />
  );
}
