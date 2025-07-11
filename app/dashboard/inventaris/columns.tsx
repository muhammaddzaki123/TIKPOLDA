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
import { HT, Satker, Peminjaman, Personil } from '@prisma/client';

// Tipe data gabungan untuk menampilkan data relasi yang kompleks
export type HTWithDetails = HT & {
  satker: Satker;
  peminjaman: (Peminjaman & { personil: Personil })[];
};

export const columns: ColumnDef<HTWithDetails>[] = [
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
    accessorKey: 'satker.nama',
    header: 'Penempatan Satker',
  },
  {
    id: 'statusPeminjaman',
    header: 'Status',
    cell: ({ row }) => {
      const isDipinjam = row.original.peminjaman.length > 0;
      if (isDipinjam) {
        return <Badge variant="destructive">Dipinjam</Badge>;
      }
      return <Badge variant="default">Tersedia</Badge>;
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
    header: 'Pemegang Saat Ini',
    cell: ({ row }) => {
      const pemegang = row.original.peminjaman[0]?.personil;
      return pemegang ? `${pemegang.nama} (${pemegang.nrp})` : '-';
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
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Data HT</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              Hapus HT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
