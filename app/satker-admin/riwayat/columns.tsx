'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Peminjaman } from '@/data/mock-history-data';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Peminjaman>[] = [
  {
    accessorKey: 'kodeHT',
    header: 'Kode HT',
  },
  {
    accessorKey: 'namaPeminjam',
    header: 'Nama Peminjam',
  },
  {
    accessorKey: 'satker',
    header: 'Satuan Kerja',
  },
  {
    accessorKey: 'tanggalPinjam',
    header: 'Tgl Pinjam',
  },
  {
    accessorKey: 'tanggalKembali',
    header: 'Tgl Kembali',
    cell: ({ row }) => {
      const tgl = row.getValue('tanggalKembali');
      return tgl ? tgl : <span className="text-slate-400">-</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'Dikembalikan' ? 'default' : 'destructive';
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
            <DropdownMenuItem>Lihat Detail Tanda Terima</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];