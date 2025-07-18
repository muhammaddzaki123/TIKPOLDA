// app/dashboard/riwayat/page.tsx

import { PrismaClient } from '@prisma/client';
import { RiwayatPusatClient } from './RiwayatPusatClient'; // <-- Impor komponen client baru

const prisma = new PrismaClient();

// Definisikan tipe untuk searchParams agar lebih aman
interface RiwayatPusatPageProps {
  searchParams: {
    q?: string;
    satker?: string;
    from?: string;
    to?: string;
  };
}

async function getGroupedRiwayatPusat(props: RiwayatPusatPageProps) {
  const { q, satker, from, to } = props.searchParams;

  // Bangun kondisi filter dinamis untuk Prisma
  const whereCondition: any = {
    // HAPUS filter status agar semua data (approved & rejected) terambil
    status: {
      in: ['APPROVED', 'REJECTED'],
    },
  };

  if (q) {
    whereCondition.OR = [
      { keperluan: { contains: q, mode: 'insensitive' } },
      { satkerPengaju: { nama: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (satker && satker !== 'all') {
    whereCondition.satkerId = satker;
  }

  if (from && to) {
    whereCondition.updatedAt = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  const allPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: whereCondition,
    include: {
      satkerPengaju: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  
  const allPeminjamanSatker = await prisma.peminjamanSatker.findMany({
    where: {
        satkerId: {
            in: allPeminjaman.map(p => p.satkerId)
        }
    },
    include: {
      ht: true,
    },
  });

  const groupedData = allPeminjaman.map((pengajuan) => {
    // Hanya cari HT jika statusnya APPROVED
    const htsForThisRequest = pengajuan.status === 'APPROVED' 
      ? allPeminjamanSatker
          .filter(p => p.catatan?.includes(pengajuan.id.substring(0, 8)))
          .map(p => p.ht)
      : [];
    return { ...pengajuan, approvedHts: htsForThisRequest };
  });

  return groupedData;
}

// Ambil daftar Satker untuk filter dropdown
async function getSatkerList() {
    return await prisma.satker.findMany({
        orderBy: { nama: 'asc' }
    });
}

export default async function RiwayatPusatPage(props: RiwayatPusatPageProps) {
  const riwayatData = await getGroupedRiwayatPusat(props);
  const satkerList = await getSatkerList();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Peminjaman (Pusat ke Satker)</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk semua aset yang dipinjamkan atau ditolak dari gudang pusat ke Satuan Kerja.
          </p>
        </div>
      </div>
      
      {/* Gunakan komponen client untuk menampung filter dan tabel */}
      <RiwayatPusatClient 
        riwayatData={riwayatData}
        satkerList={satkerList}
      />
    </div>
  );
}