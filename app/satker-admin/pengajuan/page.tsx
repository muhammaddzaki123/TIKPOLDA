// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';
import { ReturnPackageForm, ApprovedLoanPackage } from '@/components/peminjaman/ReturnPackageForm';
import { RiwayatPengajuanTable, Riwayat } from './RiwayatPengajuanTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Radio, Undo2 } from 'lucide-react';

const prisma = new PrismaClient();

async function getData(satkerId: string) {
  const [
    personilList,
    satkerList,
    riwayatPeminjaman,
    riwayatMutasi,
    riwayatPengembalian,
    peminjamanSatker,
  ] = await prisma.$transaction([
    prisma.personil.findMany({ where: { satkerId }, orderBy: { nama: 'asc' } }),
    prisma.satker.findMany({ where: { id: { not: satkerId } }, orderBy: { nama: 'asc' } }),
    prisma.pengajuanPeminjaman.findMany({ where: { satkerId }, orderBy: { createdAt: 'desc' } }),
    prisma.pengajuanMutasi.findMany({ where: { satkerAsalId: satkerId }, include: { personil: true, satkerTujuan: true }, orderBy: { createdAt: 'desc' } }),
    prisma.pengajuanPengembalian.findMany({ where: { satkerId }, include: { ht: true }, orderBy: { createdAt: 'desc' } }),
    prisma.peminjamanSatker.findMany({ where: { satkerId }, include: { ht: true } }),
  ]);

  // --- PERUBAHAN LOGIKA PENGELOMPOKAN PENGEMBALIAN DIMULAI DI SINI ---
  const groupedReturns: { [key: string]: Riwayat } = {};
  riwayatPengembalian.forEach(p => {
    // Membuat kunci unik berdasarkan alasan dan waktu pembuatan (dibulatkan ke menit terdekat)
    const groupKey = `${p.alasan}-${new Date(p.createdAt).setSeconds(0, 0)}`;

    if (!groupedReturns[groupKey]) {
      groupedReturns[groupKey] = {
        id: p.id, // Gunakan ID dari item pertama sebagai ID grup
        tipe: 'Pengembalian HT',
        status: p.status,
        createdAt: p.createdAt,
        alasan: p.alasan,
        catatanAdmin: p.catatanAdmin,
        approvedHts: [], // Ganti nama 'approvedHts' menjadi 'returnedHts' atau nama yang lebih sesuai
      };
    }
    // Tambahkan HT ke dalam paket
    if (p.ht) {
      groupedReturns[groupKey].approvedHts?.push(p.ht);
    }
  });

  const riwayatPengembalianGrouped = Object.values(groupedReturns);
  // --- AKHIR DARI PERUBAHAN LOGIKA ---

  const riwayatGabungan: Riwayat[] = [
    ...riwayatPeminjaman.map(p => {
      const approvedHts = p.status === 'APPROVED' ? peminjamanSatker.filter(ps => ps.catatan?.includes(p.id.substring(0, 8))).map(ps => ps.ht) : [];
      return { ...p, tipe: 'Peminjaman HT', approvedHts };
    }),
    ...riwayatMutasi.map(m => ({ ...m, tipe: 'Mutasi Personil' })),
    ...riwayatPengembalianGrouped, // Gunakan data yang sudah dikelompokkan
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const approvedLoans: ApprovedLoanPackage[] = riwayatPeminjaman
    .filter(p => p.status === 'APPROVED')
    .map(p => {
      const htDetails = peminjamanSatker
        .filter(ps => ps.catatan?.includes(p.id.substring(0, 8)) && ps.tanggalKembali === null)
        .map(ps => ({ kodeHT: ps.ht.kodeHT, merk: ps.ht.merk }));
      return { ...p, htDetails };
    })
    .filter(p => p.htDetails.length > 0);

  return { personilList, satkerList, riwayatGabungan, approvedLoans };
}

export default async function PengajuanPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const { personilList, satkerList, riwayatGabungan, approvedLoans } = await getData(satkerId);

  const riwayatPeminjamanData = riwayatGabungan.filter(r => r.tipe === 'Peminjaman HT');
  const riwayatMutasiData = riwayatGabungan.filter(r => r.tipe === 'Mutasi Personil');
  const riwayatPengembalianData = riwayatGabungan.filter(r => r.tipe === 'Pengembalian HT');

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Pengajuan</h1>
        <p className="text-sm text-slate-600">
          Gunakan formulir di bawah ini untuk mengirimkan permintaan resmi kepada Super Admin.
        </p>
      </div>

      <Tabs defaultValue="peminjaman" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="peminjaman"><Radio className="mr-2 h-4 w-4" />Peminjaman HT</TabsTrigger>
          <TabsTrigger value="mutasi"><ArrowRightLeft className="mr-2 h-4 w-4" />Mutasi Personil</TabsTrigger>
          <TabsTrigger value="pengembalian"><Undo2 className="mr-2 h-4 w-4" />Pengembalian HT</TabsTrigger>
        </TabsList>

        <TabsContent value="peminjaman" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><FormPeminjaman /></div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Riwayat Pengajuan Peminjaman HT</CardTitle><CardDescription>Jejak audit untuk semua permintaan peminjaman aset HT Anda.</CardDescription></CardHeader>
                <CardContent><RiwayatPengajuanTable data={riwayatPeminjamanData} /></CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mutasi" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1"><FormMutasi personilList={personilList} satkerList={satkerList} /></div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Riwayat Pengajuan Mutasi Personil</CardTitle><CardDescription>Jejak audit untuk semua permintaan mutasi anggota Anda.</CardDescription></CardHeader>
                        <CardContent><RiwayatPengajuanTable data={riwayatMutasiData} /></CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
        
        <TabsContent value="pengembalian" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ReturnPackageForm approvedLoans={approvedLoans} />
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Riwayat Pengajuan Pengembalian HT</CardTitle><CardDescription>Jejak audit untuk semua permintaan pengembalian aset HT Anda ke pusat.</CardDescription></CardHeader>
                <CardContent><RiwayatPengajuanTable data={riwayatPengembalianData} /></CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}