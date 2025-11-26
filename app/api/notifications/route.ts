import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Interface untuk notifikasi
interface NotificationItem {
  id: string;
  type: 'peminjaman_baru' | 'mutasi_baru' | 'pengembalian_baru' | 'keterlambatan' | 'keterlambatan_paket_peminjaman';
  title: string;
  message: string;
  link: string; // URL tujuan saat notifikasi diklik
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
        let title = 'Pengajuan Peminjaman Baru';
        let link = '/dashboard/persetujuan'; // Default untuk semua notifikasi peminjaman
        
        if (pengajuan.status === 'PENDING') {
          title = 'Pengajuan Peminjaman Baru';
          link = '/dashboard/persetujuan'; // Pending perlu persetujuan
        } else if (pengajuan.status === 'APPROVED') {
          title = 'Peminjaman Disetujui';
          link = '/dashboard/satker'; // Approved bisa lihat di manajemen satker
        } else if (pengajuan.status === 'REJECTED') {
          title = 'Peminjaman Ditolak';
          link = '/dashboard/satker'; // Rejected juga ke satker
        }
        
        const priority = pengajuan.status === 'PENDING' ? 'high' : 'medium';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'peminjaman_baru',
            title,
            message: `${pengajuan.satkerPengaju.nama} - ${pengajuan.jumlah} unit HT - Status: ${pengajuan.status}`,
            link,
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
        
        // Link ke halaman persetujuan untuk pengajuan baru, riwayat mutasi untuk yang sudah diproses
        const link = mutasi.status === 'PENDING' 
          ? '/dashboard/persetujuan' 
          : '/dashboard/riwayat-mutasi';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'mutasi_baru',
            title,
            message: `${mutasi.personil.nama} dari ${mutasi.satkerAsal.nama} ke ${mutasi.satkerTujuan.nama} - Status: ${mutasi.status}`,
            link,
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
        
