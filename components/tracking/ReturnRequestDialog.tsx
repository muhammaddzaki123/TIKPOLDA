// components/tracking/ReturnRequestDialog.tsx

'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface HtDetail {
  kodeHT: string;
  merk: string;
}

interface ReturnRequestDialogProps {
  pengajuanId: string;
  htDetails: HtDetail[];
  onSubmit: (pengajuanId: string, alasan: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ReturnRequestDialog({ 
  pengajuanId, 
  htDetails, 
  onSubmit, 
  trigger 
}: ReturnRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alasan.trim()) {
      toast.error('Alasan pengembalian wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit(pengajuanId, alasan);
        toast.success('Permintaan pengembalian berhasil dikirim.');
        setOpen(false);
        setAlasan('');
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Ajukan Pengembalian
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Ajukan Pengembalian HT
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  HT yang akan dikembalikan ({htDetails.length} unit):
                </h4>
                <ul className="space-y-1">
                  {htDetails.map((ht, index) => (
                    <li key={index} className="text-sm text-blue-800">
                      • {ht.kodeHT} ({ht.merk})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Perhatian</h4>
                <p className="text-sm text-yellow-800">
                  Setelah permintaan pengembalian disetujui, HT akan dikembalikan ke gudang pusat 
                  dan tidak dapat digunakan lagi sampai ada pengajuan baru.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Pengembalian *</Label>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Kegiatan telah selesai, HT sudah tidak diperlukan..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? 'Mengirim...' : 'Kirim Permintaan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
