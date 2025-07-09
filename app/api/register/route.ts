// app/api/register/route.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { nama, email, password } = await req.json();

    if (!nama || !email || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);

    // Cek apakah sudah ada user di database
    const userCount = await prisma.user.count();

    // Jika belum ada user, user pertama akan menjadi SUPER_ADMIN
    // Jika sudah ada, user baru akan menjadi ADMIN_SATKER (default)
    const role = userCount === 0 ? 'SUPER_ADMIN' : 'ADMIN_SATKER';

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    // Handle error jika email sudah ada
    if (error.code === 'P2002') {
        return new NextResponse('Email sudah terdaftar', { status: 409 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}