// app/satker-admin/peminjaman/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

/**
 * Aksi untuk mencatat peminjaman HT baru oleh Admin Satker.
 */
export async function createPeminjaman(formData: FormData) {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  // Validasi otorisasi
  if (!satkerId) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }

  const htId = formData.get('htId') as string;
  const personilId = formData.get('personilId') as string;
  const kondisiSaatPinjam = formData.get('kondisiSaatPinjam') as string;
  const catatan = formData.get('catatan') as string | null;

  if (!htId || !personilId || !kondisiSaatPinjam) {
    throw new Error('HT, Personil, dan Kondisi wajib diisi.');
  }

  try {
    // Gunakan transaksi untuk memastikan konsistensi data
    await prisma.$transaction(async (tx) => {
      // 1. Cek apakah HT tersedia untuk dipinjam
      const peminjamanAktif = await tx.peminjaman.findFirst({
        where: { htId: htId, tanggalKembali: null },
      });

      // Jika sudah ada peminjaman aktif untuk HT ini, lempar error
      if (peminjamanAktif) {
        throw new Error('Peminjaman gagal: HT tersebut sedang tidak tersedia atau sudah dipinjam.');
      }

      // 2. Buat record peminjaman baru
      await tx.peminjaman.create({
        data: {
          htId,
          personilId,
          kondisiSaatPinjam,
          catatan,
          adminPencatatId: session.user.id, // Catat admin yang melakukan aksi
        },
      });
    });
  } catch (error: any) {
    // Teruskan pesan error spesifik dari dalam transaksi
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    // Tangani error umum lainnya
    console.error(error);
    throw new Error('Terjadi kesalahan pada server saat mencatat peminjaman.');
  }

  // Segarkan kembali data pada halaman-halaman yang relevan
  revalidatePath('/satker-admin/peminjaman');
  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

/**
 * Aksi untuk mencatat pengembalian HT.
 */
export async function createPengembalian(formData: FormData) {
  const peminjamanId = formData.get('peminjamanId') as string;
  const kondisiSaatKembali = formData.get('kondisiSaatKembali') as string;

  if (!peminjamanId || !kondisiSaatKembali) {
    throw new Error('ID Peminjaman dan Kondisi saat kembali wajib diisi.');
  }
  
  try {
    // Update record peminjaman dengan tanggal kembali
    await prisma.peminjaman.update({
        where: { id: peminjamanId },
        data: {
            tanggalKembali: new Date(),
            kondisiSaatKembali: kondisiSaatKembali,
        }
    });
  } catch(error) {
      console.error(error);
      throw new Error('Terjadi kesalahan saat mencatat pengembalian.');
  }

  // Segarkan kembali data pada halaman-halaman yang relevan
  revalidatePath('/satker-admin/peminjaman');
  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}
