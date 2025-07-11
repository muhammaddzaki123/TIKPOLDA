'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdminWithSatker } from '@/types/custom'; // <-- Impor dari file terpusat

// Blok "declare module" sudah dihapus dari sini

export const columns: ColumnDef<AdminWithSatker>[] = [
  {
    accessorKey: 'nama',
    header: 'Nama Admin',
  },
  {
    accessorKey: 'satker.nama',
    header: 'Satuan Kerja Dikelola',
    cell: ({ row }) => row.original.satker?.nama || '-',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const user = row.original;
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => table.options.meta?.openResetDialog?.(user)}>
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => table.options.meta?.openDeleteDialog?.(user)}>
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];