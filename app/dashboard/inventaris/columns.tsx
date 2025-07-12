// app/dashboard/inventaris/columns.tsx

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

export type HtDetails = HT & {
  satker: Satker | null;
  peminjaman: (Peminjaman & { personil: Personil })[];
  peminjamanOlehSatker: PeminjamanSatker[];
};

// Definisikan tipe meta untuk tabel inventaris
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    openPinjamkanDialog?: (ht: TData) => void;
    openDeleteDialog?: (ht: TData) => void;
  }
}

// Kolom untuk tabel Inventaris Gudang Pusat
export const gudangColumns: ColumnDef<HtDetails>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  { accessorKey: 'jenis', header: 'Jenis' },
  { accessorKey: 'status', header: 'Kondisi Fisik' },
  {
    id: 'actions',
    cell: ({ row, table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => table.options.meta?.openPinjamkanDialog?.(row.original)}>
            Pinjamkan ke Satker
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => table.options.meta?.openDeleteDialog?.(row.original)}>
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// Kolom untuk tabel Inventaris Terdistribusi
export const terdistribusiColumns: ColumnDef<HtDetails>[] = [
  // ... (tidak ada perubahan di sini)
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  {
    accessorKey: 'satker.nama',
    header: 'Penempatan',
    filterFn: (row, id, value) => { // Fungsi custom untuk filter berdasarkan relasi
      return value.includes(row.original.satker?.id);
    },
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

