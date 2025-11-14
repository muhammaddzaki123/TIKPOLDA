// app/satker-admin/peminjaman/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PeminjamanClientWrapper } from './PeminjamanClientWrapper';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData(satkerId: string) {
  // Ambil daftar HT yang sedang dipinjam di satker ini
  const htDipinjam = await prisma.peminjaman.findMany({
    where: {
      ht: { satkerId },
      tanggalKembali: null,
    },
    include: {
      ht: true,
      personil: true,
    },
    orderBy: {
      tanggalPinjam: 'asc',
    },
  });

  const idHtDipinjam = htDipinjam.map(p => p.htId);

  // Ambil daftar HT yang tersedia (tidak termasuk yang sedang dipinjam)
  const htTersedia = await prisma.hT.findMany({
    where: {
      satkerId,
      id: { notIn: idHtDipinjam },
    },
    orderBy: {
        serialNumber: 'asc'
    }
  });

  // Ambil daftar personil di satker ini
  const personilList = await prisma.personil.findMany({
    where: { satkerId },
    orderBy: { nama: 'asc' },
  });

  return { htDipinjam, htTersedia, personilList };
}

export default async function PeminjamanPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const { htDipinjam, htTersedia, personilList } = await getData(satkerId);

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Peminjaman & Pengembalian HT</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Catat transaksi peminjaman dan pengembalian aset HT di unit kerja Anda.
        </p>
      </div>

      <PeminjamanClientWrapper
        htDipinjam={htDipinjam}
        htTersedia={htTersedia}
        personilList={personilList}
      />
    </div>
  );
}
