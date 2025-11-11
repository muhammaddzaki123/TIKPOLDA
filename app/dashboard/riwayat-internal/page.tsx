// app/dashboard/riwayat-internal/page.tsx

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { RiwayatInternalClient } from './RiwayatInternalClient';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RiwayatInternalPageProps {
  searchParams: Promise<{
    q_ht?: string;
    q_peminjam?: string;
    satker?: string;
  }>;
}

async function getRiwayatInternal(props: RiwayatInternalPageProps) {
  // In Next.js 15+, searchParams is a promise-like object that needs to be awaited.
  const { q_ht, q_peminjam, satker } = await props.searchParams;

  const conditions: Prisma.PeminjamanWhereInput[] = [];

  // Filter berdasarkan ID HT spesifik dari Combobox
  if (q_ht) {
    conditions.push({ htId: q_ht });
  }

  if (q_peminjam) {
    conditions.push({ personilId: q_peminjam });
  }
  
  if (satker) {
    conditions.push({
      personil: { satkerId: satker },
    });
  }

  const whereCondition: Prisma.PeminjamanWhereInput = conditions.length > 0 
    ? { AND: conditions } 
    : {};

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

async function getSatkerList() {
    return await prisma.satker.findMany({ orderBy: { nama: 'asc' } });
}

async function getPersonilList() {
    return await prisma.personil.findMany({ orderBy: { nama: 'asc' }});
}

// Fungsi baru untuk mengambil semua HT
async function getHtList() {
    return await prisma.hT.findMany({ orderBy: { serialNumber: 'asc' }});
}

export default async function RiwayatInternalPage(props: RiwayatInternalPageProps) {
  const riwayatData = await getRiwayatInternal(props);
  const satkerList = await getSatkerList();
  const personilList = await getPersonilList();
  const htList = await getHtList(); // Ambil daftar HT

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
      
      <RiwayatInternalClient 
        riwayatData={riwayatData}
        satkerList={satkerList}
        personilList={personilList}
        htList={htList} // Kirim daftar HT ke komponen client
      />
    </div>
  );
}