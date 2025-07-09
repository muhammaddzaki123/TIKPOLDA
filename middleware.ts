// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Dapatkan token sesi dari request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Jika pengguna BELUM LOGIN dan mencoba mengakses halaman yang dilindungi
  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika pengguna SUDAH LOGIN
  if (token) {
    const role = token.role as string;

    // A. Jika mencoba mengakses halaman login/register, arahkan ke dashboard yang sesuai
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const dashboardUrl = role === 'SUPER_ADMIN' ? '/dashboard' : '/satker-admin';
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }

    // B. Jika SUPER_ADMIN mencoba akses halaman Admin Satker, arahkan kembali
    if (role === 'SUPER_ADMIN' && pathname.startsWith('/satker-admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // C. Jika ADMIN_SATKER mencoba akses halaman Super Admin, arahkan kembali
    if (role === 'ADMIN_SATKER' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/satker-admin', req.url));
    }
  }

  // Jika tidak ada kondisi di atas, lanjutkan ke halaman yang dituju
  return NextResponse.next();
}

// Konfigurasi path mana saja yang akan dijalankan oleh middleware ini
export const config = {
  matcher: [
    /*
     * Cocokkan semua path KECUALI yang dimulai dengan:
     * - api (API routes)
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file ikon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};