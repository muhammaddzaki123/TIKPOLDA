'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, RefreshCw, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from '@/lib/supabase/notifications';
import NotificationList from './NotificationList';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fungsi untuk mengambil notifikasi
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Ambil notifikasi saat komponen dimount
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      
      // Listen untuk custom event refresh dari komponen lain
      const handleRefresh = () => {
        fetchNotifications();
      };
      window.addEventListener('refreshNotifications', handleRefresh);
      
      return () => {
        window.removeEventListener('refreshNotifications', handleRefresh);
      };
    }
  }, [session, fetchNotifications]);

  // Fungsi untuk menandai notifikasi sebagai dibaca
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Update state lokal
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fungsi untuk menandai semua notifikasi sebagai dibaca
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        console.log('✅ Semua notifikasi telah ditandai dibaca');
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  // Fungsi untuk menghapus satu notifikasi
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/delete?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove dari state lokal
        setNotifications(prev => {
          const deletedNotif = prev.find(n => n.id === notificationId);
          if (deletedNotif && !deletedNotif.isRead) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          return prev.filter(notif => notif.id !== notificationId);
        });
        
        console.log('✅ Notifikasi telah dihapus');
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Fungsi untuk menghapus semua notifikasi
  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        console.log('✅ Semua notifikasi telah dihapus');
      }
    } catch (error) {
      console.error('❌ Error deleting all notifications:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session?.user || !isMounted) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 max-h-[500px] overflow-hidden p-0"
        sideOffset={5}
      >
        <div className="border-b p-4 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base">Notifikasi</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchNotifications}
                disabled={isLoading}
                className="text-xs text-slate-600 hover:text-slate-800 h-7 px-2"
                title="Refresh notifikasi"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteAllNotifications}
                  disabled={isDeleting}
                  className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 h-7 px-2"
                  title="Hapus semua notifikasi"
                >
                  <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? 'animate-pulse' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">
                {unreadCount} notifikasi belum dibaca
              </p>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-800 h-6 px-2"
              >
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </div>
        
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onDeleteNotification={deleteNotification}
          onRefresh={fetchNotifications}
          onNavigate={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
