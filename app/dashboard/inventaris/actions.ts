// app/dashboard/inventaris/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Aksi untuk menambah HT baru oleh Super Admin
export async function addHT(formData: FormData) {
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  const satkerId = formData.get('satkerId') as string;

  // Validasi dasar
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
        status: 'TERSEDIA', // Status default saat pertama kali dibuat
      },
    });
  } catch (error) {
    console.error('Gagal membuat HT:', error);
    // Error ini biasanya terjadi jika serialNumber atau kodeHT sudah ada (karena unique)
    throw new Error('Gagal menyimpan data HT. Pastikan Serial Number dan Kode HT unik.');
  }

  // Memberi tahu Next.js untuk memuat ulang data di halaman inventaris
  revalidatePath('/dashboard/inventaris');
}