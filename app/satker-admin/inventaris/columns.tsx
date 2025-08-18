// app/satker-admin/inventaris/columns.tsx

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
import { HtWithPeminjaman } from '@/types/custom';

export const columns: ColumnDef<HtWithPeminjaman>[] = [
  {
    accessorKey: 'serialNumber',
    header: 'Serial Number',
  },
  {
    accessorKey: 'merk',
    header: 'Merk',
  },
  {
    id: 'statusPeminjaman',
    header: 'Status',
    cell: ({ row }) => {
      const isDipinjam = row.original.peminjaman.length > 0;
      return isDipinjam ? (
        <Badge variant="destructive">Dipinjam</Badge>
      ) : (
        <Badge variant="default">Tersedia</Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Kondisi Fisik',
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: 'outline' | 'secondary' | 'destructive' = 'outline';
      if (status === 'RUSAK_RINGAN' || status === 'RUSAK_BERAT') variant = 'secondary';
      if (status === 'HILANG') variant = 'destructive';
      return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
    },
  },
  {
    id: 'pemegang',
    header: 'Pemegang Saat Ini',
    cell: ({ row }) => {
      const pemegang = row.original.peminjaman[0]?.personil;
      return pemegang ? pemegang.nama : '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const ht = row.original;
      const isDipinjam = ht.peminjaman.length > 0;

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
            <DropdownMenuItem onClick={() => table.options.meta?.openUpdateStatusDialog?.(ht)}>
              Update Kondisi Fisik
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isDipinjam} // Tidak bisa hapus jika sedang dipinjam
              className="text-red-600 focus:text-red-600"
              onClick={() => !isDipinjam && table.options.meta?.openDeleteHtDialog?.(ht)}
            >
              Hapus HT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
