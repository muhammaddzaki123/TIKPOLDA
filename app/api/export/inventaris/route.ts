// app/api/export/inventaris/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { exportInventarisToExcel } from '@/app/dashboard/inventaris/actions';

export async function GET(request: NextRequest) {
  try {
    // Cek autentikasi
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil parameter type dari URL
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'gudang' | 'terdistribusi' | 'all';

    if (!type || !['gudang', 'terdistribusi', 'all'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // Export data ke Excel
    const result = await exportInventarisToExcel(type);

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
    console.error('Error in export API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
