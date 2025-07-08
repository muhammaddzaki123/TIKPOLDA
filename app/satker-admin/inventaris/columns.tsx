'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { HT, Personil } from '@prisma/client';

// Tipe data kustom yang akan kita gunakan untuk menampilkan data di tabel.
// Ini akan dibuat di dalam file page.tsx.
export type InventarisDisplay = HT & {
  pemegangSaatIni: Personil | null;
};

export const columns: ColumnDef<InventarisDisplay>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  {
    accessorKey: 'pemegangSaatIni',
    header: 'Pemegang Saat Ini',
    cell: ({ row }) => {
      // Akses nama dari data relasi yang sudah kita siapkan
      const pemegang = row.original.pemegangSaatIni;
      return pemegang ? pemegang.nama : <span className="text-slate-400">-</span>;
    },
  },
  {
    header: 'NRP Pemegang',
    cell: ({ row }) => {
      // Akses NRP dari data relasi
      const pemegang = row.original.pemegangSaatIni;
      return pemegang ? pemegang.nrp : '-';
    },
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
            <DropdownMenuItem>Lihat Riwayat HT</DropdownMenuItem>
            <DropdownMenuItem>Laporkan Kerusakan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];