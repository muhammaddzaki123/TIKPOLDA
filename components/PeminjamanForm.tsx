// app/satker-admin/peminjaman/components/PeminjamanForm.tsx

'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // <-- Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPeminjaman } from '@/app/satker-admin/peminjaman/actions';
import type { HT, Personil } from '@prisma/client';

interface PeminjamanFormProps {
  htTersedia: HT[];
  personilList: Personil[];
}

export function PeminjamanForm({ htTersedia, personilList }: PeminjamanFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    // Validasi file di sisi klien
    const file = formData.get('file') as File;
    if (file && file.size > 0 && file.type !== 'application/pdf') {
      alert('Error: File yang diunggah harus berformat PDF.');
      return;
    }
     if (file && file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Error: Ukuran file tidak boleh lebih dari 2MB.');
      return;
    }

    startTransition(async () => {
      try {
        await createPeminjaman(formData);
        alert('Peminjaman HT berhasil dicatat!');
        const form = document.getElementById('form-peminjaman-internal') as HTMLFormElement;
        form.reset();
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Peminjaman Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-peminjaman-internal" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="htId">Pilih HT yang Tersedia</Label>
            <Select name="htId" required>
              <SelectTrigger><SelectValue placeholder="Pilih Kode HT..." /></SelectTrigger>
              <SelectContent>
                {htTersedia.length > 0 ? (
                  htTersedia.map((ht) => (
                    <SelectItem key={ht.id} value={ht.id}>{ht.kodeHT} - {ht.merk}</SelectItem>
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
          <div className="space-y-2">
            <Label htmlFor="kondisiSaatPinjam">Kondisi HT Saat Dipinjam</Label>
            <Textarea id="kondisiSaatPinjam" name="kondisiSaatPinjam" placeholder="Contoh: Kondisi fisik baik, baterai penuh, lengkap dengan charger." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
            <Textarea id="catatan" name="catatan" placeholder="Catatan jika ada..." />
          </div>
          {/* --- INPUT FILE PDF BARU --- */}
          <div className="space-y-2">
            <Label htmlFor="file">Unggah SPRINT (PDF)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf"
            />
            <p className="text-xs text-muted-foreground">Opsional. Ukuran file maksimal 2MB.</p>
          </div>
          {/* --- AKHIR INPUT FILE PDF BARU --- */}
          <Button type="submit" className="w-full" disabled={isPending || htTersedia.length === 0}>
            {isPending ? 'Memproses...' : 'Catat Peminjaman'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}