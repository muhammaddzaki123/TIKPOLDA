// File: app/dashboard/persetujuan/columns-peminjaman.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';

// --- Impor tambahan untuk memformat tanggal ---
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
    cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('keperluan')}</div>,
  },
  // --- KOLOM BARU UNTUK RENTANG TANGGAL ---
  {
    header: 'Rentang Peminjaman',
    cell: ({ row }) => {
      const { tanggalMulai, tanggalSelesai } = row.original;
      if (tanggalMulai && tanggalSelesai) {
        return (
          <div className="text-sm">
            {format(new Date(tanggalMulai), 'd MMM yyyy', { locale: id })} - {format(new Date(tanggalSelesai), 'd MMM yyyy', { locale: id })}
          </div>
        );
      }
      return <span className="text-xs text-muted-foreground">-</span>;
    },
  },
  // --- AKHIR KOLOM BARU ---
  {
    header: 'Dokumen',
    cell: ({ row }) => {
      const { fileUrl } = row.original;
      if (fileUrl) {
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Lihat PDF
            </Link>
          </Button>
        );
      }
      return <span className="text-xs text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Tgl. Pengajuan',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('id-ID'),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
  },
];