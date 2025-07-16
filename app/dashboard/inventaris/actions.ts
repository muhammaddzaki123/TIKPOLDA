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

export async function pinjamkanHtKeSatker(formData: FormData) {
    const htId = formData.get('htId') as string;
    const satkerId = formData.get('satkerId') as string;
    const catatan = formData.get('catatan') as string | null;

    if (!htId || !satkerId) {
        throw new Error('HT dan Satker Tujuan wajib dipilih.');
    }

    try {
        const existingLoan = await prisma.peminjamanSatker.findFirst({
            where: {
                htId: htId,
                tanggalKembali: null,
            }
        });

        if (existingLoan) {
            throw new Error('Gagal: HT ini sudah tercatat sedang dipinjamkan.');
        }

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

    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
}

export async function distributeMultipleHtToSatker(htIds: string[], satkerId: string) {
  if (!htIds || htIds.length === 0) {
    throw new Error('Tidak ada HT yang dipilih untuk didistribusikan.');
  }
  if (!satkerId) {
    throw new Error('Satker tujuan wajib dipilih.');
  }

  try {
    const result = await prisma.hT.updateMany({
      where: {
        id: {
          in: htIds,
        },
        satkerId: null,
      },
      data: {
        satkerId: satkerId,
      },
    });

    if (result.count === 0) {
        throw new Error('Tidak ada HT yang berhasil didistribusikan. Mungkin aset sudah dipindahkan.');
    }

    const logEntries = htIds.map(htId => ({
      htId: htId,
      satkerId: satkerId,
      catatan: `Didistribusikan secara massal pada ${new Date().toLocaleString()}`
    }));
    await prisma.peminjamanSatker.createMany({ data: logEntries });


  } catch (error: any) {
    console.error('Gagal mendistribusikan HT massal:', error);
    throw new Error('Terjadi kesalahan pada server saat proses distribusi.');
  }

  // Revalidasi path untuk memperbarui data di UI
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}