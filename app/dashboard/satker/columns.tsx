// app/dashboard/satker/columns.tsx

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
import { Satker } from '@prisma/client';
import { deleteSatker } from './actions'; // Import server action

// Komponen helper untuk form action
const DeleteAction = ({ satkerId }: { satkerId: string }) => {
  const action = deleteSatker.bind(null);
  return (
    <form action={action}>
      <input type="hidden" name="satkerId" value={satkerId} />
      <button type="submit" className="w-full text-left">
        Hapus
      </button>
    </form>
  );
};

export const columns: ColumnDef<Satker>[] = [
  {
    accessorKey: 'kode',
    header: 'Kode Satker',
  },
  {
    accessorKey: 'nama',
    header: 'Nama Satuan Kerja',
  },
  // Anda bisa menambahkan kolom jumlah personil/HT jika diperlukan
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
     cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const satker = row.original;

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
            <DropdownMenuItem>Edit Satker</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={(e) => e.preventDefault()} // Mencegah dropdown tertutup saat item diklik
            >
              <DeleteAction satkerId={satker.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];