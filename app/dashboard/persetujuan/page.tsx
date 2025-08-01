// app/dashboard/persetujuan/page.tsx

import { PrismaClient } from '@prisma/client';
import PersetujuanClient from './PersetujuanClient';

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
    <PersetujuanClient
      pengajuanPeminjaman={pengajuanPeminjaman}
      pengajuanMutasi={pengajuanMutasi}
      pengajuanPengembalian={pengajuanPengembalian}
      htDiGudang={htDiGudang}
    />
  );
}
