// app/dashboard/inventaris/actions.ts

'use server';

import { PrismaClient, HTStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function addHtBySuperAdmin(formData: FormData) {
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  const satkerIdInput = formData.get('satkerId') as string | null;

  if (!serialNumber || !kodeHT || !merk || !jenis || !tahunBuat || !tahunPeroleh) {
    throw new Error('Semua kolom wajib diisi, kecuali penempatan Satker.');
  }

  const satkerId = satkerIdInput === 'gudang' ? null : satkerIdInput;

  try {
    await prisma.hT.create({
      data: {
        serialNumber,
        kodeHT,
        merk,
        jenis,
        tahunBuat,
        tahunPeroleh,
        satkerId: satkerId,
        status: HTStatus.BAIK,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('serialNumber')) throw new Error('Gagal: Serial Number sudah terdaftar.');
      if (target?.includes('kodeHT')) throw new Error('Gagal: Kode HT sudah terdaftar.');
    }
    console.error('Gagal membuat HT:', error);
    throw new Error('Terjadi kesalahan saat menyimpan data HT.');
  }

  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

export async function pinjamkanHtKeSatker(formData: FormData) {
    const htId = formData.get('htId') as string;
    const satkerId = formData.get('satkerId') as string;
    const catatan = formData.get('catatan') as string | null;

    if (!htId || !satkerId) {
        throw new Error('HT dan Satker Tujuan wajib dipilih.');
    }

    try {
        const existingLoan = await prisma.peminjamanSatker.findFirst({
            where: {
                htId: htId,
                tanggalKembali: null,
            }
        });

        if (existingLoan) {
            throw new Error('Gagal: HT ini sudah tercatat sedang dipinjamkan.');
        }

        await prisma.peminjamanSatker.create({
            data: {
                htId,
                satkerId,
                catatan
            }
        });

    } catch (error: any) {
        if (error instanceof Error) {
            throw error;
        }
        console.error('Gagal meminjamkan HT ke Satker:', error);
        throw new Error('Terjadi kesalahan saat memproses peminjaman.');
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
}

export async function distributeMultipleHtToSatker(htIds: string[], satkerId: string) {
  if (!htIds || htIds.length === 0) {
    throw new Error('Tidak ada HT yang dipilih untuk didistribusikan.');
  }
  if (!satkerId) {
    throw new Error('Satker tujuan wajib dipilih.');
  }

  try {
    const result = await prisma.hT.updateMany({
      where: {
        id: {
          in: htIds,
        },
        satkerId: null,
      },
      data: {
        satkerId: satkerId,
      },
    });

    if (result.count === 0) {
        throw new Error('Tidak ada HT yang berhasil didistribusikan. Mungkin aset sudah dipindahkan.');
    }

    const logEntries = htIds.map(htId => ({
      htId: htId,
      satkerId: satkerId,
      catatan: `Didistribusikan secara massal pada ${new Date().toLocaleString()}`
    }));
    await prisma.peminjamanSatker.createMany({ data: logEntries });


  } catch (error: any) {
    console.error('Gagal mendistribusikan HT massal:', error);
    throw new Error('Terjadi kesalahan pada server saat proses distribusi.');
  }

  // Revalidasi path untuk memperbarui data di UI
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

export async function updateHtBySuperAdmin(formData: FormData) {
  const htId = formData.get('htId') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  const status = formData.get('status') as HTStatus;
  const catatanKondisi = formData.get('catatanKondisi') as string;
  const satkerIdInput = formData.get('satkerId') as string | null;

  if (!htId || !serialNumber || !kodeHT || !merk || !jenis || !tahunBuat || !tahunPeroleh || !status) {
    throw new Error('Semua kolom wajib diisi kecuali catatan kondisi dan penempatan satker.');
  }

  const satkerId = satkerIdInput === 'gudang' ? null : satkerIdInput;

  try {
    // Cek apakah HT sedang dipinjam
    const htWithLoans = await prisma.hT.findUnique({
      where: { id: htId },
      include: {
        peminjaman: { where: { tanggalKembali: null } },
        peminjamanOlehSatker: { where: { tanggalKembali: null } }
      }
    });

    if (!htWithLoans) {
      throw new Error('HT tidak ditemukan.');
    }

    // Jika HT sedang dipinjam, tidak boleh mengubah penempatan satker
    const isCurrentlyLoaned = htWithLoans.peminjaman.length > 0 || htWithLoans.peminjamanOlehSatker.length > 0;
    
    if (isCurrentlyLoaned && htWithLoans.satkerId !== satkerId) {
      throw new Error('Tidak dapat mengubah penempatan HT yang sedang dipinjam.');
    }

    await prisma.hT.update({
      where: { id: htId },
      data: {
        serialNumber,
        kodeHT,
        merk,
        jenis,
        tahunBuat,
        tahunPeroleh,
        status,
        catatanKondisi: catatanKondisi || null,
        satkerId: satkerId,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('serialNumber')) throw new Error('Gagal: Serial Number sudah terdaftar.');
      if (target?.includes('kodeHT')) throw new Error('Gagal: Kode HT sudah terdaftar.');
    }
    if (error instanceof Error) {
      throw error;
    }
    console.error('Gagal mengupdate HT:', error);
    throw new Error('Terjadi kesalahan saat mengupdate data HT.');
  }

  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

export async function deleteHtBySuperAdmin(htId: string) {
  if (!htId) {
    throw new Error('ID HT tidak valid.');
  }

  try {
    // Cek apakah HT sedang dipinjam
    const htWithLoans = await prisma.hT.findUnique({
      where: { id: htId },
      include: {
        peminjaman: { where: { tanggalKembali: null } },
        peminjamanOlehSatker: { where: { tanggalKembali: null } }
      }
    });

    if (!htWithLoans) {
      throw new Error('HT tidak ditemukan.');
    }

    const isCurrentlyLoaned = htWithLoans.peminjaman.length > 0 || htWithLoans.peminjamanOlehSatker.length > 0;
    
    if (isCurrentlyLoaned) {
      throw new Error('Tidak dapat menghapus HT yang sedang dipinjam.');
    }

    await prisma.hT.delete({
      where: { id: htId },
    });
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Gagal menghapus HT:', error);
    throw new Error('Terjadi kesalahan saat menghapus data HT.');
  }

  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

export async function exportInventarisToExcel(type: 'gudang' | 'terdistribusi' | 'all') {
  try {
    // Ambil data HT berdasarkan tipe
    const allHt = await prisma.hT.findMany({
      include: {
        satker: true,
        peminjaman: { 
          where: { tanggalKembali: null }, 
          include: { personil: true } 
        },
        peminjamanOlehSatker: {
          where: { tanggalKembali: null },
          include: { satker: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    let dataToExport = allHt;
    
    if (type === 'gudang') {
      dataToExport = allHt.filter((ht) => !ht.satkerId);
    } else if (type === 'terdistribusi') {
      dataToExport = allHt.filter((ht) => ht.satkerId);
    }

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Inventaris HT');

    // Set properties workbook
    workbook.creator = 'Sistem Logistik POLDA NTB';
    workbook.lastModifiedBy = 'Sistem Logistik POLDA NTB';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Header kolom
    const headers = [
      'No',
      'Kode HT',
      'Serial Number',
      'Merk',
      'Jenis',
      'Tahun Buat',
      'Tahun Peroleh',
      'Status Kondisi',
      'Penempatan',
      'Status Peminjaman',
      'Pemegang/Peminjam',
      'Tanggal Dibuat',
      'Catatan Kondisi'
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
      { width: 15 },  // Kode HT
      { width: 20 },  // Serial Number
      { width: 15 },  // Merk
      { width: 15 },  // Jenis
      { width: 12 },  // Tahun Buat
      { width: 12 },  // Tahun Peroleh
      { width: 15 },  // Status Kondisi
      { width: 25 },  // Penempatan
      { width: 20 },  // Status Peminjaman
      { width: 25 },  // Pemegang/Peminjam
      { width: 18 },  // Tanggal Dibuat
      { width: 30 }   // Catatan Kondisi
    ];

    // Tambahkan data
    dataToExport.forEach((ht, index) => {
      const statusPeminjaman = ht.satkerId 
        ? (ht.peminjaman.length > 0 ? 'Dipinjam Personil' : 'Tersedia di Satker')
        : (ht.peminjamanOlehSatker.length > 0 ? `Dipinjamkan ke ${ht.peminjamanOlehSatker[0].satker.nama}` : 'Tersedia di Gudang');
      
      const pemegang = ht.peminjaman.length > 0 
        ? ht.peminjaman[0].personil.nama
        : ht.peminjamanOlehSatker.length > 0 
          ? ht.peminjamanOlehSatker[0].satker.nama
          : '-';

      const row = [
        index + 1,
        ht.kodeHT,
        ht.serialNumber,
        ht.merk,
        ht.jenis,
        ht.tahunBuat,
        ht.tahunPeroleh,
        ht.status.replace('_', ' '),
        ht.satker?.nama || 'Gudang Pusat',
        statusPeminjaman,
        pemegang,
        ht.createdAt.toLocaleDateString('id-ID'),
        ht.catatanKondisi || '-'
      ];

      const addedRow = worksheet.addRow(row);
      
      // Style berdasarkan status
      if (ht.status === HTStatus.RUSAK_RINGAN || ht.status === HTStatus.RUSAK_BERAT) {
        addedRow.getCell(8).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2CC' }
        };
      } else if (ht.status === HTStatus.HILANG) {
        addedRow.getCell(8).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFCCCB' }
        };
      }

      // Alignment untuk semua cell
      addedRow.alignment = { vertical: 'middle' };
    });

    // Tambahkan border ke semua cell
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Tambahkan informasi summary di bawah
    const lastRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${lastRow}`).value = 'RINGKASAN DATA:';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    worksheet.getCell(`A${lastRow + 1}`).value = `Total HT: ${dataToExport.length}`;
    worksheet.getCell(`A${lastRow + 2}`).value = `HT Baik: ${dataToExport.filter(ht => ht.status === HTStatus.BAIK).length}`;
    worksheet.getCell(`A${lastRow + 3}`).value = `HT Rusak: ${dataToExport.filter(ht => ht.status === HTStatus.RUSAK_RINGAN || ht.status === HTStatus.RUSAK_BERAT).length}`;
    worksheet.getCell(`A${lastRow + 4}`).value = `HT Hilang: ${dataToExport.filter(ht => ht.status === HTStatus.HILANG).length}`;
    worksheet.getCell(`A${lastRow + 5}`).value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      success: true,
      buffer: Buffer.from(buffer),
      filename: `inventaris-ht-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
    };

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Gagal mengexport data ke Excel');
  }
}
