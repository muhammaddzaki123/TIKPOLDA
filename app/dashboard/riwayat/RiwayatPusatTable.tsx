// app/dashboard/riwayat/RiwayatPusatTable.tsx

'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { PengajuanPeminjaman, Satker, HT } from '@prisma/client';

export type RiwayatPusatGrouped = PengajuanPeminjaman & {
  satkerPengaju: Satker;
  approvedHts: HT[];
};

export function RiwayatPusatTable({ data }: { data: RiwayatPusatGrouped[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusVariant = (status: 'APPROVED' | 'REJECTED' | 'PENDING'): "default" | "destructive" | "secondary" => {
    if (status === 'APPROVED') return 'default';
    if (status === 'REJECTED') return 'destructive';
    return 'secondary';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Satker Peminjam</TableHead>
            <TableHead>Keperluan</TableHead>
            <TableHead>Tanggal Pengajuan</TableHead>
            <TableHead>Tanggal Diproses</TableHead>
            <TableHead>Dokumen</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => [ // Return an array of components directly
              <TableRow key={item.id}>
                <TableCell>
                  {item.status === 'APPROVED' && item.approvedHts.length > 0 && (
                    <Button variant="ghost" size="sm" className="w-9 p-0" onClick={() => toggleRow(item.id)}>
                      {expandedRow === item.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.satkerPengaju.nama}</TableCell>
                <TableCell className="max-w-[250px] truncate" title={item.keperluan}>
                  {item.keperluan}
                </TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>{formatDate(item.updatedAt)}</TableCell>
                <TableCell>
                  {item.fileUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-3 w-3" /> PDF
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                  </Badge>
                  {item.status === 'REJECTED' && item.catatanAdmin && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={item.catatanAdmin}>
                      Alasan: {item.catatanAdmin}
                    </p>
                  )}
                </TableCell>
              </TableRow>,
              expandedRow === item.id && (
                <TableRow key={`${item.id}-details`} className="bg-slate-50 hover:bg-slate-50">
                  <TableCell colSpan={7} className="p-0">
                    <div className="p-4">
                      <h4 className="font-semibold mb-2 text-sm text-slate-800">Detail Aset HT yang Dipinjamkan:</h4>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kode HT</TableHead>
                              <TableHead>Merk</TableHead>
                              <TableHead>Serial Number</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.approvedHts.map(ht => (
                              <TableRow key={ht.id}>
                                <TableCell className="font-mono">{ht.kodeHT}</TableCell>
                                <TableCell>{ht.merk}</TableCell>
                                <TableCell>{ht.serialNumber}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            ])
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Tidak ada data riwayat yang cocok dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}