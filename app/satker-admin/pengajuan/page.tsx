// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ApprovedLoanPackage } from '@/components/peminjaman/ReturnPackageForm';
import PengajuanClient from './PengajuanClient';

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
    prisma.pengajuanPengembalian.findMany({ 
      where: { satkerId }, 
      include: { 
        pengembalianDetails: {
          include: {
            ht: true
          }
        }
      }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.peminjamanSatker.findMany({ where: { satkerId }, include: { ht: true } }),
  ]);

  // --- PERUBAHAN LOGIKA PENGELOMPOKAN PENGEMBALIAN DIMULAI DI SINI ---
  const groupedReturns: { [key: string]: any } = {};
  riwayatPengembalian.forEach((p: any) => {
    // Membuat kunci unik berdasarkan alasan dan waktu pembuatan (dibulatkan ke menit terdekat)
    const groupKey = `${p.alasan}-${new Date(p.createdAt).setSeconds(0, 0)}`;

    if (!groupedReturns[groupKey]) {
      groupedReturns[groupKey] = {
        id: p.id, // Gunakan ID dari item pertama sebagai ID grup
        tipe: 'Pengembalian HT',
        status: p.status,
        trackingStatus: 'PENGAJUAN_DIKIRIM',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        alasan: p.alasan,
        catatanAdmin: p.catatanAdmin,
        approvedHts: [], // Daftar HT yang dikembalikan
      };
    }
    // Tambahkan HT ke dalam paket dari pengembalianDetails
    if (p.pengembalianDetails && p.pengembalianDetails.length > 0) {
      p.pengembalianDetails.forEach((detail: any) => {
        if (detail.ht) {
          groupedReturns[groupKey].approvedHts?.push(detail.ht);
        }
      });
    }
  });

  const riwayatPengembalianGrouped = Object.values(groupedReturns);
  // --- AKHIR DARI PERUBAHAN LOGIKA ---

  const riwayatGabungan: any[] = [
    ...riwayatPeminjaman.map((p: any) => {
      const approvedHts = p.status === 'APPROVED' ? peminjamanSatker.filter((ps: any) => ps.catatan?.includes(p.id.substring(0, 8))).map((ps: any) => ps.ht) : [];
      
      // Tentukan tracking status berdasarkan kondisi peminjaman dan pengembalian
      let trackingStatus = p.trackingStatus || 'PENGAJUAN_DIKIRIM';
      
      // Jika tidak ada trackingStatus dari database, tentukan berdasarkan kondisi
      if (!p.trackingStatus) {
        if (p.status === 'APPROVED') {
          // Cek apakah ada pengajuan pengembalian untuk paket ini
          const hasReturnRequest = riwayatPengembalian.some((r: any) => 
            r.pengajuanPeminjamanId === p.id && r.status === 'PENDING'
          );
          
          // Cek apakah sudah ada pengembalian yang disetujui
          const hasApprovedReturn = riwayatPengembalian.some((r: any) => 
            r.pengajuanPeminjamanId === p.id && r.status === 'APPROVED'
          );
          
          // Cek apakah semua HT sudah dikembalikan (tanggalKembali tidak null)
          const allHtsReturned = peminjamanSatker
            .filter((ps: any) => ps.catatan?.includes(p.id.substring(0, 8)))
            .every((ps: any) => ps.tanggalKembali !== null);
          
          if (hasApprovedReturn || allHtsReturned) {
            trackingStatus = 'SUDAH_DIKEMBALIKAN';
          } else if (hasReturnRequest) {
            trackingStatus = 'PERMINTAAN_PENGEMBALIAN';
          } else {
            trackingStatus = 'SEDANG_DIGUNAKAN';
          }
        } else if (p.status === 'REJECTED') {
          trackingStatus = 'DITOLAK';
        }
      }
      
      return { 
        ...p, 
        tipe: 'Peminjaman HT', 
        trackingStatus,
        approvedHts 
      };
    }),
    ...riwayatMutasi.map((m: any) => ({ 
      ...m, 
      tipe: 'Mutasi Personil', 
      trackingStatus: m.status === 'APPROVED' ? 'DISETUJUI' : m.status === 'REJECTED' ? 'DITOLAK' : 'PENGAJUAN_DIKIRIM' 
    })),
    ...riwayatPengembalianGrouped.map((r: any) => ({
      ...r,
      trackingStatus: r.status === 'APPROVED' ? 'DISETUJUI' : r.status === 'REJECTED' ? 'DITOLAK' : 'PENGAJUAN_DIKIRIM'
    })), // Gunakan data yang sudah dikelompokkan
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const approvedLoans: ApprovedLoanPackage[] = riwayatPeminjaman
    .filter((p: any) => p.status === 'APPROVED')
    .map((p: any) => {
      const htDetails = peminjamanSatker
        .filter((ps: any) => ps.catatan?.includes(p.id.substring(0, 8)) && ps.tanggalKembali === null)
        .map((ps: any) => ({ serialNumber: ps.ht.serialNumber, merk: ps.ht.merk }));
      
      // Cek apakah sudah ada pengajuan pengembalian yang pending untuk paket ini
      const hasPendingReturn = riwayatPengembalian.some((r: any) => 
        r.pengajuanPeminjamanId === p.id && r.status === 'PENDING'
      );
      
      // Cek apakah sudah ada pengembalian yang disetujui
      const hasApprovedReturn = riwayatPengembalian.some((r: any) => 
        r.pengajuanPeminjamanId === p.id && r.status === 'APPROVED'
      );
      
      // Hanya tampilkan jika ada HT aktif dan belum ada pengajuan pengembalian
      const shouldShow = htDetails.length > 0 && !hasPendingReturn && !hasApprovedReturn;
      
      return { ...p, htDetails, shouldShow };
    })
    .filter((p: any) => p.shouldShow);

  console.log('Approved loans data:', {
    totalRiwayatPeminjaman: riwayatPeminjaman.length,
    approvedCount: riwayatPeminjaman.filter((p: any) => p.status === 'APPROVED').length,
    approvedLoansCount: approvedLoans.length,
    peminjamanSatkerCount: peminjamanSatker.length,
    riwayatPengembalianCount: riwayatPengembalian.length
  });

  return { personilList, satkerList, riwayatGabungan, approvedLoans };
}

export default async function PengajuanPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const { personilList, satkerList, riwayatGabungan, approvedLoans } = await getData(satkerId);

  return (
    <PengajuanClient 
      personilList={personilList}
      satkerList={satkerList}
      riwayatGabungan={riwayatGabungan}
      approvedLoans={approvedLoans}
    />
  );
}
