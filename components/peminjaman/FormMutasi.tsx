// app/satker-admin/pengajuan/components/FormMutasi.tsx

'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPengajuanMutasi } from '@/app/satker-admin/pengajuan/actions';
import type { Personil, Satker } from '@prisma/client';
import { Input } from '@/components/ui/input'; // <-- Import Input

interface FormMutasiProps {
  personilList: Personil[];
  satkerList: Satker[];
}

export function FormMutasi({ personilList, satkerList }: FormMutasiProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    // Client-side validation
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
        await createPengajuanMutasi(formData);
        alert('Pengajuan mutasi personil berhasil dikirim.');
        const form = document.getElementById('form-mutasi') as HTMLFormElement;
        form.reset();
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengajuan Mutasi Personil</CardTitle>
        <CardDescription>
          Ajukan permohonan pemindahan tugas untuk anggota di unit Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-mutasi" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="personilId">Pilih Personil</Label>
            <Select name="personilId" required>
              <SelectTrigger><SelectValue placeholder="Pilih anggota yang akan dimutasi..." /></SelectTrigger>
              <SelectContent>
                {personilList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nama} - {p.nrp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="satkerTujuanId">Pindahkan ke Satker Tujuan</Label>
            <Select name="satkerTujuanId" required>
              <SelectTrigger><SelectValue placeholder="Pilih Satker tujuan..." /></SelectTrigger>
              <SelectContent>
                {satkerList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Mutasi</Label>
            <Textarea
              id="alasan"
              name="alasan"
              placeholder="Contoh: Berdasarkan surat perintah No. XYZ/123/IV/2025"
              required
            />
          </div>
          {/* --- TAMBAHAN FORM UNTUK UPLOAD PDF --- */}
          <div className="space-y-2">
            <Label htmlFor="file">Unggah Surat Perintah (PDF)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf" // Hanya menerima file PDF
            />
             <p className="text-xs text-muted-foreground">Opsional. Ukuran file maksimal 2MB.</p>
          </div>
          {/* --- AKHIR TAMBAHAN --- */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Mengirim...' : 'Kirim Pengajuan Mutasi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}