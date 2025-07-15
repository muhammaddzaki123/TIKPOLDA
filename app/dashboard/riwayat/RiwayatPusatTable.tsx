// app/dashboard/riwayat/RiwayatPusatTable.tsx

'use client';

import { useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Satker Peminjam</TableHead>
            <TableHead>Keperluan</TableHead>
            <TableHead className="text-center">Jumlah</TableHead>
            <TableHead>Tanggal Disetujui</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <Fragment key={item.id}>
                <TableRow>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="w-9 p-0" onClick={() => toggleRow(item.id)}>
                      {expandedRow === item.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{item.satkerPengaju.nama}</TableCell>
                  <TableCell>{item.keperluan}</TableCell>
                  <TableCell className="text-center">{item.jumlah}</TableCell>
                  <TableCell>{new Date(item.updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                </TableRow>
                
                {expandedRow === item.id && (
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableCell colSpan={5} className="p-0">
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
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Tidak ada data riwayat yang cocok dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}