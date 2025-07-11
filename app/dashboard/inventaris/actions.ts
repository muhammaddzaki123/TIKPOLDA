// app/dashboard/inventaris/actions.ts

'use server';

import { PrismaClient, HTStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

/**
 * Aksi untuk menambah HT baru oleh Super Admin.
 * Super Admin dapat memilih Satker penempatan untuk HT baru ini.
 * @param formData Data dari formulir penambahan HT.
 */
export async function addHT(formData: FormData) {
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  const satkerId = formData.get('satkerId') as string;

  // Validasi dasar untuk memastikan semua field terisi
  if (!serialNumber || !kodeHT || !merk || !jenis || !tahunBuat || !tahunPeroleh || !satkerId) {
    throw new Error('Semua kolom wajib diisi.');
  }

  try {
    await prisma.hT.create({
      data: {
        serialNumber,
        kodeHT,
        merk,
        jenis,
        tahunBuat,
        tahunPeroleh,
        satkerId,
        status: HTStatus.BAIK, // Status default saat pertama kali dibuat adalah BAIK dan tersedia
      },
    });
  } catch (error: any) {
    // Menangani error jika serialNumber atau kodeHT sudah ada (karena unique)
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('serialNumber')) throw new Error('Gagal: Serial Number sudah terdaftar.');
      if (target?.includes('kodeHT')) throw new Error('Gagal: Kode HT sudah terdaftar.');
    }
    console.error('Gagal membuat HT:', error);
    throw new Error('Terjadi kesalahan saat menyimpan data HT.');
  }

  // Segarkan data di halaman inventaris dan pemantauan satker
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

/**
 * Aksi untuk menghapus data HT.
 * @param htId ID dari HT yang akan dihapus.
 */
export async function deleteHT(htId: string) {
    if (!htId) {
        throw new Error('ID HT tidak valid.');
    }

    try {
        // Pastikan HT tidak sedang dalam peminjaman aktif
        const peminjamanAktif = await prisma.peminjaman.count({
            where: { htId: htId, tanggalKembali: null }
        });

        if (peminjamanAktif > 0) {
            throw new Error('HT tidak dapat dihapus karena sedang dalam masa peminjaman.');
        }

        // Hapus riwayat peminjaman terkait terlebih dahulu
        await prisma.peminjaman.deleteMany({
            where: { htId: htId }
        });

        // Hapus HT
        await prisma.hT.delete({
            where: { id: htId }
        });

    } catch (error: any) {
        if (error instanceof Error && error.message.includes('peminjaman')) {
            throw error;
        }
        console.error('Gagal menghapus HT:', error);
        throw new Error('Gagal menghapus data HT.');
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
}
