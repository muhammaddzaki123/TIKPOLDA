// app/api/notifications/overdue/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const satkerId = session?.user?.satkerId;

    if (!satkerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua peminjaman aktif di satker ini yang melewati estimasi kembali
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueLoans = await prisma.peminjaman.findMany({
      where: {
        ht: { satkerId },
        tanggalKembali: null,
        estimasiKembali: {
          lt: today, // Kurang dari hari ini
        },
      },
      include: {
        ht: true,
        personil: true,
      },
      orderBy: {
        estimasiKembali: 'asc',
      },
    });

    return NextResponse.json({
      count: overdueLoans.length,
      overdueLoans: overdueLoans.map((loan) => ({
        id: loan.id,
        htSerialNumber: loan.ht.serialNumber,
        personilNama: loan.personil.nama,
        personilNrp: loan.personil.nrp,
        tanggalPinjam: loan.tanggalPinjam,
        estimasiKembali: loan.estimasiKembali,
        daysOverdue: Math.floor(
          (today.getTime() - new Date(loan.estimasiKembali!).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error('Error fetching overdue loans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
