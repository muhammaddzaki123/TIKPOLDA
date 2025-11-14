// app/api/peminjaman/[id]/count-perpanjangan/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const satkerId = session?.user?.satkerId;

    if (!satkerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const peminjamanId = params.id;

    // Hitung jumlah perpanjangan
    const count = await prisma.riwayatPerpanjangan.count({
      where: {
        peminjamanId: peminjamanId,
      },
    });

    return NextResponse.json({
      count,
    });
  } catch (error) {
    console.error('Error counting perpanjangan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
