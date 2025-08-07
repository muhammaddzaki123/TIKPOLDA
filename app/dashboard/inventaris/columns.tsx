// app/dashboard/inventaris/columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { HT, Satker, Peminjaman, Personil, PeminjamanSatker, HTStatus } from '@prisma/client';

export type HtDetails = HT & {
  satker: Satker | null;
  peminjaman: (Peminjaman & { personil: Personil })[];
  peminjamanOlehSatker: (PeminjamanSatker & { satker: Satker })[];
};

// Kolom untuk tabel Inventaris Gudang Pusat
export const gudangColumns: ColumnDef<HtDetails>[] = [

  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  {
    id: 'statusPeminjaman',
    header: 'Status',
    cell: ({ row }) => {
        const pinjamanAktif = row.original.peminjamanOlehSatker[0];
        if (pinjamanAktif) {
            return (
                <Badge variant="destructive">
                    Dipinjamkan ke {pinjamanAktif.satker.nama}
                </Badge>
            );
        }
        return <Badge variant="default">Tersedia di Gudang</Badge>;
    }
  },
  { 
    accessorKey: 'status', 
    header: 'Kondisi Fisik' ,
    cell: ({ row }) => {
        const status = row.original.status;
        let variant: "outline" | "secondary" | "destructive" = "outline";
        if (status === HTStatus.RUSAK_RINGAN || status === HTStatus.RUSAK_BERAT) variant = 'secondary';
        if (status === HTStatus.HILANG) variant = 'destructive';
        
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>
    }
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row, table }) => {
        const isDipinjam = row.original.peminjamanOlehSatker.length > 0;
        return (
            <div className="text-right space-x-2">
                <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => table.options.meta?.openEditDialog?.(row.original)}
                >
                    Edit
                </Button>
                <Button 
                    size="sm" 
                    onClick={() => table.options.meta?.openPinjamkanDialog?.(row.original)}
                    disabled={isDipinjam}
                >
                    Pinjamkan
                </Button>
                <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => table.options.meta?.openDeleteDialog?.(row.original)}
                    disabled={isDipinjam}
                >
                    Hapus
                </Button>
            </div>
        );
    },
  },
];

// Kolom untuk tabel Inventaris Terdistribusi (tidak ada perubahan)
export const terdistribusiColumns: ColumnDef<HtDetails>[] = [
  { accessorKey: 'kodeHT', header: 'Kode HT' },
  { accessorKey: 'merk', header: 'Merk' },
  {
    accessorKey: 'satker.nama',
    header: 'Penempatan',
    id: 'penempatan', 
    cell: ({ row }) => row.original.satker?.nama || '-',
  },
  {
    id: 'statusPeminjaman',
    header: 'Status Pinjam Internal',
    cell: ({ row }) => {
      const isDipinjamPersonil = row.original.peminjaman.length > 0;
      return isDipinjamPersonil ? (
        <Badge variant="destructive">Dipinjam Personil</Badge>
      ) : (
        <Badge variant="default">Tersedia di Satker</Badge>
      );
    },
  },
   {
    accessorKey: 'status',
    header: 'Kondisi Fisik',
    cell: ({ row }) => {
        const status = row.original.status;
        let variant: "outline" | "secondary" | "destructive" = "outline";
        if (status === 'RUSAK_RINGAN' || status === 'RUSAK_BERAT') variant = 'secondary';
        if (status === 'HILANG') variant = 'destructive';
        
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>
    }
  },
  {
    id: 'pemegang',
    header: 'Pemegang Akhir',
    cell: ({ row }) => row.original.peminjaman[0]?.personil?.nama || '-',
  },
];