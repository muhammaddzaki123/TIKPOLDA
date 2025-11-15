// app/dashboard/riwayat-mutasi/actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function exportRiwayatMutasiToExcel() {
  try {
    // Ambil data riwayat mutasi yang sudah diproses (APPROVED atau REJECTED)
    const data = await prisma.pengajuanMutasi.findMany({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] },
      },
      include: {
        personil: true,
        satkerAsal: true,
        satkerTujuan: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Mutasi');

    // Set properties workbook
    workbook.creator = 'Sistem Logistik POLDA NTB';
    workbook.lastModifiedBy = 'Sistem Logistik POLDA NTB';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Header kolom
    const headers = [
      'No',
      'Nama Personil',
      'NRP',
      'Pangkat',
      'Satker Asal',
      'Satker Tujuan',
      'Alasan Mutasi',
      'Tanggal Pengajuan',
      'Tanggal Diproses',
      'Status',
      'Catatan Admin'
    ];

    // Tambahkan header ke worksheet
    worksheet.addRow(headers);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Set lebar kolom
    worksheet.columns = [
      { width: 5 },   // No
      { width: 25 },  // Nama Personil
      { width: 15 },  // NRP
      { width: 15 },  // Pangkat
      { width: 25 },  // Satker Asal
      { width: 25 },  // Satker Tujuan
      { width: 40 },  // Alasan
      { width: 18 },  // Tanggal Pengajuan
      { width: 18 },  // Tanggal Diproses
      { width: 15 },  // Status
      { width: 30 }   // Catatan Admin
    ];

    // Tambahkan data
    data.forEach((mutasi, index) => {
      const row = [
        index + 1,
        mutasi.personil.nama,
        mutasi.personil.nrp,
        mutasi.personil.pangkat,
        mutasi.satkerAsal.nama,
        mutasi.satkerTujuan.nama,
        mutasi.alasan,
        mutasi.createdAt.toLocaleDateString('id-ID'),
        mutasi.updatedAt.toLocaleDateString('id-ID'),
        mutasi.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
        mutasi.catatanAdmin || '-'
      ];

      const addedRow = worksheet.addRow(row);
      
      // Style berdasarkan status
      if (mutasi.status === 'APPROVED') {
        addedRow.getCell(10).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' } // Hijau muda
        };
        addedRow.getCell(10).font = { color: { argb: '006100' } }; // Hijau tua
      } else if (mutasi.status === 'REJECTED') {
        addedRow.getCell(10).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC7CE' } // Merah muda
        };
        addedRow.getCell(10).font = { color: { argb: '9C0006' } }; // Merah tua
      }

      // Alignment untuk semua cell
      addedRow.alignment = { vertical: 'middle', wrapText: true };
    });

    // Tambahkan border ke semua cell
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Tambahkan informasi summary
    const lastRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${lastRow}`).value = 'RINGKASAN DATA:';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const totalMutasi = data.length;
    const mutasiApproved = data.filter(m => m.status === 'APPROVED').length;
    const mutasiRejected = data.filter(m => m.status === 'REJECTED').length;

    // Hitung satker yang paling banyak menerima mutasi
    const satkerTujuanCount = data
      .filter(m => m.status === 'APPROVED')
      .reduce((acc, m) => {
        acc[m.satkerTujuan.nama] = (acc[m.satkerTujuan.nama] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topSatkerTujuan = Object.entries(satkerTujuanCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    worksheet.getCell(`A${lastRow + 1}`).value = `Total Pengajuan Mutasi: ${totalMutasi}`;
    worksheet.getCell(`A${lastRow + 2}`).value = `Mutasi Disetujui: ${mutasiApproved}`;
    worksheet.getCell(`A${lastRow + 3}`).value = `Mutasi Ditolak: ${mutasiRejected}`;
    
    if (topSatkerTujuan.length > 0) {
      worksheet.getCell(`A${lastRow + 4}`).value = 'Satker Terbanyak Menerima Mutasi:';
      topSatkerTujuan.forEach(([satker, count], i) => {
        worksheet.getCell(`A${lastRow + 5 + i}`).value = `  ${i + 1}. ${satker}: ${count} personil`;
      });
    }
    
    worksheet.getCell(`A${lastRow + 5 + topSatkerTujuan.length}`).value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      success: true,
      buffer: Buffer.from(buffer),
      filename: `riwayat-mutasi-${new Date().toISOString().split('T')[0]}.xlsx`
    };

  } catch (error) {
    console.error('Error exporting riwayat mutasi to Excel:', error);
    throw new Error('Gagal mengexport data riwayat mutasi ke Excel');
  }
}
