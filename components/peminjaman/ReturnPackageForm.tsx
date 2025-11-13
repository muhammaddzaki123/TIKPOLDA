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
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error submitting return request:', error.message);
          toast.error(`Error: ${error.message}`);
        } else {
          console.error('An unknown error occurred:', error);
          toast.error('Terjadi kesalahan yang tidak diketahui.');
        }
      }
    });
  };

  return (
    <>
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800">Paket Peminjaman Aktif</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600">
                Ajukan pengembalian untuk paket peminjaman yang telah disetujui
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedLoans.length > 0 ? (
            approvedLoans.map((loan) => (
              <div key={loan.id} className="rounded-xl border border-slate-200 p-3 sm:p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col gap-3">
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs sm:text-sm leading-relaxed">Keperluan: {loan.keperluan}</h4>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
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
                    className="w-full sm:w-auto text-xs sm:text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                    disabled={loan.htDetails.length === 0}
                  >
                    <Undo2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Ajukan Pengembalian
                  </Button>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-slate-100">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Aset HT dalam paket ini ({loan.htDetails.length} unit):
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {loan.htDetails.length > 0 ? (
                      loan.htDetails.map(ht => (
                        <Badge key={ht.serialNumber} variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200">
                          {ht.serialNumber} - {ht.merk}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="destructive" className="text-[10px] sm:text-xs px-2 py-0.5">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tidak ada HT aktif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-28 sm:h-32 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 px-4">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 mb-2" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Tidak ada paket peminjaman aktif</p>
              <p className="text-[10px] sm:text-xs text-slate-400">Paket akan muncul setelah pengajuan peminjaman disetujui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog untuk konfirmasi dan mengisi alasan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Undo2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              Ajukan Pengembalian Paket
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">
              Anda akan mengajukan pengembalian untuk <strong className="text-slate-800">{selectedLoan?.htDetails.length} unit HT</strong> dengan keperluan <strong className="text-slate-800">&quot;{selectedLoan?.keperluan}&quot;</strong>.
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeDialog}
                disabled={isPending}
                className="w-full sm:flex-1 text-xs sm:text-sm"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || !alasan.trim()}
                className="w-full sm:flex-1 text-xs sm:text-sm bg-red-600 hover:bg-red-700"
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
