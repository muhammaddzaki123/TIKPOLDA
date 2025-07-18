// app/dashboard/riwayat-mutasi/columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

export type RiwayatMutasiWithDetails = Prisma.PengajuanMutasiGetPayload<{
  include: {
    personil: true;
    satkerAsal: true;
    satkerTujuan: true;
  };
}>;

const formatDate = (date: Date) => new Date(date).toLocaleDateString('id-ID', {
  year: 'numeric', month: 'long', day: 'numeric',
});

const getStatusVariant = (status: 'APPROVED' | 'REJECTED' | 'PENDING'): "default" | "destructive" | "secondary" => {
  if (status === 'APPROVED') return 'default';
  if (status === 'REJECTED') return 'destructive';
  return 'secondary';
};

export const columns: ColumnDef<RiwayatMutasiWithDetails>[] = [
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
        <Badge variant="secondary">{row.original.satkerAsal.nama}</Badge>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <Badge variant="outline">{row.original.satkerTujuan.nama}</Badge>
      </div>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Tgl. Pengajuan',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Tgl. Diproses',
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    header: 'Dokumen',
    cell: ({ row }) => {
      const { fileUrl } = row.original;
      return fileUrl ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="mr-2 h-3 w-3" /> PDF
          </Link>
        </Button>
      ) : <span className="text-xs text-muted-foreground">-</span>;
    },
  },
  {
    header: 'Status',
    cell: ({ row }) => (
        <div>
            <Badge variant={getStatusVariant(row.original.status)}>
                {row.original.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
            </Badge>
            {row.original.status === 'REJECTED' && row.original.catatanAdmin && (
            <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={row.original.catatanAdmin}>
                Alasan: {row.original.catatanAdmin}
            </p>
            )}
        </div>
    ),
  },
];