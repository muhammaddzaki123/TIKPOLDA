// components/OverdueNotificationAlert.tsx

'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface OverdueLoan {
  id: string;
  htSerialNumber: string;
  personilNama: string;
  personilNrp: string;
  tanggalPinjam: string;
  estimasiKembali: string;
  daysOverdue: number;
}

export function OverdueNotificationAlert() {
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchOverdueLoans = async () => {
      try {
        const response = await fetch('/api/notifications/overdue');
        if (response.ok) {
          const data = await response.json();
          setOverdueLoans(data.overdueLoans || []);
        }
      } catch (error) {
        console.error('Error fetching overdue loans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverdueLoans();
    
    // Refresh setiap 5 menit
    const interval = setInterval(fetchOverdueLoans, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading || overdueLoans.length === 0 || isDismissed) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4 sm:mb-6 border-red-300 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm sm:text-base font-bold flex items-center justify-between">
        <span>⚠️ Peringatan: {overdueLoans.length} HT Belum Dikembalikan!</span>
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
          HT berikut telah melewati batas waktu pengembalian dan perlu segera ditindaklanjuti:
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {overdueLoans.map((loan) => (
            <div 
              key={loan.id} 
              className="bg-white border border-red-200 rounded-md p-2 sm:p-3 text-xs sm:text-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div className="flex-1">
                  <p className="font-bold text-red-900">
                    {loan.htSerialNumber}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-700">
                    Peminjam: <span className="font-medium">{loan.personilNama}</span> ({loan.personilNrp})
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Estimasi kembali: {format(new Date(loan.estimasiKembali), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-block px-2 py-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded">
                    Terlambat {loan.daysOverdue} hari
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] sm:text-xs font-semibold text-red-800 mt-3">
          💡 Tindakan: Segera hubungi personil untuk mengembalikan atau perpanjang peminjaman dengan mengupdate SPRINT.
        </p>
      </AlertDescription>
    </Alert>
  );
}
