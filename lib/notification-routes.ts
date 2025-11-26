// Helper untuk mendapatkan route yang valid untuk notifikasi
export const getNotificationRoute = (
  type: string,
  status?: string,
  trackingStatus?: string,
  userRole?: string
): string => {
  // Super Admin Routes
  if (userRole === 'SUPER_ADMIN') {
    switch (type) {
      case 'peminjaman_baru':
        // PENDING → Persetujuan (butuh approval)
        // APPROVED/REJECTED → Satker (untuk monitoring)
        if (status === 'PENDING') {
          return '/dashboard/persetujuan';
        } else {
          return '/dashboard/satker';
        }
      
      case 'mutasi_baru':
        if (status === 'PENDING') {
          return '/dashboard/persetujuan';
        } else {
          return '/dashboard/riwayat-mutasi';
        }
      
      case 'pengembalian_baru':
        if (status === 'PENDING') {
          return '/dashboard/persetujuan';
        } else {
          return '/dashboard/riwayat';
        }
      
      case 'keterlambatan':
      case 'keterlambatan_paket_peminjaman':
        // Keterlambatan perlu ditangani di halaman persetujuan untuk follow up
        return '/dashboard/persetujuan';
      
      default:
        return '/dashboard';
    }
  }
  
  // Satker Admin Routes
  if (userRole === 'ADMIN_SATKER') {
    switch (type) {
      case 'peminjaman_baru':
        if (trackingStatus === 'SIAP_DIAMBIL') {
          return '/satker-admin/peminjaman';
        } else if (trackingStatus === 'SUDAH_DIKEMBALIKAN') {
          return '/satker-admin/riwayat-peminjaman';
        } else if (status === 'APPROVED' || status === 'REJECTED' || status === 'PENDING') {
          return '/satker-admin/pengajuan';
        }
        return '/satker-admin/pengajuan';
      
      case 'mutasi_baru':
        return '/satker-admin/personil';
      
      case 'pengembalian_baru':
        return '/satker-admin/riwayat-peminjaman';
      
      case 'keterlambatan_paket_peminjaman':
        return '/satker-admin/peminjaman';
      
      default:
        return '/satker-admin';
    }
  }
  
  // Default fallback
  return '/dashboard';
};

// Validasi apakah route valid
export const isValidRoute = (route: string): boolean => {
  const validRoutes = [
    // Super Admin routes
    '/dashboard',
    '/dashboard/persetujuan',
    '/dashboard/satker',
    '/dashboard/riwayat',
    '/dashboard/riwayat-mutasi',
    '/dashboard/inventaris',
    '/dashboard/personil',
    // Satker Admin routes
    '/satker-admin',
    '/satker-admin/pengajuan',
    '/satker-admin/peminjaman',
    '/satker-admin/riwayat-peminjaman',
    '/satker-admin/personil',
    '/satker-admin/inventaris',
  ];
  
  return validRoutes.includes(route);
};

// Get readable route name
export const getRouteName = (route: string): string => {
  const routeNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/persetujuan': 'Persetujuan',
    '/dashboard/satker': 'Manajemen Satker',
    '/dashboard/riwayat': 'Riwayat Peminjaman',
    '/dashboard/riwayat-mutasi': 'Riwayat Mutasi',
    '/dashboard/inventaris': 'Inventaris',
    '/dashboard/personil': 'Personil',
    '/satker-admin': 'Dashboard Satker',
    '/satker-admin/pengajuan': 'Pengajuan',
    '/satker-admin/peminjaman': 'Peminjaman',
    '/satker-admin/riwayat-peminjaman': 'Riwayat',
    '/satker-admin/personil': 'Personil',
    '/satker-admin/inventaris': 'Inventaris',
  };
  
  return routeNames[route] || route;
};
