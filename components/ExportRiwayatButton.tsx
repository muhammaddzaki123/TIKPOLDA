// components/ExportRiwayatButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export default function ExportRiwayatButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export/riwayat', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export gagal');
      }

      // Ambil nama file dari header response
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `riwayat-peminjaman-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response ke blob
      const blob = await response.blob();
      
      // Buat URL untuk download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Gagal mengexport data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      className="w-full bg-green-600 text-white hover:bg-green-700 border-green-600 sm:w-auto text-xs sm:text-sm"
    >
      <FileDown className="mr-2 h-4 w-4" />
      {isExporting ? 'Mengexport...' : (
        <>
          <span className="hidden sm:inline">Export Excel</span>
          <span className="sm:hidden">Export</span>
        </>
      )}
    </Button>
  );
}
