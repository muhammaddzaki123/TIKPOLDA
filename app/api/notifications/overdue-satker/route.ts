// app/api/notifications/overdue-satker/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    const satkerId = session?.user?.satkerId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Query untuk mencari paket peminjaman yang terlambat dikembalikan
    const whereCondition: Prisma.PengajuanPeminjamanWhereInput = {
      trackingStatus: {
        in: ['SEDANG_DIGUNAKAN', 'PERMINTAAN_PENGEMBALIAN']
      },
      tanggalReturn: {
        lt: today, // Tanggal return sudah lewat
      },
      status: 'APPROVED',
    };

    // Jika Satker Admin, hanya tampilkan untuk satker sendiri
    if (userRole === 'ADMIN_SATKER' && satkerId) {
      whereCondition.satkerId = satkerId;
    }

    const overdueLoanPackages = await prisma.pengajuanPeminjaman.findMany({
      where: whereCondition,
      include: {
        satkerPengaju: true,
      },
      orderBy: {
        tanggalReturn: 'asc',
      },
    });

    // Buat notifikasi untuk setiap paket yang terlambat (jika belum ada notifikasi untuk hari ini)
    for (const loanPackage of overdueLoanPackages) {
      const daysOverdue = Math.floor(
        (today.getTime() - new Date(loanPackage.tanggalReturn!).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Cek apakah sudah ada notifikasi untuk paket peminjaman ini hari ini
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // Buat notifikasi untuk admin yang sesuai
      const targetUserIds: string[] = [];
      
      if (userRole === 'SUPER_ADMIN') {
        // Untuk Super Admin, buat notifikasi untuk dirinya sendiri
        targetUserIds.push(userId);
      } else if (userRole === 'ADMIN_SATKER' && satkerId) {
        // Untuk Satker Admin, buat notifikasi untuk dirinya sendiri
        targetUserIds.push(userId);
      }

      for (const targetUserId of targetUserIds) {
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: targetUserId,
            type: 'keterlambatan_paket_peminjaman',
            relatedId: loanPackage.id,
            createdAt: {
              gte: todayStart,
            },
          },
        });

        // Jika belum ada notifikasi hari ini, buat yang baru
        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              userId: targetUserId,
              type: 'keterlambatan_paket_peminjaman',
              title: '⚠️ Paket HT Terlambat Dikembalikan',
              message: `Paket peminjaman ${loanPackage.jumlah} unit HT oleh ${loanPackage.satkerPengaju.nama} terlambat ${daysOverdue} hari. Segera hubungi satker!`,
              relatedId: loanPackage.id,
              satkerName: loanPackage.satkerPengaju.nama,
              priority: 'high',
            },
          });
        }
      }
    }

    return NextResponse.json({
      count: overdueLoanPackages.length,
      overdueLoanPackages: overdueLoanPackages.map((loan) => ({
        id: loan.id,
        satkerNama: loan.satkerPengaju.nama,
        keperluan: loan.keperluan,
        jumlahHT: loan.jumlah,
        tanggalMulai: loan.tanggalMulai,
        tanggalSelesai: loan.tanggalSelesai,
        tanggalReturn: loan.tanggalReturn,
        trackingStatus: loan.trackingStatus,
        daysOverdue: Math.floor(
          (today.getTime() - new Date(loan.tanggalReturn!).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error('Error fetching overdue loan packages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
