'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationData {
  pendingPeminjaman: number;
  pendingMutasi: number;
  pendingPengembalian: number;
  keterlambatan: number;
  mendekatiDeadline: number;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [data, setData] = useState<NotificationData>({
    pendingPeminjaman: 0,
    pendingMutasi: 0,
    pendingPengembalian: 0,
    keterlambatan: 0,
    mendekatiDeadline: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotificationData = async () => {
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
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotificationData();
      
      // Refresh setiap 60 detik
      const interval = setInterval(fetchNotificationData, 60000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  return {
    data,
    isLoading,
    refresh: fetchNotificationData
  };
}
