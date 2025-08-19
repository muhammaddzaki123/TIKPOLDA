// app/dashboard/persetujuan/page.tsx

import { PrismaClient } from '@prisma/client';
import PersetujuanClient from './PersetujuanClient';

const prisma = new PrismaClient();

async function getPengajuanData() {
  const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: { 
      status: { 
        in: ['PENDING', 'APPROVED'] 
      } 
    },
    include: {
      satkerPengaju: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

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

  const pengajuanPengembalian = await prisma.pengajuanPengembalian.findMany({
    where: { 
      status: { 
        in: ['PENDING', 'APPROVED'] 
      } 
    },
    include: {
      satkerPengaju: { select: { nama: true } },
      pengembalianDetails: {
        include: {
          ht: { select: { merk: true, serialNumber: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const htDiGudang = await prisma.hT.findMany({
    where: {
      satkerId: null,
      status: 'BAIK'
    },
    orderBy: { serialNumber: 'asc' }
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
