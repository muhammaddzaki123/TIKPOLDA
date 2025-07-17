// components/peminjaman/ReturnPackageForm.tsx

'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createPackagePengembalian } from '@/app/satker-admin/pengajuan/actions';
import { Badge } from '@/components/ui/badge';
import type { PengajuanPeminjaman } from '@prisma/client';

// Tipe data baru untuk menyertakan detail HT dalam paket
export type ApprovedLoanPackage = PengajuanPeminjaman & {
  htDetails: { kodeHT: string; merk: string }[];
};

interface ReturnPackageFormProps {
  approvedLoans: ApprovedLoanPackage[];
}

export function ReturnPackageForm({ approvedLoans }: ReturnPackageFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<ApprovedLoanPackage | null>(null);

  const openDialog = (loan: ApprovedLoanPackage) => {
    setSelectedLoan(loan);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createPackagePengembalian(formData);
        alert('Pengajuan pengembalian untuk paket ini berhasil dikirim.');
        setIsDialogOpen(false);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Paket Peminjaman Aktif</CardTitle>
          <CardDescription>
            Ajukan pengembalian untuk satu paket peminjaman yang telah disetujui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedLoans.length > 0 ? (
            approvedLoans.map((loan) => (
              <div key={loan.id} className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">Keperluan: {loan.keperluan}</p>
                    <p className="text-xs text-muted-foreground">
                      Disetujui pada: {new Date(loan.updatedAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openDialog(loan)}>
                    Ajukan Pengembalian Paket
                  </Button>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-2">Aset HT dalam paket ini ({loan.htDetails.length} unit):</p>
                  <div className="flex flex-wrap gap-2">
                    {loan.htDetails.map(ht => (
                      <Badge key={ht.kodeHT} variant="secondary">{ht.kodeHT}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-24 flex items-center justify-center text-center text-sm text-muted-foreground">
              Tidak ada paket peminjaman aktif dari pusat.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog untuk konfirmasi dan mengisi alasan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Pengembalian Paket</DialogTitle>
            <DialogDescription>
              Anda akan mengajukan pengembalian untuk <strong>{selectedLoan?.htDetails.length} unit HT</strong> dengan keperluan "{selectedLoan?.keperluan}".
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit}>
            <input type="hidden" name="pengajuanPeminjamanId" value={selectedLoan?.id ?? ''} />
            <div className="py-4 space-y-2">
              <Label htmlFor="alasan">Alasan Pengembalian</Label>
              <Textarea
                id="alasan"
                name="alasan"
                placeholder="Contoh: Kegiatan pengamanan telah selesai."
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}