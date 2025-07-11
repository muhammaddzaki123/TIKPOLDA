// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

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
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Jika ADMIN_SATKER mencoba akses halaman Super Admin
    if (token.role === 'ADMIN_SATKER' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/satker-admin', req.url));
    }

    // Izinkan akses jika sudah login dan path-nya benar
    return NextResponse.next();
  }

  // Jika pengguna BELUM LOGIN dan mencoba mengakses halaman selain login/register
  if (!token && !isAuthPage) {
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