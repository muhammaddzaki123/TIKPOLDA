// app/dashboard/personil/columns.tsx

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
import { PersonilWithSatker } from '@/types/custom';

export const columns: ColumnDef<PersonilWithSatker>[] = [
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
    header: 'Nama Personil',
  },
  {
    accessorKey: 'nrp',
    header: 'NRP',
  },
  {
    accessorKey: 'satker.nama',
    header: 'Satker Induk',
    id: 'satker_nama', 
  },
  {
    header: 'Penempatan',
    id: 'penempatan', // <-- TAMBAHKAN ID UNIK INI
    accessorFn: (row) => row.subSatker || row.satker.nama, // Helper untuk filter
    cell: ({ row }) => {
      const personil = row.original;
      return personil.subSatker || personil.satker.nama;
    },
  },
  {
    accessorKey: 'pangkat',
    header: 'Pangkat',
  },
  {
    accessorKey: 'jabatan',
    header: 'Jabatan',
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
            <DropdownMenuItem
              onClick={() => table.options.meta?.openMutasiDialog?.(personil)}
            >
              Mutasi Personil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
