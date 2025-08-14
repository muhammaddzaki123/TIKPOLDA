'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface PengajuanNotificationsProps {
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

export default function PengajuanNotifications({
  approvedCount,
  rejectedCount,
  pendingCount
}: PengajuanNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const newNotifications = [];

    if (approvedCount > 0) {
      newNotifications.push({
        id: 'approved-requests',
        type: 'approved',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        title: 'Pengajuan Disetujui',
        message: `${approvedCount} pengajuan telah disetujui dalam 7 hari terakhir`,
        count: approvedCount,
        priority: 'high',
        variant: 'default',
        borderColor: 'border-l-green-500'
      });
    }

    if (rejectedCount > 0) {
      newNotifications.push({
        id: 'rejected-requests',
        type: 'rejected',
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        title: 'Pengajuan Ditolak',
        message: `${rejectedCount} pengajuan ditolak dalam 7 hari terakhir`,
        count: rejectedCount,
        priority: 'medium',
        variant: 'destructive',
        borderColor: 'border-l-red-500'
      });
    }

    if (pendingCount > 0) {
      newNotifications.push({
        id: 'pending-requests',
        type: 'pending',
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        title: 'Pengajuan Menunggu',
        message: `${pendingCount} pengajuan masih menunggu persetujuan`,
        count: pendingCount,
        priority: 'medium',
        variant: 'default',
        borderColor: 'border-l-yellow-500'
      });
    }

    setNotifications(newNotifications);
  }, [approvedCount, rejectedCount, pendingCount]);

  if (notifications.length === 0) {
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Tidak ada update pengajuan terbaru.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">
        Status Pengajuan Terbaru
      </h3>
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={notification.variant}
          className={`border-l-4 ${notification.borderColor}`}
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
              variant={
                notification.type === 'approved' ? 'default' :
                notification.type === 'rejected' ? 'destructive' : 'secondary'
              }
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
