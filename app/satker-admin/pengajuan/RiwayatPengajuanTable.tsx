// app/satker-admin/pengajuan/RiwayatPengajuanTable.tsx

'use client';

import { useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PengajuanStatus, Personil, Satker, HT } from '@prisma/client';

// Tipe data gabungan untuk semua jenis riwayat
export type Riwayat = {
  id: string;
  tipe: string; // 'Peminjaman HT' atau 'Mutasi Personil'
  status: PengajuanStatus;
  createdAt: Date;
  catatanAdmin?: string | null;
  // Properti spesifik
  jumlah?: number;
  keperluan?: string;
  personil?: Personil;
  satkerTujuan?: Satker;
  approvedHts?: HT[]; // <-- Properti baru untuk menampung HT yang disetujui
};

export function RiwayatPengajuanTable({ data }: { data: Riwayat[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusVariant = (status: PengajuanStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead className="w-[180px]">Tipe</TableHead>
            <TableHead>Detail Pengajuan</TableHead>
            <TableHead className="w-[200px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <Fragment key={item.id}>
                <TableRow>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{item.tipe}</TableCell>
                  <TableCell>
                    {item.tipe === 'Peminjaman HT' ? 
                     `${item.jumlah} unit - ${item.keperluan}`:
                     `Mutasi ${item.personil?.nama} ke ${item.satkerTujuan?.nama}`
                    }
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-col items-start gap-1">
                          <Badge variant={getStatusVariant(item.status)}>{item.status.replace('_', ' ')}</Badge>
                          {item.status === 'REJECTED' && (
                              <p className="text-xs text-red-500">Alasan: {item.catatanAdmin}</p>
                          )}
                          {item.status === 'APPROVED' && item.tipe === 'Peminjaman HT' && (
                            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={() => toggleRow(item.id)}>
                              {expandedRow === item.id ? <ChevronDown className="mr-1 h-3 w-3" /> : <ChevronRight className="mr-1 h-3 w-3" />}
                              Lihat Aset
                            </Button>
                          )}
                      </div>
                  </TableCell>
                </TableRow>
                {/* Baris untuk menampilkan detail HT yang disetujui */}
                {expandedRow === item.id && (
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableCell colSpan={4} className="p-0">
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 text-sm">Aset HT yang Disetujui:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                          {item.approvedHts?.map(ht => (
                            <li key={ht.id}>
                              <strong>{ht.kodeHT}</strong> (Merk: {ht.merk}, SN: {ht.serialNumber})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Belum ada riwayat pengajuan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}