'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  Bell, 
  PackageCheck, 
  PackageX, 
  PackagePlus,
  Truck,
  Package,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/lib/supabase/notifications';
import { useState } from 'react';
import { isValidRoute, getRouteName } from '@/lib/notification-routes';

interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onDeleteNotification: (notificationId: string) => void;
  onRefresh: () => void;
  onNavigate?: () => void; // Callback untuk menutup dropdown setelah navigate
}

export default function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onDeleteNotification,
  onRefresh,
  onNavigate
}: NotificationListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  
  // Handler untuk klik notifikasi - gunakan link yang sudah disediakan dari API
  const handleNotificationClick = async (notification: NotificationItem) => {
    // Validasi link ada
    if (!notification.link || notification.link === '') {
      console.error('❌ Notification missing link:', notification);
      return;
    }

    // Validasi link valid
    if (!isValidRoute(notification.link)) {
      console.error('❌ Invalid notification route:', notification.link);
      return;
    }

    try {
      setNavigatingId(notification.id);
      
      // Mark as read jika belum dibaca
      if (!notification.isRead) {
        await onMarkAsRead(notification.id);
      }
      
      // Log untuk debugging
      console.log('✅ Navigating to:', notification.link, '- Target:', getRouteName(notification.link));
      
      // Tutup dropdown jika callback tersedia
      if (onNavigate) {
        onNavigate();
      }
      
      // Navigate ke halaman tujuan menggunakan link dari API
      router.push(notification.link);
      
      // Reset setelah delay singkat
      setTimeout(() => setNavigatingId(null), 1000);
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
      setNavigatingId(null);
    }
  };

  // Handler untuk hapus notifikasi
  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent navigation when deleting
    setDeletingId(notificationId);
    
    try {
      await onDeleteNotification(notificationId);
      console.log('✅ Notifikasi berhasil dihapus');
    } catch (error) {
      console.error('❌ Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };
  
  const getNotificationIcon = (type: NotificationItem['type'], priority: NotificationItem['priority'], title: string) => {
    // Tentukan warna berdasarkan status di title
    let colorClass = 'text-yellow-500'; // Default: kuning (pending/proses)
    
    if (title.includes('Disetujui') || title.includes('Diterima') || title.includes('Siap') || title.includes('Berhasil')) {
      colorClass = 'text-green-500'; // Hijau untuk approved/siap
    } else if (title.includes('Ditolak')) {
      colorClass = 'text-red-500'; // Merah untuk rejected
    } else if (type === 'keterlambatan' || type === 'keterlambatan_paket_peminjaman') {
      colorClass = 'text-red-500'; // Merah untuk keterlambatan
    } else if (title.includes('Terlambat')) {
      colorClass = 'text-red-500'; // Merah untuk keterlambatan
    } else if (title.includes('Masuk') || title.includes('Baru')) {
      colorClass = 'text-blue-500'; // Biru untuk masuk/baru
    } else if (title.includes('Diproses')) {
      colorClass = 'text-blue-500'; // Biru untuk sedang diproses
    } else if (title.includes('Digunakan')) {
      colorClass = 'text-orange-500'; // Orange untuk sedang digunakan
    }
    
    const iconClass = `h-4 w-4 ${colorClass}`;
    
    // Icon khusus untuk status tracking peminjaman
    if (type === 'peminjaman_baru') {
      if (title.includes('Siap Diambil')) {
        return <Truck className={iconClass} />;
      } else if (title.includes('Sedang Digunakan')) {
        return <Package className={iconClass} />;
      } else if (title.includes('Berhasil Dikembalikan')) {
        return <PackageCheck className={iconClass} />;
      } else if (title.includes('Sedang Diproses')) {
        return <RefreshCw className={iconClass} />;
      } else if (title.includes('Disetujui')) {
        return <CheckCircle className={iconClass} />;
      } else if (title.includes('Ditolak')) {
        return <AlertCircle className={iconClass} />;
      }
      return <CheckCircle className={iconClass} />;
    }
    
    // Icon khusus untuk pengembalian
    if (type === 'pengembalian_baru') {
      if (title.includes('Disetujui') || title.includes('Diterima')) {
        return <PackageCheck className={iconClass} />;
      } else if (title.includes('Ditolak')) {
        return <PackageX className={iconClass} />;
      } else if (title.includes('Masuk') || title.includes('Baru')) {
        return <PackagePlus className={iconClass} />;
      }
      return <RefreshCw className={iconClass} />;
    }
    
    switch (type) {
      case 'mutasi_baru':
        return <Info className={iconClass} />;
      case 'keterlambatan':
      case 'keterlambatan_paket_peminjaman':
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority'], title: string) => {
    // Warna border dan background berdasarkan status
    if (title.includes('Terlambat')) {
      return 'border-l-red-500 bg-red-50';
    } else if (title.includes('Disetujui') || title.includes('Diterima') || title.includes('Siap') || title.includes('Berhasil')) {
      return 'border-l-green-500 bg-green-50';
    } else if (title.includes('Ditolak')) {
      return 'border-l-red-500 bg-red-50';
    } else if (title.includes('Masuk') || title.includes('Baru') || title.includes('Diproses')) {
      return 'border-l-blue-500 bg-blue-50';
    } else if (title.includes('Digunakan')) {
      return 'border-l-orange-500 bg-orange-50';
    } else {
      return 'border-l-yellow-500 bg-yellow-50'; // Pending/proses
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
    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 border-l-4 transition-all hover:bg-slate-50 relative group ${
            !notification.isRead ? getPriorityColor(notification.priority, notification.title) : 'border-l-slate-200 bg-white'
          } ${navigatingId === notification.id ? 'opacity-50' : ''}`}
        >
          <div 
            className="flex items-start space-x-3 cursor-pointer pr-8"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex-shrink-0 mt-0.5">
              {navigatingId === notification.id ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                getNotificationIcon(notification.type, notification.priority, notification.title)
              )}
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
              
              <p className={`text-xs mt-1 line-clamp-2 ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
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
                
                <div className="flex items-center gap-2">
                  {notification.satkerName && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                      {notification.satkerName}
                    </span>
                  )}
                  {notification.link && isValidRoute(notification.link) && (
                    <span 
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full" 
                      title={`Tujuan: ${getRouteName(notification.link)}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden sm:inline">{getRouteName(notification.link)}</span>
                    </span>
                  )}
                  {notification.link && !isValidRoute(notification.link) && (
                    <span 
                      className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full" 
                      title="Link tidak valid"
                    >
                      ⚠️
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Delete button - muncul saat hover */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteNotification(e, notification.id)}
            disabled={deletingId === notification.id || navigatingId === notification.id}
            className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
            title="Hapus notifikasi"
          >
            {deletingId === notification.id ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ))}
      
      <div className="p-3 text-center border-t bg-slate-50 sticky bottom-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Notifikasi
        </Button>
      </div>
    </div>
  );
}


