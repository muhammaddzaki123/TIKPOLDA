import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface untuk notifikasi
interface NotificationItem {
  id: string;
  type: 'peminjaman_baru' | 'mutasi_baru' | 'pengembalian_baru' | 'keterlambatan';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  satkerName?: string;
}

// Fungsi untuk mendapatkan notifikasi Super Admin
async function getSuperAdminNotifications(): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = [];

  try {
    // 1. Pengajuan Peminjaman Baru (PENDING)
    const pengajuanPeminjamanBaru = await prisma.pengajuanPeminjaman.findMany({
      where: { status: 'PENDING' },
      include: { satkerPengaju: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    pengajuanPeminjamanBaru.forEach((pengajuan) => {
      notifications.push({
        id: `peminjaman_${pengajuan.id}`,
        type: 'peminjaman_baru',
        title: 'Pengajuan Peminjaman Baru',
        message: `${pengajuan.satkerPengaju.nama} mengajukan peminjaman ${pengajuan.jumlah} unit HT`,
        createdAt: pengajuan.createdAt,
        isRead: false,
        priority: 'high',
        relatedId: pengajuan.id,
        satkerName: pengajuan.satkerPengaju.nama
      });
    });

    // 2. Pengajuan Mutasi Baru (PENDING)
    const pengajuanMutasiBaru = await prisma.pengajuanMutasi.findMany({
      where: { status: 'PENDING' },
      include: { 
        personil: true,
        satkerAsal: true,
        satkerTujuan: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    pengajuanMutasiBaru.forEach((mutasi) => {
      notifications.push({
        id: `mutasi_${mutasi.id}`,
        type: 'mutasi_baru',
        title: 'Pengajuan Mutasi Baru',
        message: `Mutasi ${mutasi.personil.nama} dari ${mutasi.satkerAsal.nama} ke ${mutasi.satkerTujuan.nama}`,
        createdAt: mutasi.createdAt,
        isRead: false,
        priority: 'medium',
        relatedId: mutasi.id,
        satkerName: mutasi.satkerAsal.nama
      });
    });

    // 3. Pengajuan Pengembalian Baru (PENDING)
    const pengajuanPengembalianBaru = await prisma.pengajuanPengembalian.findMany({
      where: { status: 'PENDING' },
      include: { 
        satkerPengaju: true,
        pengembalianDetails: {
          include: { ht: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    pengajuanPengembalianBaru.forEach((pengembalian) => {
      const jumlahHT = pengembalian.pengembalianDetails.length;
      notifications.push({
        id: `pengembalian_${pengembalian.id}`,
        type: 'pengembalian_baru',
        title: 'Pengajuan Pengembalian Baru',
        message: `${pengembalian.satkerPengaju.nama} mengajukan pengembalian ${jumlahHT} unit HT`,
        createdAt: pengembalian.createdAt,
        isRead: false,
        priority: 'medium',
        relatedId: pengembalian.id,
        satkerName: pengembalian.satkerPengaju.nama
      });
    });

    // 4. Keterlambatan Pengembalian (Peminjaman Satker)
    const today = new Date();
    const peminjamanTerlambat = await prisma.peminjamanSatker.findMany({
      where: {
        tanggalKembali: null,
        tanggalPinjam: {
          lt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 hari yang lalu
        }
      },
      include: {
        satker: true,
        ht: true
      },
      take: 10
    });

    peminjamanTerlambat.forEach((peminjaman) => {
      const hariTerlambat = Math.floor((today.getTime() - peminjaman.tanggalPinjam.getTime()) / (1000 * 60 * 60 * 24)) - 30;
      notifications.push({
        id: `keterlambatan_${peminjaman.id}`,
        type: 'keterlambatan',
        title: 'Keterlambatan Pengembalian',
        message: `${peminjaman.satker.nama} terlambat ${hariTerlambat} hari mengembalikan HT ${peminjaman.ht.kodeHT}`,
        createdAt: peminjaman.tanggalPinjam,
        isRead: false,
        priority: 'high',
        relatedId: peminjaman.id,
        satkerName: peminjaman.satker.nama
      });
    });

  } catch (error) {
    console.error('Error fetching super admin notifications:', error);
  }

  // Urutkan berdasarkan prioritas dan tanggal
  return notifications.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

// Fungsi untuk mendapatkan notifikasi Admin Satker
async function getSatkerAdminNotifications(satkerId: string): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = [];

  try {
    // 1. Status Pengajuan yang Diupdate (APPROVED/REJECTED dalam 7 hari terakhir)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const pengajuanUpdated = await prisma.pengajuanPeminjaman.findMany({
      where: {
        satkerId,
        status: { in: ['APPROVED', 'REJECTED'] },
        updatedAt: { gte: sevenDaysAgo }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    pengajuanUpdated.forEach((pengajuan) => {
      notifications.push({
        id: `update_${pengajuan.id}`,
        type: pengajuan.status === 'APPROVED' ? 'peminjaman_baru' : 'peminjaman_baru',
        title: `Pengajuan ${pengajuan.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`,
        message: `Pengajuan peminjaman ${pengajuan.jumlah} unit HT telah ${pengajuan.status === 'APPROVED' ? 'disetujui' : 'ditolak'}`,
        createdAt: pengajuan.updatedAt,
        isRead: false,
        priority: pengajuan.status === 'APPROVED' ? 'high' : 'medium',
        relatedId: pengajuan.id
      });
    });

    // 2. Keterlambatan Pengembalian Internal (Peminjaman Personil)
    const today = new Date();
    const peminjamanTerlambat = await prisma.peminjaman.findMany({
      where: {
        ht: { satkerId },
        tanggalKembali: null,
        estimasiKembali: {
          lt: today
        }
      },
      include: {
        personil: true,
        ht: true
      },
      take: 10
    });

    peminjamanTerlambat.forEach((peminjaman) => {
      if (peminjaman.estimasiKembali) {
        const hariTerlambat = Math.floor((today.getTime() - peminjaman.estimasiKembali.getTime()) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `keterlambatan_internal_${peminjaman.id}`,
          type: 'keterlambatan',
          title: 'Keterlambatan Pengembalian Internal',
          message: `${peminjaman.personil.nama} terlambat ${hariTerlambat} hari mengembalikan HT ${peminjaman.ht.kodeHT}`,
          createdAt: peminjaman.estimasiKembali,
          isRead: false,
          priority: hariTerlambat > 7 ? 'high' : 'medium',
          relatedId: peminjaman.id
        });
      }
    });

    // 3. HT Mendekati Batas Waktu Pengembalian (3 hari lagi)
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const peminjamanMendekatiDeadline = await prisma.peminjaman.findMany({
      where: {
        ht: { satkerId },
        tanggalKembali: null,
        estimasiKembali: {
          gte: today,
          lte: threeDaysFromNow
        }
      },
      include: {
        personil: true,
        ht: true
      },
      take: 5
    });

    peminjamanMendekatiDeadline.forEach((peminjaman) => {
      if (peminjaman.estimasiKembali) {
        const hariSisa = Math.ceil((peminjaman.estimasiKembali.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `deadline_${peminjaman.id}`,
          type: 'keterlambatan',
          title: 'Mendekati Batas Pengembalian',
          message: `HT ${peminjaman.ht.kodeHT} (${peminjaman.personil.nama}) harus dikembalikan dalam ${hariSisa} hari`,
          createdAt: peminjaman.tanggalPinjam,
          isRead: false,
          priority: 'medium',
          relatedId: peminjaman.id
        });
      }
    });

  } catch (error) {
    console.error('Error fetching satker admin notifications:', error);
  }

  // Urutkan berdasarkan prioritas dan tanggal
  return notifications.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let notifications: NotificationItem[] = [];
    
    if (session.user.role === 'SUPER_ADMIN') {
      notifications = await getSuperAdminNotifications();
    } else if (session.user.role === 'ADMIN_SATKER' && session.user.satkerId) {
      notifications = await getSatkerAdminNotifications(session.user.satkerId);
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
