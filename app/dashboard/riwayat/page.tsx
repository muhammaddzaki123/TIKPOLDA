// app/dashboard/riwayat/page.tsx

import { prisma } from '@/lib/prisma';
import { RiwayatPusatClient } from './RiwayatPusatClient'; // <-- Impor komponen client baru

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Definisikan tipe untuk searchParams agar lebih aman
interface RiwayatPusatPageProps {
  searchParams: Promise<{
    q?: string;
    satker?: string;
    from?: string;
    to?: string;
  }>;
}

async function getGroupedRiwayatPusat(searchParams: Awaited<RiwayatPusatPageProps['searchParams']>) {
  const { q, satker, from, to } = searchParams;

  // Bangun kondisi filter dinamis untuk Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereCondition: any = {
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
    const htsForThisRequest = pengajuan.status === 'APPROVED' 
      ? allPeminjamanSatker
          .filter(p => p.catatan?.includes(pengajuan.id.substring(0, 8)))
          .map(p => p.ht)
      : [];
    return { ...pengajuan, approvedHts: htsForThisRequest };
  });

  return groupedData;
}

async function getSatkerList() {
  return await prisma.satker.findMany({
    orderBy: { nama: 'asc' }
  });
}

export default async function RiwayatPusatPage(props: RiwayatPusatPageProps) {
  const searchParams = await props.searchParams;
  const riwayatData = await getGroupedRiwayatPusat(searchParams);
  const satkerList = await getSatkerList();

  // Serialize data untuk menghindari masalah dengan Date objects
  const serializedRiwayatData = JSON.parse(JSON.stringify(riwayatData));
  const serializedSatkerList = JSON.parse(JSON.stringify(satkerList));

  return (
    <div className="w-full space-y-4 bg-gray-50 p-4 sm:p-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Riwayat Peminjaman (Pusat ke Satker)</h1>
            <p className="text-sm text-slate-600">
              Jejak audit untuk semua aset yang dipinjamkan atau ditolak dari gudang pusat ke Satuan Kerja.
            </p>
          </div>
        </div>
      </div>
      
      <RiwayatPusatClient 
        riwayatData={serializedRiwayatData}
        satkerList={serializedSatkerList}
      />
    </div>
  );
}