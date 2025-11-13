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
      toast.info('Sedang membuat gambar...');
      
      const dataUrl = await htmlToImage.toPng(kartuRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: 323,
        height: 220,
        style: {
          transform: 'none',
          margin: '0',
          padding: '0'
        }
      });

      // Buat link download
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `Kartu-Peminjaman-HT-${data.personil.nama.replace(/\s+/g, '-')}-${timestamp}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Kartu berhasil diunduh dalam kualitas tinggi!');
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Gagal mengunduh kartu. Silakan coba lagi.');
    }
  };

  const handlePrint = async () => {
    if (!kartuRef.current || !data) return;

    try {
      toast.info('Mempersiapkan cetak...');
      
      // Generate high-quality image first
      const dataUrl = await htmlToImage.toPng(kartuRef.current, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: 323,
        height: 220,
        style: {
          transform: 'none',
          margin: '0',
          padding: '0'
        }
      });

      // Create print window with the image
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up diblokir. Izinkan pop-up untuk mencetak.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Kartu Peminjaman HT - ${data.personil.nama}</title>
            <meta charset="UTF-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              @page {
                size: 85.6mm 53.98mm landscape;
                margin: 0;
              }
              
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
              }
              
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
              }
              
              .print-container {
                width: 85.6mm;
                height: 53.98mm;
                position: relative;
                page-break-after: always;
                overflow: hidden;
              }
              
              .card-image {
                width: 100%;
                height: 100%;
                object-fit: fill;
                display: block;
              }
              
              @media print {
                html, body {
                  width: 85.6mm;
                  height: 53.98mm;
                  overflow: hidden;
                }
                
                body {
                  background: white;
                  margin: 0;
                  padding: 0;
                }
                
                .print-container {
                  width: 85.6mm;
                  height: 53.98mm;
                  margin: 0;
                  padding: 0;
                  page-break-after: always;
                  page-break-inside: avoid;
                }
                
                .card-image {
                  width: 100%;
                  height: 100%;
                  object-fit: fill;
                  page-break-inside: avoid;
                }
              }
              
              @media screen {
                body {
                  padding: 20px;
                  background: #f3f4f6;
                }
                
                .print-container {
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <img src="${dataUrl}" alt="Kartu Peminjaman HT" class="card-image" />
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      
    } catch (error) {
      console.error('Error printing card:', error);
      toast.error('Gagal mencetak kartu. Silakan coba lagi.');
    }
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[450px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">Kartu Peminjaman HT</DialogTitle>
          <p className="text-xs text-muted-foreground">Ukuran: 85.6mm x 53.98mm (Standar KTP Indonesia)</p>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Preview Card */}
          <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-auto">
            <div ref={kartuRef}>
              <KartuPeminjamanHT data={data} />
            </div>
          </div>
          
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Tips Cetak:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 ml-4 space-y-1 list-disc">
              <li>Gunakan kertas PVC untuk hasil terbaik</li>
              <li>Pilih orientasi <strong>Landscape (Horizontal)</strong></li>
              <li>Ukuran kertas: <strong>Custom 85.6mm x 53.98mm</strong></li>
              <li>Margin: <strong>None / 0mm</strong></li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto text-xs sm:text-sm">
              Tutup
            </Button>
            <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto text-xs sm:text-sm">
              Cetak
            </Button>
            <Button onClick={handleDownload} className="w-full sm:w-auto text-xs sm:text-sm">
              Unduh PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
