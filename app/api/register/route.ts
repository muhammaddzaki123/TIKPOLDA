// app/api/register/route.ts

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { securityLogger } from '@/lib/logger';
import { securityService } from '@/lib/security';
import { strictLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // Rate limiting - hanya 3 registrasi per jam per IP
    const ip = securityService.getClientIp(req);
    try {
      await strictLimiter.check(3, `register_${ip}`);
    } catch {
      securityLogger.logRateLimitExceeded(`register_${ip}`, '/api/register', ip);
      return NextResponse.json(
        { message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    // Cek dulu apakah sudah ada pengguna di database
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      securityLogger.logUnauthorizedAccess('/api/register', ip, {
        reason: 'Registration already closed',
      });
      return NextResponse.json(
        { message: 'Registrasi Super Admin sudah ditutup.' },
        { status: 403 } // 403 Forbidden
      );
    }

    const body = await req.json();

    // Validasi input menggunakan Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        { 
          message: 'Validasi gagal',
          errors 
        },
        { status: 400 }
      );
    }

    const { nama, email, password } = validation.data;

    // Double-check password strength
    const passwordCheck = securityService.validatePasswordStrength(password);
    if (!passwordCheck.isStrong) {
      return NextResponse.json(
        { 
          message: 'Password tidak cukup kuat',
          weaknesses: passwordCheck.weaknesses
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12); // Increased from 10 to 12

    const superAdmin = await prisma.user.create({
      data: {
        nama,
        email: email.toLowerCase(), // Normalize email
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    });

    securityLogger.logSuccessfulLogin(superAdmin.id, superAdmin.email, ip);

    // Don't return password in response
    const { password: _pwd, ...userWithoutPassword } = superAdmin;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { message: 'Email sudah digunakan.' },
        { status: 409 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}