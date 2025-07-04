'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Tipe data sederhana untuk tabel ini
export type InventarisHT = {
  id: string;
  kodeHT: string;
  merk: string;
  pemegang: string; // Nama pemegang
  nrp: string; // NRP pemegang
  status: 'Digunakan' | 'Di Gudang';
};

export const columns: ColumnDef<InventarisHT>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  { accessorKey: 'pemegang', header: 'Pemegang Saat Ini' },
  { accessorKey: 'nrp', header: 'NRP Pemegang' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'Digunakan' ? 'default' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
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
            <DropdownMenuItem>Edit Pemegang HT</DropdownMenuItem>
            <DropdownMenuItem>Ajukan Peminjaman Baru</DropdownMenuItem>
            <DropdownMenuItem>Lihat Riwayat HT</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Edit Data Aset</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];