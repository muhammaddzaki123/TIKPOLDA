'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StatCard from '@/components/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, RadioTower, Users, CheckCircle, AlertTriangle, Wrench, HelpCircle } from 'lucide-react';
import { Prisma } from '@prisma/client';

// Tipe untuk data yang akan kita terima
type HtWithDetails = Prisma.HTGetPayload<{
  include: {
    satker: true;
    peminjaman: { where: { tanggalKembali: null }, include: { personil: true } };
  }
}>;

type Stats = {
  satkerCount: number;
  personilCount: number;
  htCount: number;
  dipinjamCount: number;
  tersediaCount: number;
  rusakCount: number;
  hilangCount: number;
};

type HtData = {
  allHt: HtWithDetails[];
  htRusak: HtWithDetails[];
  htHilang: HtWithDetails[];
  htDipinjam: HtWithDetails[];
  htTersedia: HtWithDetails[];
};

interface DashboardClientProps {
  stats: Stats;
  htData: HtData;
}

// Komponen utama untuk dashboard interaktif
export function DashboardClient({ stats, htData }: DashboardClientProps) {
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogData, setDialogData] = useState<HtWithDetails[]>([]);

  const handleCardClick = (title: string, data: HtWithDetails[]) => {
    setDialogTitle(title);
    setDialogData(data);
  };

  // Kalkulasi statistik berdasarkan merek untuk kartu "Total Unit HT"
  const htByMerk = htData.allHt.reduce((acc, ht) => {
    acc[ht.merk] = (acc[ht.merk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog>
      <div className="space-y-8">
        {/* Bagian Kartu Statistik Utama */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-700">Ringkasan Sistem</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Satuan Kerja" value={stats.satkerCount.toString()} icon={Building} color="bg-blue-500" />
            <StatCard title="Total Personil" value={stats.personilCount.toString()} icon={Users} color="bg-cyan-500" />
            {/* Kartu Total HT dibuat bisa diklik */}
            <DialogTrigger asChild onClick={() => handleCardClick('Total Unit HT Berdasarkan Merek', htData.allHt)}>
              <div className="cursor-pointer transition-transform hover:scale-[1.02]">
                <StatCard title="Total Unit HT" value={stats.htCount.toString()} icon={RadioTower} color="bg-indigo-500" />
              </div>
            </DialogTrigger>
          </div>
        </div>

        {/* Bagian Kartu Status HT */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-700">Status Aset HT</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DialogTrigger asChild onClick={() => handleCardClick('Daftar HT Tersedia', htData.htTersedia)}>
              <div className="cursor-pointer transition-transform hover:scale-[1.02]"><StatCard title="HT Tersedia" value={stats.tersediaCount.toString()} icon={CheckCircle} color="bg-green-500" /></div>
            </DialogTrigger>
            <DialogTrigger asChild onClick={() => handleCardClick('Daftar HT Dipinjam', htData.htDipinjam)}>
              <div className="cursor-pointer transition-transform hover:scale-[1.02]"><StatCard title="HT Dipinjam" value={stats.dipinjamCount.toString()} icon={AlertTriangle} color="bg-yellow-500" /></div>
            </DialogTrigger>
            <DialogTrigger asChild onClick={() => handleCardClick('Daftar HT Rusak', htData.htRusak)}>
              <div className="cursor-pointer transition-transform hover:scale-[1.02]"><StatCard title="HT Rusak" value={stats.rusakCount.toString()} icon={Wrench} color="bg-orange-500" /></div>
            </DialogTrigger>
             <DialogTrigger asChild onClick={() => handleCardClick('Daftar HT Hilang', htData.htHilang)}>
              <div className="cursor-pointer transition-transform hover:scale-[1.02]"><StatCard title="HT Hilang" value={stats.hilangCount.toString()} icon={HelpCircle} color="bg-red-500" /></div>
            </DialogTrigger>
          </div>
        </div>
      </div>

      {/* Konten Dialog yang akan muncul */}
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4">
          {dialogTitle === 'Total Unit HT Berdasarkan Merek' ? (
            // Tampilan khusus untuk kartu Total HT
            <Table>
              <TableHeader><TableRow><TableHead>Merek</TableHead><TableHead className="text-right">Jumlah Unit</TableHead></TableRow></TableHeader>
              <TableBody>
                {Object.entries(htByMerk).map(([merk, jumlah]) => (
                  <TableRow key={merk}><TableCell className="font-medium">{merk}</TableCell><TableCell className="text-right font-bold">{jumlah}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // Tampilan tabel umum untuk kartu lainnya
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode HT</TableHead>
                  <TableHead>Merek</TableHead>
                  <TableHead>Penempatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pemegang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogData.length > 0 ? dialogData.map(ht => (
                  <TableRow key={ht.id}>
                    <TableCell className="font-mono">{ht.kodeHT}</TableCell>
                    <TableCell>{ht.merk}</TableCell>
                    <TableCell>{ht.satker?.nama || 'Gudang Pusat'}</TableCell>
                    <TableCell><Badge variant={ht.status !== 'BAIK' ? 'destructive' : 'outline'}>{ht.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{ht.peminjaman[0]?.personil.nama || '-'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada data untuk ditampilkan.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}