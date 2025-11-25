// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiLimiter } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';
import { securityService } from '@/lib/security';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Get client IP for rate limiting and logging
  const ip = securityService.getClientIp(req as unknown as Request);

  // Rate limiting untuk API endpoints (kecuali auth endpoints yang sudah punya limiter sendiri)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    try {
      await apiLimiter.check(60, `api_${ip}_${pathname}`); // 60 requests per minute per IP per endpoint
    } catch {
      securityLogger.logRateLimitExceeded(`api_${ip}`, pathname, ip);
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }
  }

  // Add no-cache headers for uploaded files
  if (pathname.startsWith('/api/uploads/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Jika pengguna SUDAH LOGIN
  if (token) {
    // Jika mencoba membuka halaman login/register, arahkan ke dashboard yang sesuai
    if (isAuthPage) {
      const dashboardUrl = token.role === 'SUPER_ADMIN' ? '/dashboard' : '/satker-admin';
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }

    // Jika SUPER_ADMIN mencoba akses halaman Admin Satker
    if (token.role === 'SUPER_ADMIN' && pathname.startsWith('/satker-admin')) {
      securityLogger.logUnauthorizedAccess(pathname, ip, {
        userId: token.id,
        role: token.role,
        attemptedAccess: 'satker-admin',
      });
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Jika ADMIN_SATKER mencoba akses halaman Super Admin
    if (token.role === 'ADMIN_SATKER' && pathname.startsWith('/dashboard')) {
      securityLogger.logUnauthorizedAccess(pathname, ip, {
        userId: token.id,
        role: token.role,
        attemptedAccess: 'dashboard',
      });
      return NextResponse.redirect(new URL('/satker-admin', req.url));
    }

    // Izinkan akses jika sudah login dan path-nya benar
    return NextResponse.next();
  }

  // Jika pengguna BELUM LOGIN dan mencoba mengakses halaman selain login/register
  if (!token && !isAuthPage) {
    securityLogger.logUnauthorizedAccess(pathname, ip, {
      reason: 'Not authenticated',
    });
    // Arahkan ke halaman login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Izinkan akses ke halaman login/register jika belum login
  return NextResponse.next();
}

// Konfigurasi matcher yang lebih sederhana dan aman
export const config = {
  matcher: [
    // Jalankan middleware pada semua path KECUALI yang ada di daftar di bawah
    '/((?!api|_next/static|_next/image|favicon.ico|gambarawal.svg|icon.svg).*)',
  ],
};