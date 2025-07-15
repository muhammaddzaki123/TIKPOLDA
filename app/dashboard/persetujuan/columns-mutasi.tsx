// app/dashboard/persetujuan/columns-mutasi.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export type PengajuanMutasiWithRelations = Prisma.PengajuanMutasiGetPayload<{
  include: {
    personil: { select: { nama: true; nrp: true } };
    satkerAsal: { select: { nama: true } };
    satkerTujuan: { select: { nama: true } };
  };
}>;

export const columnsMutasi: ColumnDef<PengajuanMutasiWithRelations>[] = [
  {
    header: 'Personil',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.personil.nama}</div>
        <div className="text-xs text-muted-foreground">NRP: {row.original.personil.nrp}</div>
      </div>
    ),
  },
  {
    header: 'Detail Mutasi',
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <span className="font-semibold">{row.original.satkerAsal.nama}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{row.original.satkerTujuan.nama}</span>
        </div>
    )
  },
  {
    accessorKey: 'alasan',
    header: 'Alasan Pengajuan',
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
        <Button size="sm">Setujui</Button>
        <Button size="sm" variant="destructive">Tolak</Button>
      </div>
    ),
  },
];