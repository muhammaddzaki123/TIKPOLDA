// app/dashboard/admin/columns.tsx

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
import { User } from '@prisma/client';

// PERBAIKAN: Mengganti ColumnMeta menjadi TableMeta
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    openResetDialog: (user: TData) => void;
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'nama',
    header: 'Nama Lengkap',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
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
            <DropdownMenuItem
              // Sekarang akses ini sudah valid secara tipe
              onClick={() => table.options.meta?.openResetDialog(user)}
            >
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Hapus Akun
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];