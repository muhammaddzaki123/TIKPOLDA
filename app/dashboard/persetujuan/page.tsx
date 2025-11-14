// app/dashboard/persetujuan/page.tsx

import { prisma } from '@/lib/prisma';
import PersetujuanClient from './PersetujuanClient';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPengajuanData() {
  const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    include: {
      satkerPengaju: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const pengajuanMutasi = await prisma.pengajuanMutasi.findMany({
    include: {
      personil: { select: { nama: true, nrp: true } },
      satkerAsal: { select: { nama: true } },
      satkerTujuan: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

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
  });

  // Ambil data peminjaman aktif per personil untuk validasi mutasi
  const peminjamanPersonil = await prisma.peminjaman.findMany({
    where: { tanggalKembali: null },
    include: {
      personil: { select: { id: true, nama: true, nrp: true } },
      ht: { select: { serialNumber: true, merk: true } }
    }
  });

  return { 
    pengajuanPeminjaman: JSON.parse(JSON.stringify(pengajuanPeminjaman)), 
    pengajuanMutasi: JSON.parse(JSON.stringify(pengajuanMutasi)), 
    peminjamanSatker: JSON.parse(JSON.stringify(peminjamanSatker)), 
    htDiGudang: JSON.parse(JSON.stringify(htDiGudang)), 
    pengajuanPengembalian: JSON.parse(JSON.stringify(pengajuanPengembalian)),
    peminjamanPersonil: JSON.parse(JSON.stringify(peminjamanPersonil))
  };
}

export default async function PersetujuanPage() {
  const { 
    pengajuanPeminjaman, 
    pengajuanMutasi, 
    peminjamanSatker, 
    htDiGudang, 
    pengajuanPengembalian,
    peminjamanPersonil
  } = await getPengajuanData();

  return (
    <PersetujuanClient
      pengajuanPeminjaman={pengajuanPeminjaman}
      pengajuanMutasi={pengajuanMutasi}
      peminjamanSatker={peminjamanSatker}
      htDiGudang={htDiGudang}
      pengajuanPengembalian={pengajuanPengembalian}
      peminjamanPersonil={peminjamanPersonil}
    />
  );
}
