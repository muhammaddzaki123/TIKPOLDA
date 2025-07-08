'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function addHT(formData: FormData) {
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merkHT = formData.get('merkHT') as string;
  const jenisHT = formData.get('jenisHT') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  // Nama field di form adalah 'pemegangId'
  const pemegangId = formData.get('pemegangId') as string; 

  if (!serialNumber || !kodeHT || !merkHT) {
    throw new Error('Serial Number, Kode HT, dan Merk wajib diisi.');
  }

  try {
    // Cek apakah HT langsung ditugaskan ke personil atau disimpan di gudang
    if (pemegangId && pemegangId !== 'gudang') {
      // Jika ada pemegang, lakukan 2 operasi dalam satu transaksi
      await prisma.$transaction(async (tx) => {
        // 1. Buat HT baru dengan status DIPINJAM
        const newHT = await tx.hT.create({
          data: {
            serialNumber,
            kodeHT,
            merk: merkHT,
            jenis: jenisHT,
            tahunBuat,
            tahunPeroleh,
            status: 'DIPINJAM', // Langsung dipinjam
            satkerId: 'clsrxzaf0000108l9bv4peclp', // ID Satker sementara
          },
        });

        // 2. Buat catatan peminjaman baru untuk HT tersebut
        await tx.peminjaman.create({
          data: {
            htId: newHT.id, // ID dari HT yang baru dibuat
            personilId: pemegangId, // ID dari personil yang dipilih
            kondisiSaatPinjam: 'Baru', // Kondisi default saat input awal
            adminPencatatId: 'user-admin-id-sementara', 
          },
        });
      });
    } else {

      await prisma.hT.create({
        data: {
          serialNumber,
          kodeHT,
          merk: merkHT,
          jenis: jenisHT,
          tahunBuat,
          tahunPeroleh,
          status: 'TERSEDIA',
          satkerId: 'clsrxzaf0000108l9bv4peclp',
        },
      });
    }
  } catch (error) {
    console.error('Gagal membuat HT:', error);
    throw new Error('Gagal menyimpan data HT. Mungkin Serial Number atau Kode HT sudah ada.');
  }

  // Perbarui data di halaman inventaris
  revalidatePath('/satker-admin/inventaris');
}