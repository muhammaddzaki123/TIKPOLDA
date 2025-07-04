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
import { Satker } from '@/data/mock-satker-data';

export const columns: ColumnDef<Satker>[] = [
  {
    accessorKey: 'kode',
    header: 'Kode Satker',
  },
  {
    accessorKey: 'nama',
    header: 'Nama Satuan Kerja',
  },
  {
    accessorKey: 'jumlahPersonil',
    header: 'Jumlah Personil',
  },
  {
    accessorKey: 'jumlahHT',
    header: 'Jumlah HT',
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
            <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
            <DropdownMenuItem>Edit Satker</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Hapus Satker</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];