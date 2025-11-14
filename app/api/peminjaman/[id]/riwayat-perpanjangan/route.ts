// app/api/peminjaman/[id]/riwayat-perpanjangan/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const satkerId = session?.user?.satkerId;

    if (!satkerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const peminjamanId = params.id;

    // Ambil riwayat perpanjangan
    const riwayat = await prisma.riwayatPerpanjangan.findMany({
      where: {
        peminjamanId: peminjamanId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      riwayat,
    });
  } catch (error) {
    console.error('Error fetching riwayat perpanjangan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
