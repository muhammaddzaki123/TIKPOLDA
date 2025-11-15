// app/api/export/riwayat-mutasi/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportRiwayatMutasiToExcel } from '@/app/dashboard/riwayat-mutasi/actions';

export async function GET() {
  try {
    // Cek autentikasi
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Export data ke Excel
    const result = await exportRiwayatMutasiToExcel();

    if (!result.success) {
      return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }

    // Return file sebagai response
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in export riwayat mutasi API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
