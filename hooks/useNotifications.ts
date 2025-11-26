'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationData {
  pendingPeminjaman: number;
  pendingMutasi: number;
  pendingPengembalian: number;
  keterlambatan: number;
  mendekatiDeadline: number;
  pengembalianMasuk: number;
  pengembalianDisetujui: number;
  pengembalianDitolak: number;
  pengembalianPending: number;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [data, setData] = useState<NotificationData>({
    pendingPeminjaman: 0,
    pendingMutasi: 0,
    pendingPengembalian: 0,
    keterlambatan: 0,
    mendekatiDeadline: 0,
    pengembalianMasuk: 0,
    pengembalianDisetujui: 0,
    pengembalianDitolak: 0,
    pengembalianPending: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotificationData = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/counts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching notification data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fungsi untuk menghapus notifikasi
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/delete?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data setelah hapus
        await fetchNotificationData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, [fetchNotificationData]);

  // Fungsi untuk menghapus semua notifikasi
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data setelah hapus
        await fetchNotificationData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }, [fetchNotificationData]);

  useEffect(() => {
    if (session?.user) {
      fetchNotificationData();
      
      // Refresh setiap 60 detik
      const interval = setInterval(fetchNotificationData, 60000);
      
      return () => clearInterval(interval);
    }
  }, [session, fetchNotificationData]);

  return {
    data,
    isLoading,
    refresh: fetchNotificationData,
    deleteNotification,
    deleteAllNotifications
  };
}
