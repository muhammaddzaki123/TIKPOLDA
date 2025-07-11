// app/satker-admin/pengajuan/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function createPengajuanPeminjaman(formData: FormData) {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    throw new Error('Otentikasi gagal. Anda tidak memiliki wewenang.');
  }

  const jumlah = parseInt(formData.get('jumlah') as string);
  const keperluan = formData.get('keperluan') as string;

  if (!jumlah || !keperluan || jumlah <= 0) {
    throw new Error('Jumlah HT dan Keperluan wajib diisi dengan benar.');
  }

  try {
    await prisma.pengajuanPeminjaman.create({
      data: {
        jumlah,
        keperluan,
        satkerId: satkerId,
        // status default adalah PENDING
      },
    });
  } catch (error) {
    console.error('Gagal membuat pengajuan peminjaman:', error);
    throw new Error('Terjadi kesalahan saat mengirim pengajuan.');
  }

  // Revalidasi halaman ini agar form bisa di-reset atau menampilkan status
  revalidatePath('/satker-admin/pengajuan');
}

/**
 * Aksi untuk membuat pengajuan mutasi personil.
 * Diajukan oleh Admin Satker kepada Super Admin.
 */
export async function createPengajuanMutasi(formData: FormData) {
  const session = await getServerSession(authOptions);
  const satkerAsalId = session?.user?.satkerId;

  if (!satkerAsalId) {
    throw new Error('Otentikasi gagal. Anda tidak memiliki wewenang.');
  }

  const personilId = formData.get('personilId') as string;
  const satkerTujuanId = formData.get('satkerTujuanId') as string;
  const alasan = formData.get('alasan') as string;

  if (!personilId || !satkerTujuanId || !alasan) {
    throw new Error('Personil, Satker Tujuan, dan Alasan wajib diisi.');
  }

  if (satkerAsalId === satkerTujuanId) {
    throw new Error('Satker Tujuan tidak boleh sama dengan Satker asal.');
  }
  
  try {
    // Validasi untuk mencegah pengajuan duplikat yang masih PENDING
    const existingPengajuan = await prisma.pengajuanMutasi.findFirst({
        where: {
            personilId: personilId,
            status: 'PENDING'
        }
    });

    if (existingPengajuan) {
        throw new Error('Personil ini sudah memiliki pengajuan mutasi yang sedang diproses.');
    }

    await prisma.pengajuanMutasi.create({
      data: {
        personilId,
        satkerAsalId,
        satkerTujuanId,
        alasan,
      },
    });
  } catch (error: any) {
    if (error instanceof Error) throw error;
    console.error('Gagal membuat pengajuan mutasi:', error);
    throw new Error('Terjadi kesalahan saat mengirim pengajuan.');
  }

  revalidatePath('/satker-admin/pengajuan');
}