// app/dashboard/persetujuan/columns-pengembalian.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';

export type PengajuanPengembalianWithRelations = Prisma.PengajuanPengembalianGetPayload<{
  include: {
    satkerPengaju: { select: { nama: true } };
    ht: { select: { kodeHT: true; merk: true; serialNumber: true } };
  };
}>;

export const columnsPengembalian: ColumnDef<PengajuanPengembalianWithRelations>[] = [
  {
    accessorKey: 'satkerPengaju.nama',
    header: 'Satker Pengaju',
  },
  {
    header: 'Aset yang Dikembalikan',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.ht.kodeHT}</div>
        <div className="text-xs text-muted-foreground">{row.original.ht.merk} - SN: {row.original.ht.serialNumber}</div>
      </div>
    ),
  },
  {
    accessorKey: 'alasan',
    header: 'Alasan',
  },
  {
    accessorKey: 'createdAt',
    header: 'Tgl. Pengajuan',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('id-ID'),
  },
  // -- KOLOM AKSI YANG DITAMBAHKAN --
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
  },
];