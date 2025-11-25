'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export default function ExportPengajuanSatkerButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export/pengajuan-satker', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export gagal');
      }

      // Ambil nama file dari header response
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `pengajuan-satker-${new Date().toISOString().split('T')[0]}.xlsx`;
      
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
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <FileDown className="mr-2 h-4 w-4" />
      {isExporting ? 'Mengexport...' : 'Export Excel'}
    </Button>
  );
}
