// app/dashboard/riwayat/actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function exportRiwayatToExcel() {
  try {
    // Ambil data riwayat peminjaman yang sudah diproses (APPROVED atau REJECTED)
    const allPeminjaman = await prisma.pengajuanPeminjaman.findMany({
      where: {
        status: {
          in: ['APPROVED', 'REJECTED'],
        },
      },
      include: {
        satkerPengaju: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Ambil data HT yang dipinjamkan untuk setiap pengajuan yang disetujui
    const allPeminjamanSatker = await prisma.peminjamanSatker.findMany({
      where: {
        satkerId: {
          in: allPeminjaman.filter(p => p.status === 'APPROVED').map(p => p.satkerId)
        }
      },
      include: {
        ht: true,
      },
    });

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Peminjaman');

    // Set properties workbook
    workbook.creator = 'Sistem Logistik POLDA NTB';
    workbook.lastModifiedBy = 'Sistem Logistik POLDA NTB';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Header kolom
    const headers = [
      'No',
      'Satker Peminjam',
      'Keperluan',
      'Jumlah HT Dipinjam',
      'Tanggal Pengajuan',
      'Tanggal Diproses',
      'Status',
      'Catatan Admin',
      'Dokumen'
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
      { width: 25 },  // Satker Peminjam
      { width: 40 },  // Keperluan
      { width: 18 },  // Jumlah HT
      { width: 18 },  // Tanggal Pengajuan
      { width: 18 },  // Tanggal Diproses
      { width: 15 },  // Status
      { width: 30 },  // Catatan Admin
      { width: 15 }   // Dokumen
    ];

    // Tambahkan data
    allPeminjaman.forEach((pengajuan, index) => {
      // Hitung jumlah HT yang dipinjamkan untuk pengajuan ini
      const htsForThisRequest = pengajuan.status === 'APPROVED' 
        ? allPeminjamanSatker.filter(p => p.catatan?.includes(pengajuan.id.substring(0, 8)))
        : [];

      const row = [
        index + 1,
        pengajuan.satkerPengaju.nama,
        pengajuan.keperluan,
        pengajuan.status === 'APPROVED' ? htsForThisRequest.length : 0,
        pengajuan.createdAt.toLocaleDateString('id-ID'),
        pengajuan.updatedAt.toLocaleDateString('id-ID'),
        pengajuan.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
        pengajuan.catatanAdmin || '-',
        pengajuan.fileUrl ? 'Ada' : 'Tidak Ada'
      ];

      const addedRow = worksheet.addRow(row);
      
      // Style berdasarkan status
      if (pengajuan.status === 'APPROVED') {
        addedRow.getCell(7).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' } // Hijau muda
        };
        addedRow.getCell(7).font = { color: { argb: '006100' } }; // Hijau tua
      } else if (pengajuan.status === 'REJECTED') {
        addedRow.getCell(7).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC7CE' } // Merah muda
        };
        addedRow.getCell(7).font = { color: { argb: '9C0006' } }; // Merah tua
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

    // Tambahkan sheet kedua untuk detail HT yang dipinjamkan
    const worksheetDetail = workbook.addWorksheet('Detail HT Dipinjamkan');
    
    const headersDetail = [
      'No',
      'Satker Peminjam',
      'Keperluan',
      'Serial Number',
      'Merk HT',
      'Jenis HT',
      'Tanggal Peminjaman'
    ];

    worksheetDetail.addRow(headersDetail);

    // Style header untuk sheet detail
    const headerRowDetail = worksheetDetail.getRow(1);
    headerRowDetail.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRowDetail.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };
    headerRowDetail.alignment = { horizontal: 'center', vertical: 'middle' };

    // Set lebar kolom untuk detail
    worksheetDetail.columns = [
      { width: 5 },   // No
      { width: 25 },  // Satker Peminjam
      { width: 30 },  // Keperluan
      { width: 20 },  // Serial Number
      { width: 15 },  // Merk
      { width: 15 },  // Jenis
      { width: 18 }   // Tanggal Peminjaman
    ];

    // Tambahkan detail HT yang dipinjamkan
    let detailIndex = 0;
    allPeminjaman.filter(p => p.status === 'APPROVED').forEach((pengajuan) => {
      const htsForThisRequest = allPeminjamanSatker.filter(p => 
        p.catatan?.includes(pengajuan.id.substring(0, 8))
      );

      htsForThisRequest.forEach((peminjaman) => {
        detailIndex++;
        const rowDetail = [
          detailIndex,
          pengajuan.satkerPengaju.nama,
          pengajuan.keperluan,
          peminjaman.ht.serialNumber,
          peminjaman.ht.merk,
          peminjaman.ht.jenis,
          peminjaman.tanggalPinjam.toLocaleDateString('id-ID')
        ];

        const addedRowDetail = worksheetDetail.addRow(rowDetail);
        addedRowDetail.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    // Tambahkan border ke detail sheet
    worksheetDetail.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Tambahkan informasi summary di sheet pertama
    const lastRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${lastRow}`).value = 'RINGKASAN DATA:';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const totalApproved = allPeminjaman.filter(p => p.status === 'APPROVED').length;
    const totalRejected = allPeminjaman.filter(p => p.status === 'REJECTED').length;
    const totalHtDipinjamkan = allPeminjamanSatker.length;

    worksheet.getCell(`A${lastRow + 1}`).value = `Total Pengajuan: ${allPeminjaman.length}`;
    worksheet.getCell(`A${lastRow + 2}`).value = `Pengajuan Disetujui: ${totalApproved}`;
    worksheet.getCell(`A${lastRow + 3}`).value = `Pengajuan Ditolak: ${totalRejected}`;
    worksheet.getCell(`A${lastRow + 4}`).value = `Total HT Dipinjamkan: ${totalHtDipinjamkan}`;
    worksheet.getCell(`A${lastRow + 5}`).value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      success: true,
      buffer: Buffer.from(buffer),
      filename: `riwayat-peminjaman-${new Date().toISOString().split('T')[0]}.xlsx`
    };

  } catch (error) {
    console.error('Error exporting riwayat to Excel:', error);
    throw new Error('Gagal mengexport data riwayat ke Excel');
  }
}
