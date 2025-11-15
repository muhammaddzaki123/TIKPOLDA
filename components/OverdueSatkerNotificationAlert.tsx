// components/OverdueSatkerNotificationAlert.tsx

'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface OverdueLoanPackage {
  id: string;
  satkerNama: string;
  keperluan: string;
  jumlahHT: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  tanggalReturn: string;
  trackingStatus: string;
  daysOverdue: number;
}

interface OverdueSatkerNotificationAlertProps {
  onNotificationCreated?: () => void;
}

export function OverdueSatkerNotificationAlert({ onNotificationCreated }: OverdueSatkerNotificationAlertProps) {
  const [overdueLoanPackages, setOverdueLoanPackages] = useState<OverdueLoanPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchOverdueLoanPackages = async () => {
      try {
        const response = await fetch('/api/notifications/overdue-satker');
        if (response.ok) {
          const data = await response.json();
          setOverdueLoanPackages(data.overdueLoanPackages || []);
          
          // Trigger callback jika ada notifikasi baru yang dibuat
          if (data.overdueLoanPackages && data.overdueLoanPackages.length > 0 && onNotificationCreated) {
            onNotificationCreated();
          }
        }
      } catch (error) {
        console.error('Error fetching overdue loan packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverdueLoanPackages();
    
    // Refresh setiap 5 menit
    const interval = setInterval(fetchOverdueLoanPackages, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [onNotificationCreated]);

  if (isLoading || overdueLoanPackages.length === 0 || isDismissed) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4 sm:mb-6 border-red-300 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm sm:text-base font-bold flex items-center justify-between">
        <span>⚠️ Peringatan: {overdueLoanPackages.length} Paket Peminjaman Belum Dikembalikan!</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={() => setIsDismissed(true)}
        >
          Tutup
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="text-xs sm:text-sm font-medium">
          Paket peminjaman berikut telah melewati batas waktu pengembalian dan perlu segera ditindaklanjuti:
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {overdueLoanPackages.map((loan) => (
            <div 
              key={loan.id} 
              className="bg-white border border-red-200 rounded-md p-2 sm:p-3 text-xs sm:text-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div className="flex-1">
                  <p className="font-bold text-red-900 flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {loan.satkerNama}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-700 mt-1">
                    Keperluan: <span className="font-medium">{loan.keperluan}</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-700">
                    Jumlah HT: <span className="font-bold">{loan.jumlahHT} unit</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Target pengembalian: {format(new Date(loan.tanggalReturn), 'dd MMM yyyy', { locale: id })}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    Status: <span className="font-medium">{loan.trackingStatus}</span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-red-100 border border-red-300 rounded px-2 py-1 text-center">
                    <p className="text-[10px] sm:text-xs text-red-700 font-bold">
                      Terlambat
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-red-900">
                      {loan.daysOverdue}
                    </p>
                    <p className="text-[10px] sm:text-xs text-red-700">
                      hari
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-red-200">
          <p className="text-[10px] sm:text-xs text-red-800 font-medium">
            💡 Tindakan: Segera hubungi admin satker terkait untuk menindaklanjuti pengembalian paket HT.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
