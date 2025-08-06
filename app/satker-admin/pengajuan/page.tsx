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
  riwayatPengembalian.forEach(p => {
    // Membuat kunci unik berdasarkan alasan dan waktu pembuatan (dibulatkan ke menit terdekat)
    const groupKey = `${p.alasan}-${new Date(p.createdAt).setSeconds(0, 0)}`;

    if (!groupedReturns[groupKey]) {
      groupedReturns[groupKey] = {
        id: p.id, // Gunakan ID dari item pertama sebagai ID grup
        tipe: 'Pengembalian HT',
        status: p.status,
        trackingStatus: 'SUBMITTED',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        alasan: p.alasan,
        catatanAdmin: p.catatanAdmin,
        approvedHts: [], // Daftar HT yang dikembalikan
      };
    }
    // Tambahkan HT ke dalam paket dari pengembalianDetails
    if (p.pengembalianDetails && p.pengembalianDetails.length > 0) {
      p.pengembalianDetails.forEach(detail => {
        if (detail.ht) {
          groupedReturns[groupKey].approvedHts?.push(detail.ht);
        }
      });
    }
  });

  const riwayatPengembalianGrouped = Object.values(groupedReturns);
  // --- AKHIR DARI PERUBAHAN LOGIKA ---

  const riwayatGabungan: any[] = [
    ...riwayatPeminjaman.map(p => {
      const approvedHts = p.status === 'APPROVED' ? peminjamanSatker.filter(ps => ps.catatan?.includes(p.id.substring(0, 8))).map(ps => ps.ht) : [];
      
      // Tentukan tracking status berdasarkan kondisi peminjaman dan pengembalian
      let trackingStatus = 'SUBMITTED';
      if (p.status === 'APPROVED') {
        // Cek apakah ada pengajuan pengembalian untuk paket ini
        const hasReturnRequest = riwayatPengembalian.some(r => 
          r.pengajuanPeminjamanId === p.id && r.status === 'PENDING'
        );
        
        // Cek apakah sudah ada pengembalian yang disetujui
        const hasApprovedReturn = riwayatPengembalian.some(r => 
          r.pengajuanPeminjamanId === p.id && r.status === 'APPROVED'
        );
        
        // Cek apakah semua HT sudah dikembalikan (tanggalKembali tidak null)
        const allHtsReturned = peminjamanSatker
          .filter(ps => ps.catatan?.includes(p.id.substring(0, 8)))
          .every(ps => ps.tanggalKembali !== null);
        
        if (hasApprovedReturn || allHtsReturned) {
          trackingStatus = 'RETURNED';
        } else if (hasReturnRequest) {
          trackingStatus = 'RETURN_REQUESTED';
        } else {
          trackingStatus = 'IN_USE';
        }
      } else if (p.status === 'REJECTED') {
        trackingStatus = 'REJECTED';
      }
      
      return { 
        ...p, 
        tipe: 'Peminjaman HT', 
        trackingStatus,
        approvedHts 
      };
    }),
    ...riwayatMutasi.map(m => ({ 
      ...m, 
      tipe: 'Mutasi Personil', 
      trackingStatus: m.status === 'APPROVED' ? 'APPROVED' : m.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED' 
    })),
    ...riwayatPengembalianGrouped.map(r => ({
      ...r,
      trackingStatus: r.status === 'APPROVED' ? 'APPROVED' : r.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED'
    })), // Gunakan data yang sudah dikelompokkan
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

  return (
    <PengajuanClient 
      personilList={personilList}
      satkerList={satkerList}
      riwayatGabungan={riwayatGabungan}
      approvedLoans={approvedLoans}
    />
  );
}
