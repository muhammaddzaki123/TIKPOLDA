'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { deleteHtBySuperAdmin } from '@/app/dashboard/inventaris/actions';
import { toast } from 'sonner';

interface DeleteHtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  htData: {
    id: string;
    merk: string;
    serialNumber: string;
  };
}

export default function DeleteHtDialog({ isOpen, onClose, htData }: DeleteHtDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteHtBySuperAdmin(htData.id);
        toast.success('Data HT berhasil dihapus!');
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus data HT');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data HT berikut?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium">Merk:</span> {htData.merk}
          </div>
          <div className="text-sm">
            <span className="font-medium">Serial Number:</span> {htData.serialNumber}
          </div>
        </div>
        
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Data HT akan dihapus secara permanen dari sistem.
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
