// app/dashboard/riwayat/columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Peminjaman, HT, Personil, Satker } from '@prisma/client';

// Tipe data gabungan yang kompleks untuk menampilkan semua detail
export type PeminjamanWithDetails = Peminjaman & {
  ht: HT;
  personil: Personil & {
    satker: Satker;
  };
};

export const columns: ColumnDef<PeminjamanWithDetails>[] = [
  {
    accessorKey: 'ht.kodeHT',
    header: 'Kode HT',
  },
  {
    accessorKey: 'personil.nama',
    header: 'Nama Peminjam',
  },
  {
    accessorKey: 'personil.nrp',
    header: 'NRP Peminjam',
  },
  {
    accessorKey: 'personil.satker.nama',
    header: 'Satuan Kerja',
  },
  {
    accessorKey: 'tanggalPinjam',
    header: 'Tgl. Pinjam',
    cell: ({ row }) => new Date(row.getValue('tanggalPinjam')).toLocaleDateString('id-ID'),
  },
  {
    accessorKey: 'tanggalKembali',
    header: 'Tgl. Kembali',
    cell: ({ row }) => {
      const tglKembali = row.getValue('tanggalKembali') as Date | null;
      return tglKembali ? new Date(tglKembali).toLocaleDateString('id-ID') : '-';
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isDikembalikan = !!row.original.tanggalKembali;
      return isDikembalikan ? (
        <Badge variant="default">Dikembalikan</Badge>
      ) : (
        <Badge variant="destructive">Masih Dipinjam</Badge>
      );
    },
  },
];
