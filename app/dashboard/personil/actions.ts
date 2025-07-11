// app/dashboard/personil/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

/**
 * Aksi untuk memindahkan (mutasi) seorang personil ke Satker lain.
 * @param formData Data dari form yang berisi personilId dan satkerTujuanId.
 */
export async function mutasiPersonil(formData: FormData) {
  const personilId = formData.get('personilId') as string;
  const satkerTujuanId = formData.get('satkerTujuanId') as string;

  if (!personilId || !satkerTujuanId) {
    throw new Error('ID Personil dan Satker Tujuan wajib diisi.');
  }

  try {
    // Validasi penting: Cek apakah personil sedang meminjam HT
    const peminjamanAktif = await prisma.peminjaman.count({
      where: {
        personilId: personilId,
        tanggalKembali: null, // Artinya, peminjaman masih aktif
      },
    });

    if (peminjamanAktif > 0) {
      throw new Error('Mutasi gagal: Personil masih memiliki tanggungan peminjaman HT yang aktif.');
    }

    // Jika aman, update data personil dengan satkerId yang baru
    await prisma.personil.update({
      where: { id: personilId },
      data: {
        satkerId: satkerTujuanId,
      },
    });
  } catch (error: any) {
    // Teruskan pesan error spesifik dari validasi di atas
    if (error instanceof Error && error.message.includes('Mutasi gagal')) {
      throw error;
    }
    // Tangani error lainnya
    console.error('Gagal melakukan mutasi:', error);
    throw new Error('Terjadi kesalahan pada server saat proses mutasi.');
  }

  // Segarkan data di halaman personil dan halaman pemantauan satker agar konsisten
  revalidatePath('/dashboard/personil');
  revalidatePath('/dashboard/satker');
}
