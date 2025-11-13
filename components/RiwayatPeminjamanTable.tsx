// File: components/RiwayatPeminjamanTable.tsx

'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Peminjaman, HT, Personil } from '@prisma/client';
import Link from 'next/link';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText } from 'lucide-react';
import { Badge } from './ui/badge';

/*
  PERUBAHAN DI SINI:
  - Tipe `tanggalKembali` diubah menjadi `Date | null` agar cocok dengan tipe dari Prisma.
*/
type RiwayatPeminjaman = (Peminjaman & { 
    ht: HT; 
    personil: Personil; 
    tanggalKembali: Date | null; // <-- Tipe diubah di sini
});

interface RiwayatPeminjamanTableProps {
  data: RiwayatPeminjaman[];
}

export function RiwayatPeminjamanTable({ data }: RiwayatPeminjamanTableProps) {
  const renderCell = (label: string, content: React.ReactNode) => (
    <TableCell className="p-2 md:p-4 flex justify-between items-start border-b md:border-none md:table-cell">
      <span className="text-sm font-semibold text-gray-600 md:hidden">{label}</span>
      <div className="text-right md:text-left">{content}</div>
    </TableCell>
  );

  return (
    <div className="md:border md:rounded-md">
      <Table>
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead>Serial Number</TableHead>
            <TableHead>Personil Peminjam</TableHead>
            <TableHead>Tgl Pinjam</TableHead>
            <TableHead>Tgl Kembali</TableHead>
            <TableHead>Kondisi Kembali</TableHead>
            <TableHead>SPRINT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="flex flex-col gap-4 md:table-row-group">
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 md:table-row md:shadow-none md:p-0 md:bg-transparent">
                {renderCell("Serial Number", (
                  <div className="font-medium">
                    {item.ht.serialNumber}
                    <div className="text-xs text-muted-foreground">{item.ht.merk}</div>
                  </div>
                ))}
                {renderCell("Peminjam", (
                  <div>
                    {item.personil.nama}
                    <div className="text-xs text-muted-foreground">{item.personil.nrp}</div>
                  </div>
                ))}
                {renderCell("Tgl Pinjam", format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id }))}
                {renderCell("Tgl Kembali", (
                  <span className="font-semibold">
                    {item.tanggalKembali 
                      ? format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })
                      : '-'}
                  </span>
                ))}
                {renderCell("Kondisi Kembali", item.kondisiSaatKembali || '-')}
                {renderCell("SPRINT", (
                  item.fileUrl ? (
                    <Button variant="outline" size="sm" className="h-8" asChild>
                      <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-3 w-3" /> PDF
                      </Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary">Tidak ada</Badge>
                  )
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="md:table-row">
              <TableCell colSpan={6} className="h-24 text-center">
                Belum ada riwayat peminjaman yang selesai.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}