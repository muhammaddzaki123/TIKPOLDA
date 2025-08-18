// components/peminjaman/ReturnPackageForm.tsx

'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { createPackagePengembalian } from '../../app/satker-admin/pengajuan/actions';
import { Badge } from '../ui/badge';
import { Undo2, Package, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { PengajuanPeminjaman } from '@prisma/client';

// Tipe data baru untuk menyertakan detail HT dalam paket
export type ApprovedLoanPackage = PengajuanPeminjaman & {
  htDetails: { serialNumber: string; merk: string }[];
};

interface ReturnPackageFormProps {
  approvedLoans: ApprovedLoanPackage[];
}

export function ReturnPackageForm({ approvedLoans }: ReturnPackageFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<ApprovedLoanPackage | null>(null);
  const [alasan, setAlasan] = useState('');

  const openDialog = (loan: ApprovedLoanPackage) => {
    setSelectedLoan(loan);
    setAlasan('');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedLoan(null);
    setAlasan('');
  };

  const handleSubmit = (formData: FormData) => {
    if (!alasan.trim()) {
      toast.error('Alasan pengembalian wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        await createPackagePengembalian(formData);
        toast.success('Pengajuan pengembalian untuk paket ini berhasil dikirim.');
        closeDialog();
      } catch (error: any) {
        console.error('Error submitting return request:', error);
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  return (
    <>
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">Paket Peminjaman Aktif</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Ajukan pengembalian untuk paket peminjaman yang telah disetujui
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedLoans.length > 0 ? (
            approvedLoans.map((loan) => (
              <div key={loan.id} className="rounded-xl border border-slate-200 p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-800 text-sm">Keperluan: {loan.keperluan}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Disetujui: {new Date(loan.updatedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      {loan.tanggalMulai && loan.tanggalSelesai && (
                        <div className="flex items-center gap-1">
                          <span>Periode: {new Date(loan.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(loan.tanggalSelesai).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => openDialog(loan)}
                    className="ml-4 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                    disabled={loan.htDetails.length === 0}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Ajukan Pengembalian
                  </Button>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-700 mb-2">
                    Aset HT dalam paket ini ({loan.htDetails.length} unit):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {loan.htDetails.length > 0 ? (
                      loan.htDetails.map(ht => (
                        <Badge key={ht.serialNumber} variant="secondary" className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
                          {ht.serialNumber} - {ht.merk}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tidak ada HT aktif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Package className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 font-medium">Tidak ada paket peminjaman aktif</p>
              <p className="text-xs text-slate-400">Paket akan muncul setelah pengajuan peminjaman disetujui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog untuk konfirmasi dan mengisi alasan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Undo2 className="h-5 w-5 text-red-600" />
              Ajukan Pengembalian Paket
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Anda akan mengajukan pengembalian untuk <strong className="text-slate-800">{selectedLoan?.htDetails.length} unit HT</strong> dengan keperluan <strong className="text-slate-800">"{selectedLoan?.keperluan}"</strong>.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="pengajuanPeminjamanId" value={selectedLoan?.id ?? ''} />
            <div className="space-y-2">
              <Label htmlFor="alasan" className="text-sm font-medium text-slate-700">
                Alasan Pengembalian <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="alasan"
                name="alasan"
                value={alasan}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAlasan(e.target.value)}
                placeholder="Contoh: Kegiatan pengamanan telah selesai dan tidak diperlukan lagi."
                className="min-h-[80px] resize-none"
                required
              />
              <p className="text-xs text-slate-500">
                Berikan alasan yang jelas untuk mempercepat proses persetujuan
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeDialog}
                disabled={isPending}
                className="flex-1"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || !alasan.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Kirim Pengajuan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