        // Link ke halaman persetujuan untuk pengajuan baru, riwayat untuk yang sudah diproses
        const link = pengembalian.status === 'PENDING'
          ? '/dashboard/persetujuan'
          : '/dashboard/riwayat';
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'pengembalian_baru',
            title,
            message: `${pengembalian.satkerPengaju.nama} - ${jumlahHT} unit HT - Status: ${pengembalian.status}`,
            link,
            relatedId: pengembalian.id,
            satkerName: pengembalian.satkerPengaju.nama,
            priority,
            createdAt: pengembalian.updatedAt
          }
        });
      }
    }

    // 4. Keterlambatan Paket Peminjaman Satker
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cari paket yang terlambat (tanggalReturn atau tanggalSelesai sudah lewat)
    const overdueLoanPackages = await prisma.pengajuanPeminjaman.findMany({
      where: {
        trackingStatus: {
          in: ['SEDANG_DIGUNAKAN', 'PERMINTAAN_PENGEMBALIAN']
        },
        status: 'APPROVED',
        OR: [
          {
            tanggalReturn: {
              lt: today,
            }
          },
          {
            tanggalReturn: null,
            tanggalSelesai: {
              lt: today,
            }
          }
        ]
      },
      include: {
        satkerPengaju: true,
      },
      orderBy: {
        tanggalReturn: 'asc',
      },
    });

    for (const loanPackage of overdueLoanPackages) {
      // Gunakan tanggalReturn atau tanggalSelesai untuk hitung keterlambatan
      const returnDate = loanPackage.tanggalReturn || loanPackage.tanggalSelesai;
      if (!returnDate) continue;

      const daysOverdue = Math.floor(
        (today.getTime() - new Date(returnDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: userId,
          type: 'keterlambatan_paket_peminjaman',
          relatedId: loanPackage.id,
          createdAt: {
            gte: todayStart,
          },
        },
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'keterlambatan_paket_peminjaman',
            title: '⚠️ Paket HT Terlambat Dikembalikan',
            message: `Paket peminjaman ${loanPackage.jumlah} unit HT oleh ${loanPackage.satkerPengaju.nama} terlambat ${daysOverdue} hari. Segera hubungi satker!`,
            link: '/dashboard/persetujuan', // Ke halaman persetujuan untuk follow up pengembalian
            relatedId: loanPackage.id,
            satkerName: loanPackage.satkerPengaju.nama,
            priority: 'high',
          },
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
    link: n.link || '/dashboard',
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
        let link = '/satker-admin/pengajuan'; // Default link
        
        if (pengajuan.status === 'APPROVED') {
          title = 'Pengajuan Disetujui';
          priority = 'high';
          link = '/satker-admin/pengajuan';
        } else if (pengajuan.status === 'REJECTED') {
          title = 'Pengajuan Ditolak';
          priority = 'medium';
          link = '/satker-admin/pengajuan';
        } else if (pengajuan.trackingStatus === 'SIAP_DIAMBIL') {
          title = 'HT Siap Diambil';
          priority = 'high';
          link = '/satker-admin/peminjaman';
        } else if (pengajuan.trackingStatus === 'SUDAH_DIKEMBALIKAN') {
          title = 'Pengembalian Diterima';
          priority = 'high';
          link = '/satker-admin/riwayat-peminjaman';
        }
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'peminjaman_baru',
            title,
            message: `Peminjaman ${pengajuan.jumlah} unit HT - Status: ${pengajuan.trackingStatus || pengajuan.status}`,
            link,
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
        const link = '/satker-admin/personil'; // Link ke halaman personil satker
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'mutasi_baru',
            title,
            message: `Mutasi ${mutasi.personil.nama} ke ${mutasi.satkerTujuan.nama} - Status: ${mutasi.status}`,
            link,
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
        const link = '/satker-admin/riwayat-peminjaman'; // Link ke riwayat peminjaman
        
        await prisma.notification.create({
          data: {
            userId,
            type: 'pengembalian_baru',
            title,
            message: `${jumlahHT} unit HT - Status: ${pengembalian.status}${pengembalian.catatanAdmin ? ` - ${pengembalian.catatanAdmin}` : ''}`,
            link,
            relatedId: notifKey,
            priority,
            createdAt: pengembalian.updatedAt
          }
        });
      }
    }

    // 4. Keterlambatan Paket Peminjaman Satker
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cari paket yang terlambat (tanggalReturn atau tanggalSelesai sudah lewat)
    const overdueLoanPackages = await prisma.pengajuanPeminjaman.findMany({
      where: {
        satkerId,
        trackingStatus: {
          in: ['SEDANG_DIGUNAKAN', 'PERMINTAAN_PENGEMBALIAN']
        },
        status: 'APPROVED',
        OR: [
          {
            tanggalReturn: {
              lt: today,
            }
          },
          {
            tanggalReturn: null,
            tanggalSelesai: {
              lt: today,
            }
          }
        ]
      },
      orderBy: {
        tanggalReturn: 'asc',
      },
    });

    for (const loanPackage of overdueLoanPackages) {
      // Gunakan tanggalReturn atau tanggalSelesai untuk hitung keterlambatan
      const returnDate = loanPackage.tanggalReturn || loanPackage.tanggalSelesai;
      if (!returnDate) continue;

      const daysOverdue = Math.floor(
        (today.getTime() - new Date(returnDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: userId,
          type: 'keterlambatan_paket_peminjaman',
          relatedId: loanPackage.id,
          createdAt: {
            gte: todayStart,
          },
        },
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'keterlambatan_paket_peminjaman',
            title: '⚠️ Paket HT Terlambat Dikembalikan',
            message: `Paket peminjaman ${loanPackage.jumlah} unit HT terlambat ${daysOverdue} hari. Segera ajukan pengembalian!`,
            link: '/satker-admin/peminjaman',
            relatedId: loanPackage.id,
            priority: 'high',
          },
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
    link: n.link || '/satker-admin',
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
