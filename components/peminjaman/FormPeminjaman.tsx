// app/satker-admin/pengajuan/components/FormPeminjaman.tsx

'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPengajuanPeminjaman } from '@/app/satker-admin/pengajuan/actions';

export function FormPeminjaman() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const file = formData.get('file') as File;

    // Client-side validation
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
        await createPengajuanPeminjaman(formData);
        alert('Pengajuan peminjaman HT berhasil dikirim.');
        // Opsi: reset form setelah berhasil
        const form = document.getElementById('form-peminjaman') as HTMLFormElement;
        form.reset();
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengajuan Peminjaman HT</CardTitle>
        <CardDescription>
          Ajukan permintaan untuk meminjam unit HT tambahan dari gudang pusat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-peminjaman" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah HT yang Dibutuhkan</Label>
            <Input
              id="jumlah"
              name="jumlah"
              type="number"
              min="1"
              placeholder="Masukkan jumlah unit"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keperluan">Keperluan Peminjaman</Label>
            <Textarea
              id="keperluan"
              name="keperluan"
              placeholder="Contoh: Untuk pengamanan kegiatan KTT Internasional..."
              required
            />
          </div>
          {/* --- INPUT FILE PDF BARU --- */}
          <div className="space-y-2">
            <Label htmlFor="file">Unggah Surat Permohonan (PDF)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf" // Hanya izinkan file PDF
            />
            <p className="text-xs text-muted-foreground">Opsional. Ukuran file maksimal 2MB.</p>
          </div>
          {/* --- AKHIR INPUT FILE PDF BARU --- */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Mengirim...' : 'Kirim Pengajuan Peminjaman'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}