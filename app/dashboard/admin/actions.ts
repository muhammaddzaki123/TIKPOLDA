// app/dashboard/admin/actions.ts

'use server';

import { PrismaClient, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

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
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
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
  } catch (error: any) {
    // Tangani kemungkinan error karena email atau kode satker duplikat
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
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
  } catch (error) {
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