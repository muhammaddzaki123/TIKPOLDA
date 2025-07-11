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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Mengirim...' : 'Kirim Pengajuan Peminjaman'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
