import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
async function getSuperAdminNotifications(userId: string): Promise<NotificationItem[]> { 
  const existingNotifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const existingIds = new Set(existingNotifications.map(n => n.relatedId));

  try {
    // 1. Pengajuan Peminjaman (PENDING dan yang baru diupdate)
    const pengajuanPeminjaman = await prisma.pengajuanPeminjaman.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { 
            status: { in: ['APPROVED', 'REJECTED'] },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        ]
      },
      include: { satkerPengaju: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    for (const pengajuan of pengajuanPeminjaman) {
      if (!existingIds.has(pengajuan.id)) {
        const title = pengajuan.status === 'PENDING' 
          ? 'Pengajuan Peminjaman Baru'
          : pengajuan.status === 'APPROVED'
          ? 'Peminjaman Disetujui'
          : 'Peminjaman Ditolak';
        
        const priority = pengajuan.status === 'PENDING' ? 'high' : 'medium';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'peminjaman_baru',
            title,
            message: `${pengajuan.satkerPengaju.nama} - ${pengajuan.jumlah} unit HT - Status: ${pengajuan.status}`,
            relatedId: pengajuan.id,
            satkerName: pengajuan.satkerPengaju.nama,
            priority,
            createdAt: pengajuan.updatedAt
          }
        });
      }
    }

    // 2. Pengajuan Mutasi
    const pengajuanMutasi = await prisma.pengajuanMutasi.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { 
            status: { in: ['APPROVED', 'REJECTED'] },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        ]
      },
      include: { 
        personil: true,
        satkerAsal: true,
        satkerTujuan: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    for (const mutasi of pengajuanMutasi) {
      if (!existingIds.has(mutasi.id)) {
        const title = mutasi.status === 'PENDING'
          ? 'Pengajuan Mutasi Baru'
          : mutasi.status === 'APPROVED'
          ? 'Mutasi Disetujui'
          : 'Mutasi Ditolak';
        
        const priority = mutasi.status === 'PENDING' ? 'high' : 'medium';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'mutasi_baru',
            title,
            message: `${mutasi.personil.nama} dari ${mutasi.satkerAsal.nama} ke ${mutasi.satkerTujuan.nama} - Status: ${mutasi.status}`,
            relatedId: mutasi.id,
            satkerName: mutasi.satkerAsal.nama,
            priority,
            createdAt: mutasi.updatedAt
          }
        });
      }
    }

    // 3. Pengajuan Pengembalian
    const pengajuanPengembalian = await prisma.pengajuanPengembalian.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { 
            status: { in: ['APPROVED', 'REJECTED'] },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        ]
      },
      include: { 
        satkerPengaju: true,
        pengembalianDetails: { include: { ht: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    for (const pengembalian of pengajuanPengembalian) {
      if (!existingIds.has(pengembalian.id)) {
        const jumlahHT = pengembalian.pengembalianDetails.length;
        const title = pengembalian.status === 'PENDING'
          ? 'Pengajuan Pengembalian Baru'
          : pengembalian.status === 'APPROVED'
          ? 'Pengembalian Disetujui'
          : 'Pengembalian Ditolak';
        
        const priority = pengembalian.status === 'PENDING' ? 'high' : 'medium';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'pengembalian_baru',
            title,
            message: `${pengembalian.satkerPengaju.nama} - ${jumlahHT} unit HT - Status: ${pengembalian.status}`,
            relatedId: pengembalian.id,
            satkerName: pengembalian.satkerPengaju.nama,
            priority,
            createdAt: pengembalian.updatedAt
          }
        });
      }
    }

  } catch (error) {
    console.error('Error creating notifications:', error);
  }

  // Ambil semua notifikasi dari database
  const allNotifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return allNotifications.map(n => ({
    id: n.id,
    type: n.type as NotificationItem['type'],
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    isRead: n.isRead,
    priority: n.priority as NotificationItem['priority'],
    relatedId: n.relatedId || undefined,
    satkerName: n.satkerName || undefined
  }));
}

