// hooks/useAutoRefresh.ts

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook untuk auto-refresh data secara periodik
 * @param intervalMs - Interval refresh dalam milidetik (default: 30000ms = 30 detik)
 * @param enabled - Enable/disable auto refresh (default: true)
 */
export function useAutoRefresh(intervalMs: number = 30000, enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    // Set interval untuk refresh
    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    // Cleanup interval saat unmount
    return () => clearInterval(interval);
  }, [router, intervalMs, enabled]);
}

/**
 * Hook untuk refresh on focus (ketika user kembali ke tab)
 */
export function useRefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };

    // Refresh ketika user kembali ke tab
    window.addEventListener('focus', handleFocus);
    
    // Juga refresh ketika visibility berubah
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [router]);
}
