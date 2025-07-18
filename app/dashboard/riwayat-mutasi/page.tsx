// app/dashboard/riwayat-mutasi/page.tsx

import { PrismaClient } from '@prisma/client';
import { RiwayatMutasiClient } from './RiwayatMutasiClient';

const prisma = new PrismaClient();

interface RiwayatMutasiPageProps {
  searchParams: {
    q?: string;
    asal?: string;
    tujuan?: string;
  };
}

async function getRiwayatMutasi(props: RiwayatMutasiPageProps) {
  const { q, asal, tujuan } = props.searchParams;

  const whereCondition: any = {
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
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Mutasi Personil</h1>
          <p className="text-sm text-slate-600">
            Jejak audit untuk semua permohonan pemindahan tugas personil antar Satuan Kerja.
          </p>
        </div>
      </div>
      
      <RiwayatMutasiClient 
        riwayatData={riwayatData}
        satkerList={satkerList}
      />
    </div>
  );
}