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
  Package
} from 'lucide-react';
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
  const router = useRouter();
  
  // Fungsi untuk menentukan link redirect berdasarkan tipe notifikasi
  const getNotificationLink = (notification: NotificationItem): string => {
    const { type, title } = notification;
    
    // PEMINJAMAN - Pengajuan Peminjaman dari Satker ke Pusat
    if (type === 'peminjaman_baru') {
      // Untuk Super Admin - Pengajuan yang perlu disetujui
      if (title.includes('Pengajuan Peminjaman Baru') || title.includes('Menunggu')) {
        return '/dashboard/persetujuan'; // Tab Peminjaman di halaman persetujuan
      }
      
      // Untuk Satker Admin - Status pengajuan mereka
      if (title.includes('Disetujui') || title.includes('Ditolak')) {
        return '/satker-admin/pengajuan'; // Lihat status pengajuan yang sudah diproses
      }
      
      // Untuk Satker Admin - Tracking peminjaman aktif
      if (title.includes('Siap Diambil') || title.includes('Sedang Digunakan')) {
        return '/satker-admin/peminjaman'; // Halaman peminjaman aktif satker
      }
      
      // Untuk Satker Admin - Pengembalian yang sudah selesai
      if (title.includes('Berhasil Dikembalikan') || title.includes('Dikembalikan')) {
        return '/satker-admin/riwayat-peminjaman'; // Lihat riwayat pengembalian
      }
    }
    
    // MUTASI - Pengajuan Mutasi Personil
    if (type === 'mutasi_baru') {
      // Untuk Super Admin - Pengajuan mutasi yang perlu disetujui
      if (title.includes('Pengajuan Mutasi Baru') || title.includes('Menunggu')) {
        return '/dashboard/persetujuan'; // Tab Mutasi di halaman persetujuan
      }
      
      // Untuk tracking mutasi yang sudah diproses (disetujui/ditolak)
      if (title.includes('Disetujui') || title.includes('Ditolak')) {
        return '/dashboard/riwayat-mutasi'; // Halaman riwayat mutasi
      }
    }
    
    // PENGEMBALIAN - Pengajuan Pengembalian HT dari Satker
    if (type === 'pengembalian_baru') {
      // Untuk Super Admin - Pengembalian yang perlu disetujui
      if (title.includes('Pengembalian HT Masuk') || title.includes('Menunggu')) {
        return '/dashboard/persetujuan'; // Tab Pengembalian di halaman persetujuan
      }
      
      // Untuk Satker Admin - Status pengembalian mereka
      if (title.includes('Diterima') || title.includes('Disetujui')) {
        return '/satker-admin/riwayat-peminjaman'; // Lihat pengembalian yang diterima
      }
      
      if (title.includes('Ditolak')) {
        return '/satker-admin/riwayat-peminjaman'; // Lihat pengembalian yang ditolak
      }
    }
    
    // KETERLAMBATAN - Untuk Super Admin
    if (type === 'keterlambatan') {
      // Keterlambatan peminjaman Satker (Pusat ke Satker)
      return '/dashboard/satker'; // Halaman monitoring satker yang telat mengembalikan
    }
    
    // KETERLAMBATAN PAKET - Untuk Satker Admin
    if (type === 'keterlambatan_paket_peminjaman') {
      // Keterlambatan peminjaman internal (Satker ke Personil)
      return '/satker-admin/peminjaman'; // Halaman peminjaman internal satker
    }
    
    // TRACKING UPDATE - Update status peminjaman
    if (type === 'tracking_update') {
      return '/satker-admin/peminjaman'; // Tracking peminjaman aktif
    }
    
    // Default fallback - redirect ke dashboard yang sesuai
    // Jika tidak bisa menentukan, arahkan ke dashboard utama
    return '/dashboard';
  };
  
  // Handler untuk klik notifikasi
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read jika belum dibaca
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate ke halaman tujuan
    const targetUrl = getNotificationLink(notification);
    router.push(targetUrl);
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
    <div className="divide-y divide-slate-100">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 border-l-4 transition-colors hover:bg-slate-50 cursor-pointer ${
            !notification.isRead ? getPriorityColor(notification.priority, notification.title) : 'border-l-slate-200 bg-white'
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type, notification.priority, notification.title)}
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


