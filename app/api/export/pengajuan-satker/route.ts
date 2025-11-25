// app/api/export/pengajuan-satker/route.ts

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

    // Ambil data pengajuan (peminjaman, mutasi, pengembalian)
    const [pengajuanPeminjaman, pengajuanMutasi, pengajuanPengembalian] = await Promise.all([
      prisma.pengajuanPeminjaman.findMany({
        where: { satkerId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pengajuanMutasi.findMany({
        where: { satkerAsalId: satkerId },
        include: {
          personil: true,
          satkerTujuan: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pengajuanPengembalian.findMany({
        where: { satkerId },
        include: {
          pengembalianDetails: {
            include: { ht: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook();

    // === Sheet 1: Pengajuan Peminjaman ===
    const wsPeminjaman = workbook.addWorksheet('Pengajuan Peminjaman');
    wsPeminjaman.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'ID Pengajuan', key: 'id', width: 12 },
      { header: 'Keperluan', key: 'keperluan', width: 30 },
      { header: 'Jumlah HT', key: 'jumlah', width: 12 },
      { header: 'Tanggal Mulai', key: 'tanggalMulai', width: 18 },
      { header: 'Tanggal Selesai', key: 'tanggalSelesai', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tanggal Pengajuan', key: 'createdAt', width: 18 },
      { header: 'Catatan Admin', key: 'catatanAdmin', width: 30 },
    ];

    // Style header
    wsPeminjaman.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsPeminjaman.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    wsPeminjaman.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    wsPeminjaman.getRow(1).height = 25;

    // Populate data peminjaman
    pengajuanPeminjaman.forEach((item, index) => {
      const row = wsPeminjaman.addRow({
        no: index + 1,
        id: item.id.substring(0, 8),
        keperluan: item.keperluan,
        jumlah: item.jumlah,
        tanggalMulai: item.tanggalMulai ? format(new Date(item.tanggalMulai), 'dd MMM yyyy', { locale: id }) : '-',
        tanggalSelesai: item.tanggalSelesai ? format(new Date(item.tanggalSelesai), 'dd MMM yyyy', { locale: id }) : '-',
        status: item.status,
        createdAt: format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: id }),
        catatanAdmin: item.catatanAdmin || '-',
      });

      // Color code status
      const statusCell = row.getCell('status');
      if (item.status === 'APPROVED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (item.status === 'REJECTED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    // === Sheet 2: Pengajuan Mutasi ===
    const wsMutasi = workbook.addWorksheet('Pengajuan Mutasi');
    wsMutasi.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'ID Pengajuan', key: 'id', width: 12 },
      { header: 'Nama Personil', key: 'nama', width: 25 },
      { header: 'NRP', key: 'nrp', width: 15 },
      { header: 'Satker Tujuan', key: 'satkerTujuan', width: 25 },
      { header: 'Alasan', key: 'alasan', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tanggal Pengajuan', key: 'createdAt', width: 18 },
      { header: 'Catatan Admin', key: 'catatanAdmin', width: 30 },
    ];

    wsMutasi.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsMutasi.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' }
    };
    wsMutasi.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    wsMutasi.getRow(1).height = 25;

    pengajuanMutasi.forEach((item, index) => {
      const row = wsMutasi.addRow({
        no: index + 1,
        id: item.id.substring(0, 8),
        nama: item.personil.nama,
        nrp: item.personil.nrp,
        satkerTujuan: item.satkerTujuan.nama,
        alasan: item.alasan,
        status: item.status,
        createdAt: format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: id }),
        catatanAdmin: item.catatanAdmin || '-',
      });

      const statusCell = row.getCell('status');
      if (item.status === 'APPROVED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (item.status === 'REJECTED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    // === Sheet 3: Pengajuan Pengembalian ===
    const wsPengembalian = workbook.addWorksheet('Pengajuan Pengembalian');
    wsPengembalian.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'ID Pengajuan', key: 'id', width: 12 },
      { header: 'Alasan', key: 'alasan', width: 30 },
      { header: 'Jumlah HT', key: 'jumlah', width: 12 },
      { header: 'Detail HT', key: 'detailHT', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tanggal Pengajuan', key: 'createdAt', width: 18 },
      { header: 'Catatan Admin', key: 'catatanAdmin', width: 30 },
    ];

    wsPengembalian.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsPengembalian.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF06B6D4' }
    };
    wsPengembalian.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    wsPengembalian.getRow(1).height = 25;

    pengajuanPengembalian.forEach((item, index) => {
      const detailHT = item.pengembalianDetails
        .map(d => `${d.ht.serialNumber} (${d.ht.merk})`)
        .join(', ');

      const row = wsPengembalian.addRow({
        no: index + 1,
        id: item.id.substring(0, 8),
        alasan: item.alasan,
        jumlah: item.pengembalianDetails.length,
        detailHT: detailHT || '-',
        status: item.status,
        createdAt: format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: id }),
        catatanAdmin: item.catatanAdmin || '-',
      });

      const statusCell = row.getCell('status');
      if (item.status === 'APPROVED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (item.status === 'REJECTED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    // Apply borders and zebra striping to all sheets
    [wsPeminjaman, wsMutasi, wsPengembalian].forEach(ws => {
      ws.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { vertical: 'middle', horizontal: 'left' };
          row.height = 20;
          
          if (rowNumber % 2 === 0) {
            row.eachCell((cell) => {
              if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor) {
                // Skip cells with existing fill (status cells)
                return;
              }
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF3F4F6' }
              };
            });
          }
        }
        
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };
        });
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers
    const filename = `pengajuan-satker-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
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
