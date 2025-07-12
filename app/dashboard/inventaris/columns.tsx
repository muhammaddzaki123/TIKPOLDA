'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { HT, Satker, Peminjaman, Personil, PeminjamanSatker } from '@prisma/client';

// Tipe data gabungan untuk menampilkan semua detail yang diperlukan
export type HtDetails = HT & {
  satker: Satker | null;
  peminjaman: (Peminjaman & { personil: Personil })[];
  peminjamanOlehSatker: PeminjamanSatker[];
};

// Kolom untuk tabel Inventaris Gudang Pusat
export const gudangColumns: ColumnDef<HtDetails>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  { accessorKey: 'jenis', header: 'Jenis' },
  { accessorKey: 'status', header: 'Kondisi Fisik' },
  {
    id: 'actions',
    cell: ({ row, table }) => (
      <Button size="sm" onClick={() => table.options.meta?.openPinjamkanDialog?.(row.original)}>
        Pinjamkan
      </Button>
    ),
  },
];

// Kolom untuk tabel Inventaris Terdistribusi
export const terdistribusiColumns: ColumnDef<HtDetails>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  {
    accessorKey: 'satker.nama',
    header: 'Penempatan',
    cell: ({ row }) => row.original.satker?.nama || '-',
  },
  {
    id: 'statusPeminjaman',
    header: 'Status Pinjam',
    cell: ({ row }) => {
      const isDipinjamPersonil = row.original.peminjaman.length > 0;
      return isDipinjamPersonil ? (
        <Badge variant="destructive">Dipinjam Personil</Badge>
      ) : (
        <Badge variant="default">Tersedia di Satker</Badge>
      );
    },
  },
   {
    accessorKey: 'status',
    header: 'Kondisi Fisik',
    cell: ({ row }) => {
        const status = row.original.status;
        let variant: "outline" | "secondary" | "destructive" = "outline";
        if (status === 'RUSAK_RINGAN' || status === 'RUSAK_BERAT') variant = 'secondary';
        if (status === 'HILANG') variant = 'destructive';
        
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>
    }
  },
  {
    id: 'pemegang',
    header: 'Pemegang Akhir',
    cell: ({ row }) => row.original.peminjaman[0]?.personil?.nama || '-',
  },
];
