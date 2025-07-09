// app/dashboard/admin/actions.ts

'use server';

import { PrismaClient, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

// Inisialisasi Prisma Client untuk berinteraksi dengan database
const prisma = new PrismaClient();

export async function addAdminSatker(formData: FormData) {
  const nama = formData.get('nama') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validasi dasar untuk memastikan semua field terisi
  if (!nama || !email || !password) {
    throw new Error('Nama, email, dan password wajib diisi.');
  }

  // Melakukan hashing pada password sebelum disimpan ke database
  const hashedPassword = await hash(password, 10);

  try {
    // Membuat user baru di database
    await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: Role.ADMIN_SATKER, 
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Email sudah terdaftar. Gunakan email lain.');
    }

    console.error('Gagal membuat akun admin:', error);
    throw new Error('Terjadi kesalahan saat membuat akun admin.');
  }

  revalidatePath('/dashboard/admin');
}

export async function resetPassword(formData: FormData) {
  const userId = formData.get('userId') as string;
  const newPassword = formData.get('newPassword') as string;

  // Validasi dasar
  if (!userId || !newPassword) {
    throw new Error('ID Pengguna dan Password baru tidak boleh kosong.');
  }

  // Melakukan hashing pada password baru
  const hashedPassword = await hash(newPassword, 10);

  try {
    // Memperbarui password user di database berdasarkan ID-nya
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error('Gagal mereset password:', error);
    throw new Error('Terjadi kesalahan saat mereset password.');
  }

  // Memuat ulang data di halaman admin
  revalidatePath('/dashboard/admin');
}

export async function deleteAdmin(formData: FormData) {
  const userId = formData.get('userId') as string;

  if (!userId) {
    throw new Error('ID Pengguna tidak ditemukan.');
  }

  try {
    // Menghapus user dari database berdasarkan ID
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error('Gagal menghapus admin:', error);
    throw new Error('Terjadi kesalahan saat menghapus akun admin.');
  }

  // Memuat ulang data di halaman admin
  revalidatePath('/dashboard/admin');
}
