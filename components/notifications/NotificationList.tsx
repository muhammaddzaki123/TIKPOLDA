'use client';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/lib/supabase/notifications';

interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onRefresh: () => void;
}

export default function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onRefresh
}: NotificationListProps) {
  
  const getNotificationIcon = (type: NotificationItem['type'], priority: NotificationItem['priority']) => {
    const iconClass = `h-4 w-4 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`;
    
    switch (type) {
      case 'peminjaman_baru':
        return <CheckCircle className={iconClass} />;
      case 'mutasi_baru':
        return <Info className={iconClass} />;
      case 'pengembalian_baru':
        return <RefreshCw className={iconClass} />;
      case 'keterlambatan':
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-slate-500 mt-2">Memuat notifikasi...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500 mb-3">Tidak ada notifikasi</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 border-l-4 transition-colors hover:bg-slate-50 cursor-pointer ${
            !notification.isRead ? getPriorityColor(notification.priority) : 'border-l-slate-200 bg-white'
          }`}
          onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type, notification.priority)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                  {notification.title}
                </p>
                {!notification.isRead && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </div>
              
              <p className={`text-xs mt-1 ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: id
                    })}
                  </span>
                </div>
                
                {notification.satkerName && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {notification.satkerName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="p-3 text-center border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh Notifikasi
        </Button>
      </div>
    </div>
  );
}

// Import Bell yang hilang
import { Bell } from 'lucide-react';
