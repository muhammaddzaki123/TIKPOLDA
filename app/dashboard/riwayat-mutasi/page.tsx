// app/dashboard/riwayat-mutasi/page.tsx

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { RiwayatMutasiClient } from './RiwayatMutasiClient';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RiwayatMutasiPageProps {
  searchParams: Promise<{
    q?: string;
    asal?: string;
    tujuan?: string;
  }>;
}

async function getRiwayatMutasi(props: RiwayatMutasiPageProps) {
  const { q, asal, tujuan } = await props.searchParams;

  const whereCondition: Prisma.PengajuanMutasiWhereInput = {
    status: { in: ['APPROVED', 'REJECTED'] },
  };

  if (q) {
    whereCondition.OR = [
      { personil: { nama: { contains: q, mode: 'insensitive' } } },
      { personil: { nrp: { contains: q, mode: 'insensitive' } } },
      { alasan: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (asal) whereCondition.satkerAsalId = asal;
  if (tujuan) whereCondition.satkerTujuanId = tujuan;
  

  const data = await prisma.pengajuanMutasi.findMany({
    where: whereCondition,
    include: {
      personil: true,
      satkerAsal: true,
      satkerTujuan: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return data;
}

async function getSatkerList() {
  return await prisma.satker.findMany({ orderBy: { nama: 'asc' } });
}

export default async function RiwayatMutasiPage(props: RiwayatMutasiPageProps) {
  const riwayatData = await getRiwayatMutasi(props);
  const satkerList = await getSatkerList();

  return (
    <div className="w-full space-y-4 bg-gray-50 dark:bg-slate-900 p-4 sm:p-6">
      <div className="rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold dark:text-slate-100">Riwayat Mutasi Personil</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Jejak audit untuk semua permohonan pemindahan tugas personil antar Satuan Kerja.
            </p>
          </div>
        </div>
      </div>
      
      <RiwayatMutasiClient 
        riwayatData={riwayatData}
        satkerList={satkerList}
      />
    </div>
  );
}