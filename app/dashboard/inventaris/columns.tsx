// app/dashboard/inventaris/columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { HtDetails } from '@/types/custom';

export const gudangColumns: ColumnDef<HtDetails>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  { accessorKey: 'status', header: 'Kondisi Fisik' },
  {
    id: 'actions',
    cell: ({ row, table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => table.options.meta?.openPinjamkanDialog?.(row.original)}>Pinjamkan ke Satker</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => table.options.meta?.openDeleteDialog?.(row.original)}>Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const terdistribusiColumns: ColumnDef<HtDetails>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  { accessorKey: 'satker.nama', header: 'Penempatan', id: 'satker' },
  {
    id: 'statusPeminjaman',
    header: 'Status Pinjam',
    cell: ({ row }) => row.original.peminjaman.length > 0 ? <Badge variant="destructive">Dipinjam</Badge> : <Badge variant="default">Tersedia</Badge>,
  },
  {
    accessorKey: 'status',
    header: 'Kondisi Fisik',
    cell: ({ row }) => {
        const { status } = row.original;
        let variant: "outline" | "secondary" | "destructive" = "outline";
        if (status.includes('RUSAK')) variant = 'secondary';
        if (status === 'HILANG') variant = 'destructive';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
    }
  },
  {
    id: 'pemegang',
    header: 'Pemegang Akhir',
    cell: ({ row }) => row.original.peminjaman[0]?.personil?.nama || '-',
  },
];