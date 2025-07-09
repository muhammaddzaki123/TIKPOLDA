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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { HT, Satker } from '@prisma/client'; // Import tipe data dari Prisma

// Tipe data gabungan untuk tabel
export type HTWithSatker = HT & {
  satker: Satker;
};

export const columns: ColumnDef<HTWithSatker>[] = [
  {
    accessorKey: 'kodeHT',
    header: 'Kode HT',
  },
  {
    accessorKey: 'serialNumber',
    header: 'Serial Number',
  },
  {
    accessorKey: 'merk',
    header: 'Merk',
  },
  {
    accessorKey: 'satker.nama', // <-- Ambil nama dari relasi
    header: 'Satuan Kerja',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      
      let variant: "default" | "secondary" | "destructive" | "outline" = 'outline';
      if (status === 'DIPINJAM') variant = 'default';
      else if (status === 'TERSEDIA') variant = 'secondary';
      else if (status === 'RUSAK') variant = 'destructive';

      return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ht = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
            <DropdownMenuItem>Edit Data</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];