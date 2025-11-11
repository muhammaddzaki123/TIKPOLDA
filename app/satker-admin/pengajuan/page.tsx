// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApprovedLoanPackage } from '@/components/peminjaman/ReturnPackageForm';
import PengajuanClient from './PengajuanClient';
import { TrackingStatus } from '@/components/tracking/TrackingTimeline';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  interface HtDetail {
    id: string;
    merk: string;
    serialNumber: string;
  }

  interface GroupedReturn {
    id: string;
    tipe: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    trackingStatus: TrackingStatus | null;
    createdAt: Date;
    updatedAt: Date;
    alasan: string;
    catatanAdmin: string | null;
    approvedHts: HtDetail[];
  }

  // --- PERUBAHAN LOGIKA PENGELOMPOKAN PENGEMBALIAN DIMULAI DI SINI ---
  const groupedReturns: { [key: string]: GroupedReturn } = {};
  riwayatPengembalian.forEach((p) => {
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
      p.pengembalianDetails.forEach((detail) => {
        if (detail.ht) {
          groupedReturns[groupKey].approvedHts?.push(detail.ht);
        }
      });
    }
  });

  const riwayatPengembalianGrouped = Object.values(groupedReturns);
  // --- AKHIR DARI PERUBAHAN LOGIKA ---

  interface RiwayatGabunganItem {
    id: string;
    tipe: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    trackingStatus: TrackingStatus | null;
    createdAt: Date;
    updatedAt: Date;
    alasan?: string;
    catatanAdmin?: string | null;
    approvedHts?: HtDetail[];
    keperluan?: string;
    jumlah?: number;
    tanggalMulai?: Date | null;
    tanggalSelesai?: Date | null;
    fileUrl?: string | null;
    personil?: { nama: string };
    satkerTujuan?: { nama: string };
  }

  const riwayatGabungan: RiwayatGabunganItem[] = [
    ...riwayatPeminjaman.map((p) => {
      const approvedHts = p.status === 'APPROVED' ? peminjamanSatker.filter((ps) => ps.catatan?.includes(p.id.substring(0, 8))).map((ps) => ps.ht) : [];
      
      // Tentukan tracking status berdasarkan kondisi peminjaman dan pengembalian
      let trackingStatus = p.trackingStatus || 'PENGAJUAN_DIKIRIM';
      
      // Jika tidak ada trackingStatus dari database, tentukan berdasarkan kondisi
      if (!p.trackingStatus) {
        if (p.status === 'APPROVED') {
          // Cek apakah ada pengajuan pengembalian untuk paket ini
          const hasReturnRequest = riwayatPengembalian.some((r) => 
            r.pengajuanPeminjamanId === p.id && r.status === 'PENDING'
          );
          
          // Cek apakah sudah ada pengembalian yang disetujui
          const hasApprovedReturn = riwayatPengembalian.some((r) => 
            r.pengajuanPeminjamanId === p.id && r.status === 'APPROVED'
          );
          
          // Cek apakah semua HT sudah dikembalikan (tanggalKembali tidak null)
          const allHtsReturned = peminjamanSatker
            .filter((ps) => ps.catatan?.includes(p.id.substring(0, 8)))
            .every((ps) => ps.tanggalKembali !== null);
          
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
    ...riwayatMutasi.map((m) => ({ 
      ...m, 
      tipe: 'Mutasi Personil', 
      trackingStatus: (m.status === 'APPROVED' ? 'DISETUJUI' : m.status === 'REJECTED' ? 'DITOLAK' : 'PENGAJUAN_DIKIRIM') as TrackingStatus
    })),
    ...riwayatPengembalianGrouped.map((r) => ({
      ...r,
      trackingStatus: (r.status === 'APPROVED' ? 'DISETUJUI' : r.status === 'REJECTED' ? 'DITOLAK' : 'PENGAJUAN_DIKIRIM') as TrackingStatus
    })), // Gunakan data yang sudah dikelompokkan
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const approvedLoans: ApprovedLoanPackage[] = riwayatPeminjaman
    .filter((p) => p.status === 'APPROVED')
    .map((p) => {
      const htDetails = peminjamanSatker
        .filter((ps) => ps.catatan?.includes(p.id.substring(0, 8)) && ps.tanggalKembali === null)
        .map((ps) => ({ serialNumber: ps.ht.serialNumber, merk: ps.ht.merk }));
      
      // Find the most recent return request for this loan package
      const lastReturnRequest = riwayatPengembalian
        .filter((r) => r.pengajuanPeminjamanId === p.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      const returnStatus = lastReturnRequest ? lastReturnRequest.status : null;
      
      // The button should only be shown if there are active HTs AND
      // there is either no return request, or the last one was rejected.
      const shouldShow = htDetails.length > 0 && (!returnStatus || returnStatus === 'REJECTED');
      
      return { ...p, htDetails, shouldShow, returnStatus };
    })
    .filter((p) => p.shouldShow);

  console.log('Approved loans data:', {
    totalRiwayatPeminjaman: riwayatPeminjaman.length,
    approvedCount: riwayatPeminjaman.filter((p) => p.status === 'APPROVED').length,
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
