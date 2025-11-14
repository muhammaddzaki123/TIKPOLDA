// components/PerpanjanganModal.tsx

'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { perpanjangPeminjaman } from '@/app/satker-admin/peminjaman/actions';
import type { Peminjaman, HT, Personil } from '@prisma/client';

type PeminjamanAktif = (Peminjaman & { 
  ht: HT; 
  personil: Personil; 
  estimasiKembali: Date | null;
});

interface PerpanjanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  peminjaman: PeminjamanAktif | null;
}

export function PerpanjanganModal({ isOpen, onClose, peminjaman }: PerpanjanganModalProps) {
  const [isPending, startTransition] = useTransition();
  const [estimasiKembaliBaru, setEstimasiKembaliBaru] = useState<Date | undefined>();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!estimasiKembaliBaru) {
      toast.error('Tanggal estimasi baru wajib diisi.');
      return;
    }

    // Validasi bahwa tanggal baru harus lebih besar dari estimasi lama
    if (peminjaman?.estimasiKembali) {
      const oldDate = new Date(peminjaman.estimasiKembali);
      oldDate.setHours(0, 0, 0, 0);
      const newDate = new Date(estimasiKembaliBaru);
      newDate.setHours(0, 0, 0, 0);
      
      if (newDate <= oldDate) {
        toast.error('Tanggal perpanjangan harus lebih besar dari estimasi sebelumnya.');
        return;
      }
    }

    formData.append('estimasiKembaliBaru', estimasiKembaliBaru.toISOString());
    formData.append('peminjamanId', peminjaman?.id || '');

    // Validasi file
    const file = formData.get('fileSprint') as File;
    if (file && file.size > 0 && file.type !== 'application/pdf') {
      toast.error('File yang diunggah harus berformat PDF.');
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file tidak boleh lebih dari 2MB.');
      return;
    }

    startTransition(async () => {
      try {
        await perpanjangPeminjaman(formData);
        toast.success('Peminjaman berhasil diperpanjang!');
        setEstimasiKembaliBaru(undefined);
        onClose();
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Terjadi kesalahan yang tidak diketahui.');
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Perpanjang Peminjaman HT</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Perpanjang peminjaman untuk HT <strong>{peminjaman?.ht.serialNumber}</strong> oleh <strong>{peminjaman?.personil.nama}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Estimasi Kembali Saat Ini</Label>
              <div className="text-sm font-medium text-muted-foreground">
                {peminjaman?.estimasiKembali 
                  ? format(new Date(peminjaman.estimasiKembali), 'dd MMMM yyyy', { locale: id })
                  : 'Tidak ada'}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimasiKembaliBaru" className="text-xs sm:text-sm">Estimasi Pengembalian Baru *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal text-xs sm:text-sm",
                      !estimasiKembaliBaru && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {estimasiKembaliBaru ? format(estimasiKembaliBaru, "PPP", { locale: id }) : <span>Pilih tanggal baru</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={estimasiKembaliBaru}
                    onSelect={setEstimasiKembaliBaru}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileSprint" className="text-xs sm:text-sm">Upload SPRINT Baru (PDF)</Label>
              <Input 
                id="fileSprint" 
                name="fileSprint" 
                type="file" 
                accept=".pdf" 
                className="text-xs sm:text-sm" 
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Opsional. File akan menggantikan SPRINT lama. Maksimal 2MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatanPerpanjangan" className="text-xs sm:text-sm">Catatan Perpanjangan (Opsional)</Label>
              <Textarea 
                id="catatanPerpanjangan" 
                name="catatanPerpanjangan" 
                placeholder="Alasan perpanjangan atau catatan tambahan..." 
                className="text-xs sm:text-sm" 
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="w-full sm:w-auto text-xs sm:text-sm"
              disabled={isPending}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              {isPending ? 'Memproses...' : 'Perpanjang Peminjaman'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
