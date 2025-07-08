'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function addHT(formData: FormData) {
  // 1. Ambil semua data dari form
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merkHT = formData.get('merkHT') as string;
  const jenisHT = formData.get('jenisHT') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  // Gunakan nama field yang benar sesuai skema: 'pemegangId'
  const pemegangId = formData.get('pemegangId') as string;

  // 2. Validasi sederhana
  if (!serialNumber || !kodeHT || !merkHT) {
    throw new Error('Serial Number, Kode HT, dan Merk wajib diisi.');
  }

  try {
    // 3. Simpan data ke database menggunakan Prisma
    await prisma.hT.create({
      data: {
        serialNumber,
        kodeHT,
        merk: merkHT,
        jenis: jenisHT,
        tahunBuat,
        tahunPeroleh,
        // Gunakan 'pemegangId' yang benar untuk relasi
        pemegangId: pemegangId !== 'gudang' ? pemegangId : null,
        // Sesuaikan status berdasarkan apakah HT memiliki pemegang atau tidak
        status: pemegangId !== 'gudang' ? 'DIPINJAM' : 'TERSEDIA',
        // ID Satker ini harusnya dinamis sesuai user yang login
        satkerId: 'clsrxzaf0000108l9bv4peclp',
      },
    });
  } catch (error) {
    console.error('Gagal membuat HT:', error);
    throw new Error('Gagal menyimpan data HT. Mungkin Serial Number atau Kode HT sudah ada.');
  }

  // 4. Perbarui data di halaman inventaris agar data baru langsung muncul
  revalidatePath('/satker-admin/inventaris');
}