// app/api/auth/login-rate-limit/route.ts

import { NextResponse } from 'next/server';
import { loginLimiter } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';
import { securityService } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const ip = securityService.getClientIp(req);

    // Rate limiting - 5 attempts per 15 minutes
    try {
      await loginLimiter.check(5, `login_${ip}_${email}`);
    } catch {
      securityLogger.logRateLimitExceeded(`login_${email}`, '/api/auth/login', ip);
      return NextResponse.json(
        { 
          error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
          rateLimited: true 
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login rate limit check error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
