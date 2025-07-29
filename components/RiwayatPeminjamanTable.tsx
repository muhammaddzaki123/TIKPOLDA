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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode HT</TableHead>
            <TableHead>Personil Peminjam</TableHead>
            <TableHead>Tgl Pinjam</TableHead>
            <TableHead>Tgl Kembali</TableHead>
            <TableHead>Kondisi Kembali</TableHead>
            <TableHead>SPRINT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                    {item.ht.kodeHT}
                    <div className="text-xs text-muted-foreground">{item.ht.merk}</div>
                </TableCell>
                <TableCell>
                    <div>{item.personil.nama}</div>
                    <div className="text-xs text-muted-foreground">{item.personil.nrp}</div>
                </TableCell>
                <TableCell>{format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</TableCell>
                <TableCell className="font-semibold">
                  {/*
                    PERUBAHAN DI SINI:
                    - Tambahkan pengecekan untuk memastikan `tanggalKembali` tidak null sebelum diformat.
                  */}
                  {item.tanggalKembali 
                    ? format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })
                    : '-'}
                </TableCell>
                <TableCell>{item.kondisiSaatKembali || '-'}</TableCell>
                <TableCell>
                  {item.fileUrl ? (
                    <Button variant="outline" size="sm" className="h-8" asChild>
                      <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-3 w-3" /> PDF
                      </Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary">Tidak ada</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
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