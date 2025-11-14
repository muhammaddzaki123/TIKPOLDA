import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    let result = {
      pendingPeminjaman: 0,
      pendingMutasi: 0,
      pendingPengembalian: 0,
      keterlambatan: 0,
      mendekatiDeadline: 0,
      pengembalianMasuk: 0,
      pengembalianDisetujui: 0,
      pengembalianDitolak: 0,
      pengembalianPending: 0
    };

    if (session.user.role === 'SUPER_ADMIN') {
      // Data untuk Super Admin
      const [
        pendingPeminjaman,
        pendingMutasi,
        pendingPengembalian,
        keterlambatanSatker,
        pengembalianDisetujui,
        pengembalianDitolak
      ] = await Promise.all([
        prisma.pengajuanPeminjaman.count({
          where: { status: 'PENDING' }
        }),
        prisma.pengajuanMutasi.count({
          where: { status: 'PENDING' }
        }),
        prisma.pengajuanPengembalian.count({
          where: { status: 'PENDING' }
        }),
        prisma.peminjamanSatker.count({
          where: {
            tanggalKembali: null,
            tanggalPinjam: {
              lt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.pengajuanPengembalian.count({
          where: {
            status: 'APPROVED',
            updatedAt: { gte: sevenDaysAgo }
          }
        }),
        prisma.pengajuanPengembalian.count({
          where: {
            status: 'REJECTED',
            updatedAt: { gte: sevenDaysAgo }
          }
        })
      ]);

      result = {
        pendingPeminjaman,
        pendingMutasi,
        pendingPengembalian,
        keterlambatan: keterlambatanSatker,
        mendekatiDeadline: 0,
        pengembalianMasuk: pendingPengembalian, // Sama dengan pending
        pengembalianDisetujui,
        pengembalianDitolak,
        pengembalianPending: pendingPengembalian
      };

    } else if (session.user.role === 'ADMIN_SATKER' && session.user.satkerId) {
      // Data untuk Admin Satker
      const satkerId = session.user.satkerId;
      
      const [
        pengajuanUpdated,
        keterlambatanInternal,
        mendekatiDeadline,
        statusTrackingBerubah,
        pengembalianDisetujui,
        pengembalianDitolak,
        pengembalianPending
      ] = await Promise.all([
        prisma.pengajuanPeminjaman.count({
          where: {
            satkerId,
            status: { in: ['APPROVED', 'REJECTED'] },
            updatedAt: { gte: sevenDaysAgo }
          }
        }),
        prisma.peminjaman.count({
          where: {
            ht: { satkerId },
            tanggalKembali: null,
            estimasiKembali: { lt: today }
          }
        }),
        prisma.peminjaman.count({
          where: {
            ht: { satkerId },
            tanggalKembali: null,
            estimasiKembali: {
              gte: today,
              lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        // Hitung pengajuan dengan perubahan tracking status dalam 24 jam terakhir
        prisma.pengajuanPeminjaman.count({
          where: {
            satkerId,
            trackingStatus: { in: ['SIAP_DIAMBIL', 'PERMINTAAN_PENGEMBALIAN', 'SUDAH_DIKEMBALIKAN'] },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.pengajuanPengembalian.count({
          where: {
            satkerId,
            status: 'APPROVED',
            updatedAt: { gte: sevenDaysAgo }
          }
        }),
        prisma.pengajuanPengembalian.count({
          where: {
            satkerId,
            status: 'REJECTED',
            updatedAt: { gte: sevenDaysAgo }
          }
        }),
        prisma.pengajuanPengembalian.count({
          where: {
            satkerId,
            status: 'PENDING'
          }
        })
      ]);

      result = {
        pendingPeminjaman: pengajuanUpdated + statusTrackingBerubah,
        pendingMutasi: 0,
        pendingPengembalian: 0,
        keterlambatan: keterlambatanInternal,
        mendekatiDeadline,
        pengembalianMasuk: 0,
        pengembalianDisetujui,
        pengembalianDitolak,
        pengembalianPending
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in notification counts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
