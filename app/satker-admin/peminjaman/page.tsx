// app/satker-admin/peminjaman/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PeminjamanForm } from '@/components/PeminjamanForm';
import { PengembalianTable } from '@/components/PengembalianTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const prisma = new PrismaClient();

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
        kodeHT: 'asc'
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
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Peminjaman & Pengembalian HT</h1>
        <p className="text-sm text-slate-600">
          Catat transaksi peminjaman dan pengembalian aset HT di unit kerja Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Peminjaman */}
        <div className="lg:col-span-1">
          <PeminjamanForm htTersedia={htTersedia} personilList={personilList} />
        </div>

        {/* Kolom Kanan: Tabel Pengembalian */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar HT Sedang Dipinjam</CardTitle>
            </CardHeader>
            <CardContent>
              <PengembalianTable data={htDipinjam} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
