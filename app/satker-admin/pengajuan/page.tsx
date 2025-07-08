'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HTDataTable } from '@/components/ht-data-table';
import { columns } from './columns';
import { personilDitlantas } from '@/data/mock-personil-data';
import { CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
// Perubahan 1: Impor tipe InventarisHT
import { InventarisHT } from '../inventaris/columns';

// Perubahan 2: Berikan tipe eksplisit pada variabel di bawah ini
const inventarisTersedia: InventarisHT[] = [
    { id: '2', kodeHT: 'HT-LTS-002', merk: 'Motorola', pemegang: 'Di Gudang', nrp: '-', status: 'Di Gudang' },
    { id: '9', kodeHT: 'HT-LTS-009', merk: 'Hytera', pemegang: 'Di Gudang', nrp: '-', status: 'Di Gudang' },
];

export default function PengajuanPage() {
  const [selectedHT, setSelectedHT] = useState<string | null>(null);
  const [tanggalKembali, setTanggalKembali] = useState<Date>();

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Formulir Pengajuan Peminjaman HT</h1>
        <p className="text-sm text-slate-600">
          Pilih HT yang tersedia, lengkapi detail, dan kirim pengajuan ke Super Admin untuk persetujuan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Kolom Kiri: Pilih HT */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Langkah 1: Pilih HT yang Tersedia</h2>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
             {/* Tabel ini perlu dimodifikasi agar bisa memilih baris (row selection) */}
            <HTDataTable columns={columns} data={inventarisTersedia} />
            <p className="text-xs text-center text-slate-500 pt-2">Klik pada baris tabel untuk memilih HT.</p>
          </div>
        </div>

        {/* Kolom Kanan: Detail Peminjaman */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Langkah 2: Lengkapi Detail Peminjaman</h2>
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
            <div>
              <Label htmlFor="personil">Personil Peminjam</Label>
              <Select>
                <SelectTrigger id="personil">
                  <SelectValue placeholder="Pilih Personil" />
                </SelectTrigger>
                <SelectContent>
                  {personilDitlantas.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nama} - {p.nrp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="keperluan">Keperluan Peminjaman</Label>
              <Textarea id="keperluan" placeholder="Contoh: Pengamanan kegiatan Idul Adha 1446 H di Lapangan Sangkareang" />
            </div>

            <div>
              <Label>Estimasi Tanggal Kembali</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tanggalKembali && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tanggalKembali ? format(tanggalKembali, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={tanggalKembali} onSelect={setTanggalKembali} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <Button size="lg" className="w-full">
              <Send className="mr-2 h-5 w-5" />
              Kirim Pengajuan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}