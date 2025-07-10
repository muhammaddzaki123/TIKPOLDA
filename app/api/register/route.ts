// app/api/register/route.ts

import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Cek dulu apakah sudah ada pengguna di database
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { message: 'Registrasi Super Admin sudah ditutup.' },
        { status: 403 } // 403 Forbidden
      );
    }

    const { nama, email, password } = await req.json();

    if (!nama || !email || !password) {
      return NextResponse.json(
        { message: 'Semua kolom wajib diisi.' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const superAdmin = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    });

    return NextResponse.json(superAdmin, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Email sudah digunakan.' },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}