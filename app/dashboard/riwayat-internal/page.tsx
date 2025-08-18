// app/dashboard/riwayat-internal/page.tsx

import { PrismaClient } from '@prisma/client';
import { RiwayatInternalClient } from './RiwayatInternalClient';

const prisma = new PrismaClient();

interface RiwayatInternalPageProps {
  searchParams: {
    q_ht?: string; // Diubah untuk menerima ID HT
    q_peminjam?: string;
    satker?: string;
  };
}

async function getRiwayatInternal(props: RiwayatInternalPageProps) {
  const { q_ht, q_peminjam, satker } = props.searchParams;

  const whereCondition: any = {
    AND: [],
  };

  // Filter berdasarkan ID HT spesifik dari Combobox
  if (q_ht) {
    whereCondition.AND.push({ htId: q_ht });
  }

  if (q_peminjam) {
    whereCondition.AND.push({ personilId: q_peminjam });
  }
  
  if (satker) {
    whereCondition.AND.push({
      personil: { satkerId: satker },
    });
  }

  if (whereCondition.AND.length === 0) {
    delete whereCondition.AND;
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