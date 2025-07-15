// app/dashboard/riwayat-internal/page.tsx

import { PrismaClient } from '@prisma/client';
import { RiwayatInternalClient } from './RiwayatInternalClient'; // <-- Impor komponen client baru

const prisma = new PrismaClient();

// Definisikan tipe untuk searchParams
interface RiwayatInternalPageProps {
  searchParams: {
    q?: string;
    satker?: string;
  };
}

// Fungsi untuk mengambil data riwayat internal dengan filter dinamis
async function getRiwayatInternal(props: RiwayatInternalPageProps) {
  const { q, satker } = props.searchParams;

  const whereCondition: any = {};

  if (q) {
    whereCondition.OR = [
      { ht: { kodeHT: { contains: q, mode: 'insensitive' } } },
      { personil: { nama: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (satker && satker !== 'all') {
    // Filter berdasarkan satker dari personil yang meminjam
    whereCondition.personil = {
      satkerId: satker,
    };
  }

  const data = await prisma.peminjaman.findMany({
    where: whereCondition,
    include: {
      ht: true,
      personil: {
        include: {
          satker: true,
        },
      },
    },
    orderBy: {
      tanggalPinjam: 'desc',
    },
  });
  return data;
}

// Fungsi untuk mengambil daftar semua Satker
async function getSatkerList() {
    return await prisma.satker.findMany({
        orderBy: { nama: 'asc' }
    });
}


export default async function RiwayatInternalPage(props: RiwayatInternalPageProps) {
  const riwayatData = await getRiwayatInternal(props);
  const satkerList = await getSatkerList();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Internal (Satker ke Personil)</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk semua transaksi peminjaman yang terjadi di dalam Satuan Kerja.
          </p>
        </div>
      </div>

      {/* Gunakan komponen client baru untuk filter dan tabel */}
      <RiwayatInternalClient riwayatData={riwayatData} satkerList={satkerList} />
    </div>
  );
}