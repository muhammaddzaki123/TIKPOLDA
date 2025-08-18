// app/satker-admin/inventaris/actions.ts

'use server';

import { PrismaClient, HTStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

/**
 * Aksi untuk Admin Satker menambah HT baru ke unit kerjanya.
 */
export async function addHtBySatker(formData: FormData) {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  // Validasi: Pastikan pengguna adalah Admin Satker dan memiliki satkerId
  if (!satkerId) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang untuk aksi ini.');
  }

  const serialNumber = formData.get('serialNumber') as string;
  const merk = formData.get('merk') as string;
  const jenis = formData.get('jenis') as string;
  const tahunBuat = parseInt(formData.get('tahunBuat') as string);
  const tahunPeroleh = parseInt(formData.get('tahunPeroleh') as string);

  if (!serialNumber || !merk || !jenis || !tahunBuat || !tahunPeroleh) {
    throw new Error('Semua kolom wajib diisi.');
  }

  try {
    await prisma.hT.create({
      data: {
        serialNumber,
        merk,
        jenis,
        tahunBuat,
        tahunPeroleh,
        satkerId: satkerId, // satkerId diambil dari sesi login admin
        status: HTStatus.BAIK,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('serialNumber')) throw new Error('Gagal: Serial Number sudah terdaftar.');
    }
    console.error(error);
    throw new Error('Terjadi kesalahan saat menyimpan data HT.');
  }

  // Segarkan data di halaman inventaris satker
  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/satker'); // Juga segarkan pemantauan super admin
  revalidatePath('/dashboard/inventaris'); // Juga segarkan inventaris super admin
}

/**
 * Aksi untuk Admin Satker mengubah status kondisi fisik HT.
 */
export async function updateStatusHT(formData: FormData) {
  const htId = formData.get('htId') as string;
  const newStatus = formData.get('status') as HTStatus;
  const catatan = formData.get('catatanKondisi') as string;

  if (!htId || !newStatus) {
    throw new Error('ID HT dan Status baru wajib diisi.');
  }

  try {
    await prisma.hT.update({
      where: { id: htId },
      data: {
        status: newStatus,
        catatanKondisi: catatan,
      },
    });
  } catch (error) {
    console.error('Gagal mengubah status HT:', error);
    throw new Error('Terjadi kesalahan saat mengubah status HT.');
  }

  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/satker');
  revalidatePath('/dashboard/inventaris');
}

/**
 * Aksi untuk Admin Satker menghapus HT dari unitnya.
 */
export async function deleteHtBySatker(htId: string) {
    if (!htId) throw new Error('ID HT tidak valid.');
  
    try {
      const peminjamanAktif = await prisma.peminjaman.count({
          where: { htId: htId, tanggalKembali: null }
      });
  
      if (peminjamanAktif > 0) {
          throw new Error('HT tidak dapat dihapus karena sedang dalam masa peminjaman.');
      }
  
      await prisma.peminjaman.deleteMany({ where: { htId: htId } });
      await prisma.hT.delete({ where: { id: htId } });
  
    } catch (error: any) {
      if (error instanceof Error) throw error;
      console.error('Gagal menghapus HT:', error);
      throw new Error('Gagal menghapus data HT.');
    }
  
    revalidatePath('/satker-admin/inventaris');
    revalidatePath('/dashboard/satker');
    revalidatePath('/dashboard/inventaris');
}
