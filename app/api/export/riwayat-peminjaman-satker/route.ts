// app/api/export/riwayat-peminjaman-satker/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.satkerId) {
      return NextResponse.json(
        { error: 'Unauthorized - Satker ID not found' },
        { status: 401 }
      );
    }

    const satkerId = session.user.satkerId;

    // Ambil data riwayat peminjaman
    const riwayatPeminjaman = await prisma.peminjaman.findMany({
      where: {
        personil: {
          satkerId: satkerId
        },
        tanggalKembali: { not: null }
      },
      include: {
        ht: true,
        personil: true,
        riwayatPerpanjangan: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { tanggalKembali: 'desc' }
    });

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Peminjaman');

    // Header styling
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Serial Number', key: 'serialNumber', width: 18 },
      { header: 'Merk', key: 'merk', width: 15 },
      { header: 'Nama Peminjam', key: 'namaPeminjam', width: 25 },
      { header: 'NRP', key: 'nrp', width: 15 },
      { header: 'Pangkat', key: 'pangkat', width: 12 },
      { header: 'Jabatan', key: 'jabatan', width: 20 },
      { header: 'Tanggal Pinjam', key: 'tanggalPinjam', width: 18 },
      { header: 'Tanggal Kembali', key: 'tanggalKembali', width: 18 },
      { header: 'Durasi (Hari)', key: 'durasi', width: 15 },
      { header: 'Jumlah Perpanjangan', key: 'jumlahPerpanjangan', width: 20 },
      { header: 'Catatan', key: 'catatan', width: 30 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Populate data
    riwayatPeminjaman.forEach((item, index) => {
      const tanggalPinjam = item.tanggalPinjam ? new Date(item.tanggalPinjam) : null;
      const tanggalKembali = item.tanggalKembali ? new Date(item.tanggalKembali) : null;
      
      const durasi = tanggalPinjam && tanggalKembali 
        ? Math.ceil((tanggalKembali.getTime() - tanggalPinjam.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      worksheet.addRow({
        no: index + 1,
        serialNumber: item.ht.serialNumber,
        merk: item.ht.merk,
        namaPeminjam: item.personil.nama,
        nrp: item.personil.nrp,
        pangkat: item.personil.pangkat,
        jabatan: item.personil.jabatan,
        tanggalPinjam: tanggalPinjam ? format(tanggalPinjam, 'dd MMM yyyy', { locale: id }) : '-',
        tanggalKembali: tanggalKembali ? format(tanggalKembali, 'dd MMM yyyy', { locale: id }) : '-',
        durasi: durasi > 0 ? `${durasi} hari` : '-',
        jumlahPerpanjangan: item.riwayatPerpanjangan.length,
        catatan: item.catatan || '-',
      });
    });

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.height = 20;
        
        // Zebra striping
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' }
          };
        }
      }
      
      // Border untuk semua cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      });
    });

    // Summary section
    const summaryRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${summaryRow}`).value = 'Total Peminjaman Selesai:';
    worksheet.getCell(`B${summaryRow}`).value = riwayatPeminjaman.length;
    worksheet.getCell(`A${summaryRow}`).font = { bold: true };
    worksheet.getCell(`B${summaryRow}`).font = { bold: true };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers
    const filename = `riwayat-peminjaman-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Gagal mengexport data' },
      { status: 500 }
    );
  }
}
