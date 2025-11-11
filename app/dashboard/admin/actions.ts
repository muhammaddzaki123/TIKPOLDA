// app/dashboard/admin/actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

/**
 * Aksi untuk menambah Admin Satker baru beserta entitas Satker-nya.
 */
export async function addAdminSatker(formData: FormData) {
  const namaAdmin = formData.get('namaAdmin') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const kodeSatker = formData.get('kodeSatker') as string;
  const namaSatker = formData.get('namaSatker') as string;

  if (!namaAdmin || !email || !password || !kodeSatker || !namaSatker) {
    throw new Error('Semua kolom wajib diisi.');
  }

  // Pre-validation: Cek apakah kode satker atau email sudah ada
  const [existingSatker, existingUser] = await Promise.all([
    prisma.satker.findUnique({ where: { kode: kodeSatker } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (existingSatker) {
    throw new Error('Gagal: Kode Satker sudah terdaftar.');
  }

  if (existingUser) {
    throw new Error('Gagal: Email sudah terdaftar.');
  }

  const hashedPassword = await hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const newSatker = await tx.satker.create({
        data: { kode: kodeSatker, nama: namaSatker },
      });

      await tx.user.create({
        data: {
          nama: namaAdmin,
          email,
          password: hashedPassword,
          role: Role.ADMIN_SATKER,
          satkerId: newSatker.id,
        },
      });
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      typeof error.meta === 'object' &&
      error.meta !== null &&
      'target' in error.meta
    ) {
      const target = error.meta.target as string[];
      if (target?.includes('email')) throw new Error('Gagal: Email sudah terdaftar.');
      if (target?.includes('kode')) throw new Error('Gagal: Kode Satker sudah terdaftar.');
    }
    console.error(error);
    throw new Error('Terjadi kesalahan saat membuat akun dan Satker.');
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/satker');
}

/**
 * AKSI BARU: Mengupdate data Admin Satker dan Satker terkait.
 */
export async function updateAdminAndSatker(formData: FormData) {
  const userId = formData.get('userId') as string;
  const satkerId = formData.get('satkerId') as string;
  const namaAdmin = formData.get('namaAdmin') as string;
  const email = formData.get('email') as string;
  const kodeSatker = formData.get('kodeSatker') as string;
  const namaSatker = formData.get('namaSatker') as string;

  if (!userId || !satkerId || !namaAdmin || !email || !kodeSatker || !namaSatker) {
    throw new Error('Semua kolom wajib diisi.');
  }

  // Pre-validation: Cek apakah kode satker atau email sudah digunakan oleh record lain
  const [existingSatker, existingUser] = await Promise.all([
    prisma.satker.findFirst({ 
      where: { 
        kode: kodeSatker,
        NOT: { id: satkerId } // Exclude current satker
      } 
    }),
    prisma.user.findFirst({ 
      where: { 
        email,
        NOT: { id: userId } // Exclude current user
      } 
    }),
  ]);

  if (existingSatker) {
    throw new Error('Gagal: Kode Satker sudah digunakan oleh unit lain.');
  }

  if (existingUser) {
    throw new Error('Gagal: Email sudah digunakan oleh akun lain.');
  }

  try {
    // Gunakan transaksi untuk memastikan kedua update berhasil atau keduanya gagal
    await prisma.$transaction(async (tx) => {
      // Update data Satker
      await tx.satker.update({
        where: { id: satkerId },
        data: {
          kode: kodeSatker,
          nama: namaSatker,
        },
      });

      // Update data User (Admin)
      await tx.user.update({
        where: { id: userId },
        data: {
          nama: namaAdmin,
          email,
        },
      });
    });
  } catch (error: unknown) {
    // Tangani kemungkinan error karena email atau kode satker duplikat
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      typeof error.meta === 'object' &&
      error.meta !== null &&
      'target' in error.meta
    ) {
      const target = error.meta.target as string[];
      if (target?.includes('email')) throw new Error('Gagal: Email sudah digunakan oleh akun lain.');
      if (target?.includes('kode')) throw new Error('Gagal: Kode Satker sudah digunakan oleh unit lain.');
    }
    console.error('Gagal mengupdate data:', error);
    throw new Error('Terjadi kesalahan saat menyimpan perubahan.');
  }

  // Segarkan data di halaman admin agar menampilkan data terbaru
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/satker');
}


/**
 * Aksi untuk mereset password seorang Admin Satker.
 */
export async function resetPassword(formData: FormData) {
  const userId = formData.get('userId') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!userId || !newPassword) throw new Error('Password baru tidak boleh kosong.');

  const hashedPassword = await hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch {
    throw new Error('Gagal mereset password.');
  }

  revalidatePath('/dashboard/admin');
}

/**
 * Aksi untuk menghapus akun Admin dan Satker terkait.
 */
export async function deleteAdminAndSatker(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { satkerId: true },
  });

  if (!user || !user.satkerId) {
    throw new Error('Admin tidak terhubung dengan Satker manapun.');
  }
  
  const satkerId = user.satkerId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.peminjaman.deleteMany({ where: { ht: { satkerId } } });
      await tx.hT.deleteMany({ where: { satkerId } });
      await tx.pengajuanMutasi.deleteMany({ where: { OR: [{ satkerAsalId: satkerId }, { satkerTujuanId: satkerId }] } });
      await tx.pengajuanPeminjaman.deleteMany({ where: { satkerId } });
      await tx.personil.deleteMany({ where: { satkerId } });
      await tx.user.delete({ where: { id: userId } });
      await tx.satker.delete({ where: { id: satkerId } });
    });
  } catch (error) {
    console.error(error);
    throw new Error('Gagal menghapus data. Pastikan semua relasi sudah ditangani.');
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/satker');
}