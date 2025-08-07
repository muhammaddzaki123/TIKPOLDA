// app/satker-admin/personil/columns.tsx

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
import type { Personil as PrismaPersonil } from '@prisma/client';

// Tipe data ini akan membawa nama Satker utama
export type PersonilWithSatkerName = PrismaPersonil & {
  satkerName: string;
};

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    openPhotoDialog?: (personil: TData) => void;
  }
}

export const columns: ColumnDef<PersonilWithSatkerName>[] = [
  {
    id: 'foto',
    header: 'Foto',
    cell: ({ row, table }) => {
      const fotoUrl = row.original.fotoUrl;
      return (
        <div className="flex items-center justify-center">
          {fotoUrl ? (
            <img 
              src={fotoUrl} 
              alt={`Foto ${row.original.nama}`}
              className="w-12 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => table.options.meta?.openPhotoDialog?.(row.original)}
            />
          ) : (
            <div className="w-12 h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
              No Photo
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'nama',
    header: 'Nama Lengkap',
  },
  {
    accessorKey: 'nrp',
    header: 'NRP',
  },
  {
    accessorKey: 'pangkat',
    header: 'Pangkat',
  },
  {
    accessorKey: 'jabatan',
    header: 'Jabatan',
  },
  // --- KOLOM BARU UNTUK SATKER INDUK ---
  {
    accessorKey: 'satkerName',
    header: 'Satker',
  },
  // --- KOLOM PENEMPATAN (SUB SATKER) ---
  {
    accessorKey: 'subSatker',
    header: 'Penempatan',
    cell: ({ row }) => {
      // Jika personil punya subSatker, tampilkan. Jika tidak, tampilkan nama Satker utama.
      return row.original.subSatker || row.original.satkerName;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const personil = row.original;

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
            <DropdownMenuItem onClick={() => table.options.meta?.openEditPersonilDialog?.(personil)}>
              Edit Data Personil
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => table.options.meta?.openDeletePersonilDialog?.(personil)}
            >
              Hapus Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];