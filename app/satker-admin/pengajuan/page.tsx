// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';
import { RiwayatPengajuanTable, Riwayat } from './RiwayatPengajuanTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // <-- Impor komponen Tabs
import { ArrowRightLeft, Radio } from 'lucide-react';

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

  const peminjamanSatker = await prisma.peminjamanSatker.findMany({
    where: { satkerId },
    include: { ht: true },
  });

  // Gabungkan dan format data untuk tabel riwayat
  const riwayatGabungan: Riwayat[] = [
    ...riwayatPeminjaman.map(p => {
      const approvedHts = p.status === 'APPROVED'
        ? peminjamanSatker
            .filter(ps => ps.catatan?.includes(p.id.substring(0, 8)))
            .map(ps => ps.ht)
        : [];
      
      return { ...p, tipe: 'Peminjaman HT', approvedHts };
    }),
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

  // Pisahkan data riwayat untuk setiap tab
  const riwayatPeminjamanData = riwayatGabungan.filter(r => r.tipe === 'Peminjaman HT');
  const riwayatMutasiData = riwayatGabungan.filter(r => r.tipe === 'Mutasi Personil');

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Pengajuan</h1>
        <p className="text-sm text-slate-600">
          Gunakan formulir di bawah ini untuk mengirimkan permintaan resmi kepada Super Admin.
        </p>
      </div>

      <Tabs defaultValue="peminjaman" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="peminjaman">
            <Radio className="mr-2 h-4 w-4" />
            Pengajuan Peminjaman HT
          </TabsTrigger>
          <TabsTrigger value="mutasi">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Pengajuan Mutasi Personil
          </TabsTrigger>
        </TabsList>

        {/* --- KONTEN TAB PEMINJAMAN HT --- */}
        <TabsContent value="peminjaman" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FormPeminjaman />
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Pengajuan Peminjaman HT</CardTitle>
                  <CardDescription>Jejak audit untuk semua permintaan peminjaman aset HT Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiwayatPengajuanTable data={riwayatPeminjamanData} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- KONTEN TAB MUTASI PERSONIL --- */}
        <TabsContent value="mutasi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FormMutasi personilList={personilList} satkerList={satkerList} />
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                    <CardTitle>Riwayat Pengajuan Mutasi Personil</CardTitle>
                    <CardDescription>Jejak audit untuk semua permintaan mutasi anggota Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <RiwayatPengajuanTable data={riwayatMutasiData} />
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}