// Fungsi untuk mendapatkan notifikasi Admin Satker
async function getSatkerAdminNotifications(userId: string, satkerId: string): Promise<NotificationItem[]> {
  const existingNotifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const existingIds = new Set(existingNotifications.map(n => n.relatedId));

  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // 1. Pengajuan Peminjaman yang diupdate (tracking status berubah)
    const pengajuanUpdated = await prisma.pengajuanPeminjaman.findMany({
      where: {
        satkerId,
        updatedAt: { gte: last24Hours }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    for (const pengajuan of pengajuanUpdated) {
      const notifKey = `${pengajuan.id}_${pengajuan.trackingStatus || pengajuan.status}`;
      if (!existingIds.has(notifKey)) {
        let title = 'Update Pengajuan';
        let priority: 'low' | 'medium' | 'high' = 'medium';
        
        if (pengajuan.status === 'APPROVED') {
          title = 'Pengajuan Disetujui';
          priority = 'high';
        } else if (pengajuan.status === 'REJECTED') {
          title = 'Pengajuan Ditolak';
          priority = 'medium';
        } else if (pengajuan.trackingStatus === 'SIAP_DIAMBIL') {
          title = 'HT Siap Diambil';
          priority = 'high';
        } else if (pengajuan.trackingStatus === 'SUDAH_DIKEMBALIKAN') {
          title = 'Pengembalian Diterima';
          priority = 'high';
        }
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'peminjaman_baru',
            title,
            message: `Peminjaman ${pengajuan.jumlah} unit HT - Status: ${pengajuan.trackingStatus || pengajuan.status}`,
            relatedId: notifKey,
            priority,
            createdAt: pengajuan.updatedAt
          }
        });
      }
    }

    // 2. Pengajuan Mutasi yang diupdate
    const mutasiUpdated = await prisma.pengajuanMutasi.findMany({
      where: {
        satkerAsalId: satkerId,
        updatedAt: { gte: last24Hours }
      },
      include: {
        personil: true,
        satkerTujuan: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    for (const mutasi of mutasiUpdated) {
      const notifKey = `${mutasi.id}_${mutasi.status}`;
      if (!existingIds.has(notifKey)) {
        const title = mutasi.status === 'APPROVED'
          ? 'Mutasi Disetujui'
          : mutasi.status === 'REJECTED'
          ? 'Mutasi Ditolak'
          : 'Update Mutasi';
        
        const priority = mutasi.status === 'APPROVED' ? 'high' : 'medium';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'mutasi_baru',
            title,
            message: `Mutasi ${mutasi.personil.nama} ke ${mutasi.satkerTujuan.nama} - Status: ${mutasi.status}`,
            relatedId: notifKey,
            priority,
            createdAt: mutasi.updatedAt
          }
        });
      }
    }

    // 3. Pengajuan Pengembalian yang diupdate
    const pengembalianUpdated = await prisma.pengajuanPengembalian.findMany({
      where: {
        satkerId,
        updatedAt: { gte: last24Hours }
      },
      include: {
        pengembalianDetails: { include: { ht: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    for (const pengembalian of pengembalianUpdated) {
      const notifKey = `${pengembalian.id}_${pengembalian.status}`;
      if (!existingIds.has(notifKey)) {
        const jumlahHT = pengembalian.pengembalianDetails.length;
        const title = pengembalian.status === 'APPROVED'
          ? 'Pengembalian Diterima'
          : pengembalian.status === 'REJECTED'
          ? 'Pengembalian Ditolak'
          : 'Update Pengembalian';
        
        const priority = pengembalian.status === 'REJECTED' ? 'high' : 'medium';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'pengembalian_baru',
            title,
            message: `${jumlahHT} unit HT - Status: ${pengembalian.status}${pengembalian.catatanAdmin ? ` - ${pengembalian.catatanAdmin}` : ''}`,
            relatedId: notifKey,
            priority,
            createdAt: pengembalian.updatedAt
          }
        });
      }
    }

  } catch (error) {
    console.error('Error creating satker notifications:', error);
  }

  // Ambil semua notifikasi dari database
  const allNotifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return allNotifications.map(n => ({
    id: n.id,
    type: n.type as NotificationItem['type'],
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    isRead: n.isRead,
    priority: n.priority as NotificationItem['priority'],
    relatedId: n.relatedId || undefined,
    satkerName: n.satkerName || undefined
  }));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let notifications: NotificationItem[] = [];
    const userId = session.user.id;
    
    if (session.user.role === 'SUPER_ADMIN') {
      notifications = await getSuperAdminNotifications(userId);
    } else if (session.user.role === 'ADMIN_SATKER' && session.user.satkerId) {
      notifications = await getSatkerAdminNotifications(userId, session.user.satkerId);
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
