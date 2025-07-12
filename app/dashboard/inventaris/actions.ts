// app/dashboard/inventaris/actions.ts

'use server';

import { PrismaClient, HTStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

/**
 * Aksi untuk menambah HT baru oleh Super Admin.
 * Jika Satker dipilih, HT akan langsung ditempatkan di Satker tersebut.
 * Jika tidak, HT akan menjadi milik Gudang Pusat (satkerId = null).
 */
export async function addHtBySuperAdmin(formData: FormData) {
  const serialNumber = formData.get('serialNumber') as string;
  const kodeHT = formData.get('kodeHT') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);
  const satkerId = formData.get('satkerId') as string | null;

  if (!serialNumber || !kodeHT || !merk || !jenis || !tahunBuat || !tahunPeroleh) {
    throw new Error('Semua kolom wajib diisi, kecuali penempatan Satker.');
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
        // Jika satkerId adalah string kosong, simpan sebagai null. Jika tidak, gunakan nilainya.
        satkerId: satkerId === '' ? null : satkerId,
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

  // Segarkan semua path yang relevan
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

/**
 * Aksi untuk meminjamkan HT dari Gudang Pusat ke Satker.
 */
export async function pinjamkanHtKeSatker(formData: FormData) {
    const htId = formData.get('htId') as string;
    const satkerId = formData.get('satkerId') as string;
    const catatan = formData.get('catatan') as string | null;

    if (!htId || !satkerId) {
        throw new Error('HT dan Satker Tujuan wajib dipilih.');
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update status kepemilikan HT
            await tx.hT.update({
                where: { id: htId },
                data: { satkerId: satkerId }
            });

            // 2. Catat transaksi peminjaman
            await tx.peminjamanSatker.create({
                data: {
                    htId,
                    satkerId,
                    catatan
                }
            });
        });
    } catch (error) {
        console.error('Gagal meminjamkan HT ke Satker:', error);
        throw new Error('Terjadi kesalahan saat memproses peminjaman.');
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
}