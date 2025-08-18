'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { tarikHtKeGudangPusat } from '@/app/dashboard/inventaris/actions';
import { toast } from 'sonner';

interface TarikHtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  htData: {
    id: string;
    merk: string;
    serialNumber: string;
    satker?: {
      nama: string;
    } | null;
  };
}

export default function TarikHtDialog({ isOpen, onClose, htData }: TarikHtDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleTarik = async () => {
    startTransition(async () => {
      try {
        await tarikHtKeGudangPusat(htData.id);
        toast.success('HT berhasil ditarik ke gudang pusat!');
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Gagal menarik HT ke gudang pusat');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tarik HT ke Gudang Pusat</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menarik HT berikut ke gudang pusat?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium">Merk:</span> {htData.merk}
          </div>
          <div className="text-sm">
            <span className="font-medium">Serial Number:</span> {htData.serialNumber}
          </div>
          <div className="text-sm">
            <span className="font-medium">Lokasi Saat Ini:</span> {htData.satker?.nama || 'Unknown'}
          </div>
        </div>
        
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <strong>Info:</strong> HT akan dipindahkan dari satker ke gudang pusat dan status peminjaman satker akan ditutup.
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button 
            type="button" 
            variant="default" 
            onClick={handleTarik}
            disabled={isPending}
          >
            {isPending ? 'Menarik...' : 'Ya, Tarik ke Gudang'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
