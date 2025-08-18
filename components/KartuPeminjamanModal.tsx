'use client';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KartuPeminjamanHT } from './KartuPeminjamanHT';
import type { Peminjaman, HT, Personil } from '@prisma/client';
import * as htmlToImage from 'html-to-image';
import { toast } from 'sonner';

type PeminjamanWithDetails = Peminjaman & {
  ht: HT;
  personil: Personil;
  estimasiKembali: Date | null;
};

interface KartuPeminjamanModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PeminjamanWithDetails | null;
}

export function KartuPeminjamanModal({ isOpen, onClose, data }: KartuPeminjamanModalProps) {
  const kartuRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!kartuRef.current || !data) return;

    try {
      const dataUrl = await htmlToImage.toPng(kartuRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Buat link download
      const link = document.createElement('a');
      link.download = `kartu-peminjaman-${data.personil.nama}-${data.ht.serialNumber}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Kartu berhasil diunduh!');
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Gagal mengunduh kartu. Silakan coba lagi.');
    }
  };

  const handlePrint = () => {
    if (!kartuRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const kartuHtml = kartuRef.current.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu Peminjaman HT</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
            }
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f3f4f6;
            }
          </style>
        </head>
        <body>
          ${kartuHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Kartu Peminjaman HT</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div ref={kartuRef}>
            <KartuPeminjamanHT data={data} />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              Cetak
            </Button>
            <Button onClick={handleDownload}>
              Unduh PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
