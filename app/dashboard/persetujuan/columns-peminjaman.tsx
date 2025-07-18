// app/dashboard/persetujuan/columns-peminjaman.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react'; // <-- Import ikon
import Link from 'next/link'; // <-- Import Link

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
    // Tambahkan style agar tidak terlalu lebar
    cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('keperluan')}</div>,
  },
  // --- KOLOM BARU UNTUK DOKUMEN ---
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
  // --- AKHIR KOLOM BARU ---
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