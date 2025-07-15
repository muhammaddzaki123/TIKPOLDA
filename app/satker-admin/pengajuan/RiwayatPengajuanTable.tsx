// app/satker-admin/pengajuan/RiwayatPengajuanTable.tsx

'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PengajuanStatus, Personil, Satker } from '@prisma/client';

// Tipe data gabungan untuk semua jenis riwayat
type Riwayat = {
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
};

export function RiwayatPengajuanTable({ data }: { data: Riwayat[] }) {

  const getStatusVariant = (status: PengajuanStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Detail Pengajuan</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id}>
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
                    </div>
                </TableCell>
              </TableRow>
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