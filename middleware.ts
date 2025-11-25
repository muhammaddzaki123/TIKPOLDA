// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Edge Runtime compatible - no Node.js modules
const getClientIp = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
};

// Simple in-memory rate limiter for Edge Runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Get client IP for rate limiting
  const ip = getClientIp(req);

  // Rate limiting untuk API endpoints (kecuali auth endpoints)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const allowed = checkRateLimit(`api_${ip}_${pathname}`, 60, 60000); // 60 per minute
    
    if (!allowed) {
      console.warn(`[SECURITY] Rate limit exceeded: ${ip} - ${pathname}`);
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
      console.warn(`[SECURITY] Unauthorized access attempt: ${token.id} - ${pathname}`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Jika ADMIN_SATKER mencoba akses halaman Super Admin
    if (token.role === 'ADMIN_SATKER' && pathname.startsWith('/dashboard')) {
      console.warn(`[SECURITY] Unauthorized access attempt: ${token.id} - ${pathname}`);
      return NextResponse.redirect(new URL('/satker-admin', req.url));
    }

    // Izinkan akses jika sudah login dan path-nya benar
    return NextResponse.next();
  }

  // Jika pengguna BELUM LOGIN dan mencoba mengakses halaman selain login/register
  if (!token && !isAuthPage) {
    console.warn(`[SECURITY] Unauthorized access: ${ip} - ${pathname}`);
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