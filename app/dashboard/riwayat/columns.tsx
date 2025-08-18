// app/dashboard/riwayat/columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { PeminjamanSatker, HT, Satker } from '@prisma/client';

// Tipe data gabungan untuk menampilkan semua detail yang relevan
export type RiwayatPeminjamanSatker = PeminjamanSatker & {
  ht: HT;
  satker: Satker;
};

export const columns: ColumnDef<RiwayatPeminjamanSatker>[] = [
  {
    accessorKey: 'ht.serialNumber',
    header: 'Serial Number',
  },
  {
    accessorKey: 'ht.merk',
    header: 'Merk HT',
  },
  {
    accessorKey: 'satker.nama',
    header: 'Dipinjam oleh Satker',
  },
  {
    accessorKey: 'tanggalPinjam',
    header: 'Tanggal Peminjaman',
    cell: ({ row }) => {
      const date = new Date(row.getValue('tanggalPinjam'));
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  {
    accessorKey: 'tanggalKembali',
    header: 'Tanggal Pengembalian',
    cell: ({ row }) => {
      const tglKembali = row.getValue('tanggalKembali') as Date | null;
      return tglKembali
        ? new Date(tglKembali).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '-';
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isDikembalikan = !!row.original.tanggalKembali;
      return isDikembalikan ? (
        <Badge variant="default">Sudah Kembali</Badge>
      ) : (
        <Badge variant="destructive">Sedang Dipinjam</Badge>
      );
    },
  },
];
