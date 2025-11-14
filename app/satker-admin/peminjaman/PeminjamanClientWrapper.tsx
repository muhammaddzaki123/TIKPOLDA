// app/satker-admin/peminjaman/PeminjamanClientWrapper.tsx

'use client';

import { OverdueNotificationAlert } from '@/components/OverdueNotificationAlert';
import { PeminjamanForm } from '@/components/PeminjamanForm';
import { PengembalianTable } from '@/components/PengembalianTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { HT, Personil, Peminjaman } from '@prisma/client';
import { useCallback } from 'react';

type PeminjamanAktif = (Peminjaman & { 
  ht: HT; 
  personil: Personil; 
  estimasiKembali: Date | null;
});

interface PeminjamanClientWrapperProps {
  htDipinjam: PeminjamanAktif[];
  htTersedia: HT[];
  personilList: Personil[];
}

export function PeminjamanClientWrapper({ 
  htDipinjam, 
  htTersedia, 
  personilList 
}: PeminjamanClientWrapperProps) {
  
  const handleNotificationCreated = useCallback(() => {
    // Trigger custom event untuk refresh NotificationBell
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }
  }, []);

  return (
    <>
      {/* Notifikasi HT Terlambat */}
      <OverdueNotificationAlert onNotificationCreated={handleNotificationCreated} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Kolom Kiri: Form Peminjaman */}
        <div className="lg:col-span-1">
          <PeminjamanForm htTersedia={htTersedia} personilList={personilList} />
        </div>

        {/* Kolom Kanan: Tabel Pengembalian */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Daftar HT Sedang Dipinjam</CardTitle>
            </CardHeader>
            <CardContent>
              <PengembalianTable data={htDipinjam} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
