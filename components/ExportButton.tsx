// components/ExportButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  currentTab: 'gudang' | 'terdistribusi';
}

export default function ExportButton({ currentTab }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'gudang' | 'terdistribusi' | 'all') => {
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/export/inventaris?type=${type}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export gagal');
      }

      // Ambil nama file dari header response
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `inventaris-ht-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting}
          className="bg-green-600 text-white hover:bg-green-700 border-green-600"
        >
          {isExporting ? 'Mengexport...' : 'Export Excel'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={() => handleExport(currentTab)}
          className="cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-medium">
              Export Tab Aktif ({currentTab === 'gudang' ? 'Gudang' : 'Terdistribusi'})
            </span>
            <span className="text-xs text-gray-500">
              Export data yang sedang ditampilkan
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('gudang')}
          className="cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-medium">Export Inventaris Gudang</span>
            <span className="text-xs text-gray-500">
              Export semua HT di gudang pusat
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('terdistribusi')}
          className="cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-medium">Export Inventaris Terdistribusi</span>
            <span className="text-xs text-gray-500">
              Export semua HT yang sudah terdistribusi
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('all')}
          className="cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-medium">Export Semua Data</span>
            <span className="text-xs text-gray-500">
              Export seluruh inventaris HT
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
