'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface PeminjamanNotificationsProps {
  keterlambatan: number;
  mendekatiDeadline: number;
  pengajuanUpdated: number;
}

export default function PeminjamanNotifications({
  keterlambatan,
  mendekatiDeadline,
  pengajuanUpdated
}: PeminjamanNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const newNotifications = [];

    if (pengajuanUpdated > 0) {
      newNotifications.push({
        id: 'pengajuan-updated',
        type: 'update',
        icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
        title: 'Status Pengajuan Diperbarui',
        message: `${pengajuanUpdated} pengajuan telah diperbarui statusnya`,
        count: pengajuanUpdated,
        priority: 'medium',
        variant: 'default'
      });
    }

    if (keterlambatan > 0) {
      newNotifications.push({
        id: 'keterlambatan-internal',
        type: 'keterlambatan',
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        title: 'Keterlambatan Pengembalian Internal',
        message: `${keterlambatan} HT terlambat dikembalikan oleh personil`,
        count: keterlambatan,
        priority: 'high',
        variant: 'destructive'
      });
    }

    if (mendekatiDeadline > 0) {
      newNotifications.push({
        id: 'mendekati-deadline',
        type: 'deadline',
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        title: 'Mendekati Batas Pengembalian',
        message: `${mendekatiDeadline} HT harus dikembalikan dalam 3 hari`,
        count: mendekatiDeadline,
        priority: 'medium',
        variant: 'default'
      });
    }

    setNotifications(newNotifications);
  }, [keterlambatan, mendekatiDeadline, pengajuanUpdated]);

  if (notifications.length === 0) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Semua peminjaman dalam kondisi baik. Tidak ada keterlambatan atau deadline yang mendekat.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">
        Notifikasi Peminjaman
      </h3>
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={notification.variant}
          className={`border-l-4 ${
            notification.priority === 'high' 
              ? 'border-l-red-500' 
              : notification.priority === 'medium'
              ? 'border-l-yellow-500'
              : 'border-l-blue-500'
          }`}
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
