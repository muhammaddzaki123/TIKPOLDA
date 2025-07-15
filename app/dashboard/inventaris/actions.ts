// app/dashboard/inventaris/actions.ts

'use server';

import { PrismaClient, HTStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function addHtBySuperAdmin(formData: FormData) {
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  const satkerIdInput = formData.get('satkerId') as string | null;

  if (!serialNumber || !kodeHT || !merk || !jenis || !tahunBuat || !tahunPeroleh) {
    throw new Error('Semua kolom wajib diisi, kecuali penempatan Satker.');
  }

  const satkerId = satkerIdInput === 'gudang' ? null : satkerIdInput;

  try {
    await prisma.hT.create({
      data: {
        serialNumber,
        kodeHT,
        merk,
        jenis,
        tahunBuat,
        tahunPeroleh,
        satkerId: satkerId,
        status: HTStatus.BAIK,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('serialNumber')) throw new Error('Gagal: Serial Number sudah terdaftar.');
      if (target?.includes('kodeHT')) throw new Error('Gagal: Kode HT sudah terdaftar.');
    }
    console.error('Gagal membuat HT:', error);
    throw new Error('Terjadi kesalahan saat menyimpan data HT.');
  }

  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

/**
 * Logika yang diperbarui untuk meminjamkan HT.
 * Hanya membuat catatan peminjaman tanpa mengubah kepemilikan aset.
 */
export async function pinjamkanHtKeSatker(formData: FormData) {
    const htId = formData.get('htId') as string;
    const satkerId = formData.get('satkerId') as string;
    const catatan = formData.get('catatan') as string | null;

    if (!htId || !satkerId) {
        throw new Error('HT dan Satker Tujuan wajib dipilih.');
    }

    try {
        // Validasi untuk memastikan HT tidak sedang dalam status pinjaman aktif
        const existingLoan = await prisma.peminjamanSatker.findFirst({
            where: {
                htId: htId,
                tanggalKembali: null, // Cari peminjaman yang belum dikembalikan
            }
        });

        if (existingLoan) {
            throw new Error('Gagal: HT ini sudah tercatat sedang dipinjamkan.');
        }

        // Buat catatan peminjaman baru di tabel PeminjamanSatker
        await prisma.peminjamanSatker.create({
            data: {
                htId,
                satkerId,
                catatan
            }
        });

    } catch (error: any) {
        if (error instanceof Error) {
            throw error;
        }
        console.error('Gagal meminjamkan HT ke Satker:', error);
        throw new Error('Terjadi kesalahan saat memproses peminjaman.');
    }

    // Segarkan kembali data agar status di UI terupdate
    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
}