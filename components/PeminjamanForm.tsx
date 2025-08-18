// File: components/PeminjamanForm.tsx

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPeminjaman } from '@/app/satker-admin/peminjaman/actions';
import type { HT, Personil } from '@prisma/client';

// Impor yang diperlukan untuk Date Picker dan Notifikasi
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface PeminjamanFormProps {
  htTersedia: HT[];
  personilList: Personil[];
}

export function PeminjamanForm({ htTersedia, personilList }: PeminjamanFormProps) {
  const [isPending, startTransition] = useTransition();
  const [estimasiKembali, setEstimasiKembali] = useState<Date | undefined>();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Tambahkan tanggal estimasi ke FormData sebelum mengirim
    if (estimasiKembali) {
        // Kirim sebagai ISO string agar mudah di-parse di server
        formData.append('estimasiKembali', estimasiKembali.toISOString());
    } else {
        toast.error('Estimasi tanggal kembali wajib diisi.');
        return;
    }
    
    // Validasi file di sisi klien
    const file = formData.get('file') as File;
    if (file && file.size > 0 && file.type !== 'application/pdf') {
      toast.error('File yang diunggah harus berformat PDF.');
      return;
    }
     if (file && file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Ukuran file tidak boleh lebih dari 2MB.');
      return;
    }

    startTransition(async () => {
      try {
        await createPeminjaman(formData);
        toast.success('Peminjaman HT berhasil dicatat!');
        // Reset form dan state
        const form = document.getElementById('form-peminjaman-internal') as HTMLFormElement;
        form.reset();
        setEstimasiKembali(undefined);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Peminjaman Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-peminjaman-internal" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="htId">Pilih HT yang Tersedia</Label>
            <Select name="htId" required>
              <SelectTrigger><SelectValue placeholder="Pilih Kode HT..." /></SelectTrigger>
              <SelectContent>
                {htTersedia.length > 0 ? (
                  htTersedia.map((ht) => (
                    <SelectItem key={ht.id} value={ht.id}>{ht.serialNumber} - {ht.merk}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="disabled" disabled>Tidak ada HT yang tersedia</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="personilId">Pilih Personil Peminjam</Label>
            <Select name="personilId" required>
              <SelectTrigger><SelectValue placeholder="Pilih Nama Personil..." /></SelectTrigger>
              <SelectContent>
                {personilList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nama} - {p.nrp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* --- INPUT DATE PICKER UNTUK ESTIMASI PENGEMBALIAN --- */}
          <div className="space-y-2">
            <Label htmlFor="estimasiKembali">Estimasi Pengembalian</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !estimasiKembali && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {estimasiKembali ? format(estimasiKembali, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={estimasiKembali}
                        onSelect={setEstimasiKembali}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kondisiSaatPinjam">Kondisi HT Saat Dipinjam</Label>
            <Textarea id="kondisiSaatPinjam" name="kondisiSaatPinjam" placeholder="Contoh: Kondisi fisik baik, baterai penuh, lengkap dengan charger." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
            <Textarea id="catatan" name="catatan" placeholder="Catatan jika ada..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Unggah SPRINT (PDF)</Label>
            <Input id="file" name="file" type="file" accept=".pdf" />
            <p className="text-xs text-muted-foreground">Opsional. Ukuran file maksimal 2MB.</p>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || htTersedia.length === 0}>
            {isPending ? 'Memproses...' : 'Catat Peminjaman'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}