// app/dashboard/persetujuan/columns-peminjaman.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';

export type PengajuanPeminjamanWithRelations = Prisma.PengajuanPeminjamanGetPayload<{
  include: {
    satkerPengaju: { select: { nama: true } };
  };
}>;

export const columnsPeminjaman: ColumnDef<PengajuanPeminjamanWithRelations>[] = [
  {
    accessorKey: 'satkerPengaju.nama',
    header: 'Satker Pemohon',
  },
  {
    accessorKey: 'jumlah',
    header: 'Jumlah HT',
  },
  {
    accessorKey: 'keperluan',
    header: 'Keperluan',
  },
  {
    accessorKey: 'createdAt',
    header: 'Tgl. Pengajuan',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('id-ID'),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row, table }) => (
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={() => table.options.meta?.handleApprove?.(row.original.id)}>
          Setujui
        </Button>
        <Button size="sm" variant="destructive" onClick={() => table.options.meta?.handleReject?.(row.original)}>
          Tolak
        </Button>
      </div>
    ),
  },
];