// app/dashboard/inventaris/page.tsx

import { prisma } from '@/lib/prisma';
import InventarisClient from './InventarisClient';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getInventarisData() {
  const allHt = await prisma.hT.findMany({
    include: {
      satker: true, // Data penempatan permanen
      peminjaman: { where: { tanggalKembali: null }, include: { personil: true } }, 
      // Peminjaman dari GUDANG PUSAT ke Satker
      peminjamanOlehSatker: {
        where: { tanggalKembali: null },
        include: { satker: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const gudangData = allHt.filter((ht) => !ht.satkerId); 
  const terdistribusiData = allHt.filter((ht) => ht.satkerId); 

  const satkerList = await prisma.satker.findMany({ orderBy: { nama: 'asc' } });

  return { gudangData, terdistribusiData, satkerList };
}

export default async function InventarisManagementPage() {
  const { gudangData, terdistribusiData, satkerList } = await getInventarisData();

  return (
    <InventarisClient 
      gudangData={gudangData}
      terdistribusiData={terdistribusiData}
      satkerList={satkerList}
    />
  );
}
