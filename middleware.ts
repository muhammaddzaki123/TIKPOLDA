import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
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

    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const dashboardUrl = role === 'SUPER_ADMIN' ? '/dashboard' : '/satker-admin';
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }

    if (role === 'SUPER_ADMIN' && pathname.startsWith('/satker-admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (role === 'ADMIN_SATKER' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/satker-admin', req.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi path mana saja yang akan dijalankan oleh middleware ini
export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|icon.svg|gambarawal.svg|favicon.ico).*)',
  ],
};