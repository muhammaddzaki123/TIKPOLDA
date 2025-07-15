// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';
import { RiwayatPengajuanTable } from './RiwayatPengajuanTable'; // <-- Komponen baru
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const prisma = new PrismaClient();

async function getData(satkerId: string) {
  const personilList = await prisma.personil.findMany({
    where: { satkerId },
    orderBy: { nama: 'asc' },
  });

  const satkerList = await prisma.satker.findMany({
    where: { id: { not: satkerId } },
    orderBy: { nama: 'asc' },
  });

  // Ambil riwayat pengajuan untuk satker ini
  const riwayatPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: { satkerId },
    orderBy: { createdAt: 'desc' },
  });
  const riwayatMutasi = await prisma.pengajuanMutasi.findMany({
    where: { satkerAsalId: satkerId },
    include: { personil: true, satkerTujuan: true },
    orderBy: { createdAt: 'desc' },
  });
  
  // Gabungkan dan format data untuk tabel riwayat
  const riwayatGabungan = [
      ...riwayatPeminjaman.map(p => ({...p, tipe: 'Peminjaman HT'})),
      ...riwayatMutasi.map(m => ({...m, tipe: 'Mutasi Personil'})),
  ].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());


  return { personilList, satkerList, riwayatGabungan };
}

export default async function PengajuanPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const { personilList, satkerList, riwayatGabungan } = await getData(satkerId);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pusat Pengajuan</h1>
        <p className="text-sm text-slate-600">
          Gunakan formulir di bawah ini untuk mengirimkan permintaan resmi kepada Super Admin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormPeminjaman />
        <FormMutasi personilList={personilList} satkerList={satkerList} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <RiwayatPengajuanTable data={riwayatGabungan} />
        </CardContent>
      </Card>
    </div>
  );
}