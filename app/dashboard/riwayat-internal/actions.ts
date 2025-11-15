// app/dashboard/riwayat-internal/actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function exportRiwayatInternalToExcel() {
  try {
    // Ambil semua data peminjaman internal (Satker ke Personil)
    const data = await prisma.peminjaman.findMany({
      include: {
        ht: true,
        personil: {
          include: {
            satker: true,
          },
        },
      },
      orderBy: {
        tanggalPinjam: 'desc',
      },
    });

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Internal');

    // Set properties workbook
    workbook.creator = 'Sistem Logistik POLDA NTB';
    workbook.lastModifiedBy = 'Sistem Logistik POLDA NTB';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Header kolom
    const headers = [
      'No',
      'Serial Number HT',
      'Merk HT',
      'Jenis HT',
      'Nama Peminjam',
      'NRP Peminjam',
      'Pangkat Peminjam',
      'Satker Peminjam',
      'Tanggal Pinjam',
      'Tanggal Kembali',
      'Status Peminjaman',
      'Durasi (Hari)'
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
      { width: 20 },  // Serial Number
      { width: 15 },  // Merk
      { width: 15 },  // Jenis
      { width: 25 },  // Nama Peminjam
      { width: 15 },  // NRP
      { width: 15 },  // Pangkat
      { width: 25 },  // Satker
      { width: 18 },  // Tanggal Pinjam
      { width: 18 },  // Tanggal Kembali
      { width: 18 },  // Status
      { width: 12 }   // Durasi
    ];

    // Tambahkan data
    data.forEach((peminjaman, index) => {
      const tanggalPinjam = new Date(peminjaman.tanggalPinjam);
      const tanggalKembali = peminjaman.tanggalKembali ? new Date(peminjaman.tanggalKembali) : null;
      
      // Hitung durasi
      let durasi = '-';
      if (tanggalKembali) {
        const diffTime = Math.abs(tanggalKembali.getTime() - tanggalPinjam.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        durasi = `${diffDays} hari`;
      } else {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - tanggalPinjam.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        durasi = `${diffDays} hari (Berlangsung)`;
      }

      const row = [
        index + 1,
        peminjaman.ht.serialNumber,
        peminjaman.ht.merk,
        peminjaman.ht.jenis,
        peminjaman.personil.nama,
        peminjaman.personil.nrp,
        peminjaman.personil.pangkat,
        peminjaman.personil.satker.nama,
        tanggalPinjam.toLocaleDateString('id-ID'),
        tanggalKembali ? tanggalKembali.toLocaleDateString('id-ID') : 'Belum Dikembalikan',
        peminjaman.tanggalKembali ? 'Selesai' : 'Berlangsung',
        durasi
      ];

      const addedRow = worksheet.addRow(row);
      
      // Style berdasarkan status
      if (!peminjaman.tanggalKembali) {
        addedRow.getCell(11).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2CC' } // Kuning muda untuk berlangsung
        };
        addedRow.getCell(11).font = { color: { argb: '9C6500' } }; // Kuning tua
      } else {
        addedRow.getCell(11).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' } // Hijau muda untuk selesai
        };
        addedRow.getCell(11).font = { color: { argb: '006100' } }; // Hijau tua
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
    
    const totalPeminjaman = data.length;
    const peminjamanBerlangsung = data.filter(p => !p.tanggalKembali).length;
    const peminjamanSelesai = data.filter(p => p.tanggalKembali).length;

    worksheet.getCell(`A${lastRow + 1}`).value = `Total Peminjaman: ${totalPeminjaman}`;
    worksheet.getCell(`A${lastRow + 2}`).value = `Peminjaman Berlangsung: ${peminjamanBerlangsung}`;
    worksheet.getCell(`A${lastRow + 3}`).value = `Peminjaman Selesai: ${peminjamanSelesai}`;
    worksheet.getCell(`A${lastRow + 4}`).value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      success: true,
      buffer: Buffer.from(buffer),
      filename: `riwayat-internal-${new Date().toISOString().split('T')[0]}.xlsx`
    };

  } catch (error) {
    console.error('Error exporting riwayat internal to Excel:', error);
    throw new Error('Gagal mengexport data riwayat internal ke Excel');
  }
}
