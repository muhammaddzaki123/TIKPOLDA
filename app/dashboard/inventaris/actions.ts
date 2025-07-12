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
    console.error(error);
    throw new Error('Terjadi kesalahan saat menyimpan data HT.');
  }

  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

export async function pinjamkanHtKeSatker(formData: FormData) {
    const htId = formData.get('htId') as string;
    const satkerId = formData.get('satkerId') as string;
    const catatan = formData.get('catatan') as string | null;

    if (!htId || !satkerId) {
        throw new Error('HT dan Satker Tujuan wajib dipilih.');
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.hT.update({
                where: { id: htId },
                data: { satkerId: satkerId }
            });
            await tx.peminjamanSatker.create({
                data: { htId, satkerId, catatan }
            });
        });
    } catch (error) {
        console.error('Gagal meminjamkan HT ke Satker:', error);
        throw new Error('Terjadi kesalahan saat memproses peminjaman.');
    }

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
    revalidatePath('/dashboard/riwayat');
}

export async function deleteHT(htId: string) {
    if (!htId) throw new Error('ID HT tidak valid.');

    try {
        await prisma.hT.delete({ where: { id: htId } });
    } catch (error) {
        console.error('Gagal menghapus HT:', error);
        throw new Error('Gagal menghapus data HT.');
    }

    revalidatePath('/dashboard/inventaris');
}