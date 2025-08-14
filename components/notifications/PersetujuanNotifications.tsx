'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface PersetujuanNotificationsProps {
  pendingPeminjaman: number;
  pendingMutasi: number;
  pendingPengembalian: number;
  keterlambatan: number;
}

export default function PersetujuanNotifications({
  pendingPeminjaman,
  pendingMutasi,
  pendingPengembalian,
  keterlambatan
}: PersetujuanNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const newNotifications = [];

    if (pendingPeminjaman > 0) {
      newNotifications.push({
        id: 'pending-peminjaman',
        type: 'peminjaman',
        icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
        title: 'Pengajuan Peminjaman Baru',
        message: `${pendingPeminjaman} pengajuan peminjaman menunggu persetujuan`,
        count: pendingPeminjaman,
        priority: 'high',
        variant: 'default'
      });
    }

    if (pendingMutasi > 0) {
      newNotifications.push({
        id: 'pending-mutasi',
        type: 'mutasi',
        icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
        title: 'Pengajuan Mutasi Baru',
        message: `${pendingMutasi} pengajuan mutasi menunggu persetujuan`,
        count: pendingMutasi,
        priority: 'medium',
        variant: 'default'
      });
    }

    if (pendingPengembalian > 0) {
      newNotifications.push({
        id: 'pending-pengembalian',
        type: 'pengembalian',
        icon: <Clock className="h-4 w-4 text-green-600" />,
        title: 'Pengajuan Pengembalian Baru',
        message: `${pendingPengembalian} pengajuan pengembalian menunggu persetujuan`,
        count: pendingPengembalian,
        priority: 'medium',
        variant: 'default'
      });
    }

    if (keterlambatan > 0) {
      newNotifications.push({
        id: 'keterlambatan',
        type: 'keterlambatan',
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        title: 'Keterlambatan Pengembalian',
        message: `${keterlambatan} HT terlambat dikembalikan oleh satker`,
        count: keterlambatan,
        priority: 'high',
        variant: 'destructive'
      });
    }

    setNotifications(newNotifications);
  }, [pendingPeminjaman, pendingMutasi, pendingPengembalian, keterlambatan]);

  if (notifications.length === 0) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Tidak ada pengajuan yang menunggu persetujuan saat ini.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">
        Notifikasi Persetujuan
      </h3>
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={notification.variant}
          className="border-l-4 border-l-blue-500"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {notification.icon}
              <div>
                <div className="font-medium text-sm">
                  {notification.title}
                </div>
                <AlertDescription className="text-xs mt-1">
                  {notification.message}
                </AlertDescription>
              </div>
            </div>
            <Badge 
              variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
              className="ml-2"
            >
              {notification.count}
            </Badge>
          </div>
        </Alert>
      ))}
    </div>
  );
}
