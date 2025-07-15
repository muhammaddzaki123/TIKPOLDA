// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient, PengajuanPeminjaman, PengajuanMutasi, HT } from '@prisma/client';
import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';
import { RiwayatPengajuanTable, Riwayat } from './RiwayatPengajuanTable';
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

  const riwayatPeminjaman = await prisma.pengajuanPeminjaman.findMany({
    where: { satkerId },
    orderBy: { createdAt: 'desc' },
  });

  const riwayatMutasi = await prisma.pengajuanMutasi.findMany({
    where: { satkerAsalId: satkerId },
    include: { personil: true, satkerTujuan: true },
    orderBy: { createdAt: 'desc' },
  });

  // --- PEMBARUAN UTAMA DI SINI ---
  // Ambil semua HT yang tercatat dipinjamkan ke Satker ini
  const peminjamanSatker = await prisma.peminjamanSatker.findMany({
    where: { satkerId },
    include: { ht: true },
  });

  // Gabungkan dan format data untuk tabel riwayat
  const riwayatGabungan: Riwayat[] = [
    // Proses pengajuan peminjaman
    ...riwayatPeminjaman.map(p => {
      // Jika statusnya APPROVED, cari HT yang terkait
      const approvedHts = p.status === 'APPROVED'
        ? peminjamanSatker
            .filter(ps => ps.catatan?.includes(p.id.substring(0, 8)))
            .map(ps => ps.ht)
        : [];
      
      return { ...p, tipe: 'Peminjaman HT', approvedHts };
    }),
    // Proses pengajuan mutasi
    ...riwayatMutasi.map(m => ({ ...m, tipe: 'Mutasi Personil' })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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