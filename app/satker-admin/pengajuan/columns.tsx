'use client';

import { ColumnDef } from '@tanstack/react-table';
import { InventarisHT } from '../inventaris/columns'; // kita pakai tipe data yang sama

export const columns: ColumnDef<InventarisHT>[] = [
  {
    accessorKey: 'kodeHT',
    header: 'Kode HT',
  },
  {
    accessorKey: 'merk',
    header: 'Merk',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];