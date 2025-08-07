// app/dashboard/persetujuan/page.tsx

import { PrismaClient } from '@prisma/client';
import PersetujuanClient from './PersetujuanClient';

const prisma = new PrismaClient();

async function getPengajuanData() {
  // Ambil semua pengajuan peminjaman (tidak hanya PENDING)
  const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    include: {
      satkerPengaju: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ambil semua pengajuan mutasi (tidak hanya PENDING)
  const pengajuanMutasi = await prisma.pengajuanMutasi.findMany({
    include: {
      personil: { select: { nama: true, nrp: true } },
      satkerAsal: { select: { nama: true } },
      satkerTujuan: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ambil semua pengajuan pengembalian (tidak hanya PENDING)
  const pengajuanPengembalian = await prisma.pengajuanPengembalian.findMany({
    include: {
      satkerPengaju: { select: { nama: true } },
      pengembalianDetails: {
        include: {
          ht: { select: { kodeHT: true, merk: true, serialNumber: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ambil data peminjaman satker untuk tracking
  const peminjamanSatker = await prisma.peminjamanSatker.findMany({
    include: { 
      ht: { select: { kodeHT: true, merk: true } },
      satker: { select: { nama: true } }
    }
  });

  const htDiGudang = await prisma.hT.findMany({
    where: {
      satkerId: null,
      status: 'BAIK'
    },
    orderBy: { kodeHT: 'asc' }
  });

  return { 
    pengajuanPeminjaman, 
    pengajuanMutasi, 
    pengajuanPengembalian, 
    peminjamanSatker,
    htDiGudang 
  };
}

export default async function PersetujuanPage() {
  const { 
    pengajuanPeminjaman, 
    pengajuanMutasi, 
    pengajuanPengembalian, 
    peminjamanSatker,
    htDiGudang 
  } = await getPengajuanData();

  return (
    <PersetujuanClient
      pengajuanPeminjaman={pengajuanPeminjaman}
      pengajuanMutasi={pengajuanMutasi}
      pengajuanPengembalian={pengajuanPengembalian}
      peminjamanSatker={peminjamanSatker}
      htDiGudang={htDiGudang}
    />
  );
}
