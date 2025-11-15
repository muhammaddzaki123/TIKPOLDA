'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCheck, PackageX, PackagePlus, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface PengembalianNotificationsProps {
  pengembalianMasuk?: number;
  pengembalianDisetujui?: number;
  pengembalianDitolak?: number;
  pengembalianPending?: number;
}

export default function PengembalianNotifications({
  pengembalianMasuk = 0,
  pengembalianDisetujui = 0,
  pengembalianDitolak = 0,
  pengembalianPending = 0
}: PengembalianNotificationsProps) {
  const router = useRouter();

  interface Notification {
    id: string;
    type: string;
    icon: React.ReactNode;
    title: string;
    message: string;
    count: number;
    priority: 'high' | 'medium' | 'low';
    variant: 'default' | 'destructive';
    borderColor: string;
    link: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Notifikasi Pengembalian Masuk (untuk admin - pending approval)
    if (pengembalianMasuk > 0) {
      newNotifications.push({
        id: 'pengembalian-masuk',
        type: 'masuk',
        icon: <PackagePlus className="h-4 w-4 text-blue-600" />,
        title: 'Pengembalian HT Masuk',
        message: `${pengembalianMasuk} pengajuan pengembalian HT baru menunggu persetujuan`,
        count: pengembalianMasuk,
        priority: 'high',
        variant: 'default',
        borderColor: 'border-l-blue-500',
        link: '/dashboard/persetujuan'
      });
    }

    // Notifikasi Pengembalian Disetujui (untuk satker)
    if (pengembalianDisetujui > 0) {
      newNotifications.push({
        id: 'pengembalian-disetujui',
        type: 'disetujui',
        icon: <PackageCheck className="h-4 w-4 text-green-600" />,
        title: 'Pengembalian HT Diterima',
        message: `${pengembalianDisetujui} pengembalian HT telah diterima dalam 7 hari terakhir`,
        count: pengembalianDisetujui,
        priority: 'medium',
        variant: 'default',
        borderColor: 'border-l-green-500',
        link: '/satker-admin/riwayat-peminjaman'
      });
    }

    // Notifikasi Pengembalian Ditolak (untuk satker)
    if (pengembalianDitolak > 0) {
      newNotifications.push({
        id: 'pengembalian-ditolak',
        type: 'ditolak',
        icon: <PackageX className="h-4 w-4 text-red-600" />,
        title: 'Pengembalian HT Ditolak',
        message: `${pengembalianDitolak} pengembalian HT ditolak dalam 7 hari terakhir`,
        count: pengembalianDitolak,
        priority: 'high',
        variant: 'destructive',
        borderColor: 'border-l-red-500',
        link: '/satker-admin/riwayat-peminjaman'
      });
    }

    // Notifikasi Pengembalian Pending (untuk satker)
    if (pengembalianPending > 0) {
      newNotifications.push({
        id: 'pengembalian-pending',
        type: 'pending',
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        title: 'Pengembalian Menunggu',
        message: `${pengembalianPending} pengajuan pengembalian masih menunggu konfirmasi`,
        count: pengembalianPending,
        priority: 'medium',
        variant: 'default',
        borderColor: 'border-l-yellow-500',
        link: '/satker-admin/riwayat-peminjaman'
      });
    }

    setNotifications(newNotifications);
  }, [pengembalianMasuk, pengembalianDisetujui, pengembalianDitolak, pengembalianPending]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">
        Notifikasi Pengembalian HT
      </h3>
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={notification.variant}
          className={`border-l-4 cursor-pointer hover:bg-slate-50 transition-colors ${notification.borderColor}`}
          onClick={() => router.push(notification.link)}
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
                notification.type === 'disetujui' ? 'default' :
                notification.type === 'ditolak' ? 'destructive' : 
                notification.type === 'masuk' ? 'default' : 'secondary'
              }
              className={
                notification.type === 'disetujui' ? 'bg-green-500' :
                notification.type === 'masuk' ? 'bg-blue-500' : ''
              }
            >
              {notification.count}
            </Badge>
          </div>
        </Alert>
      ))}
    </div>
  );
}
