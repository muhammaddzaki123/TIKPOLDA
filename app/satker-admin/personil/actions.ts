// app/satker-admin/personil/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

/**
 * Mendapatkan ID Satker dari admin yang sedang login.
 * Fungsi helper ini digunakan untuk otorisasi.
 */
async function getSatkerIdOrThrow() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }
  return satkerId;
}

/**
 * Aksi untuk Admin Satker menambah Personil baru ke unit kerjanya.
 */
export async function addPersonil(formData: FormData) {
  const satkerId = await getSatkerIdOrThrow();

  const nama = formData.get('nama') as string;
  const nrp = formData.get('nrp') as string;
  const jabatan = formData.get('jabatan') as string;

  if (!nama || !nrp || !jabatan) {
    throw new Error('Semua kolom wajib diisi.');
  }

  try {
    await prisma.personil.create({
      data: {
        nama,
        nrp,
        jabatan,
        satkerId: satkerId, // satkerId diambil dari sesi login admin
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nrp')) {
      throw new Error('Gagal: NRP sudah terdaftar.');
    }
    console.error(error);
    throw new Error('Terjadi kesalahan saat menyimpan data personil.');
  }

  revalidatePath('/satker-admin/personil');
  revalidatePath('/dashboard/personil');
  revalidatePath('/dashboard/satker');
}

/**
 * Aksi untuk Admin Satker mengubah data Personil.
 */
export async function updatePersonil(formData: FormData) {
  await getSatkerIdOrThrow(); // Otorisasi

  const personilId = formData.get('personilId') as string;
  const nama = formData.get('nama') as string;
  const nrp = formData.get('nrp') as string;
  const jabatan = formData.get('jabatan') as string;

  if (!personilId || !nama || !nrp || !jabatan) {
    throw new Error('Semua kolom wajib diisi.');
  }

  try {
    await prisma.personil.update({
      where: { id: personilId },
      data: { nama, nrp, jabatan },
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nrp')) {
      throw new Error('Gagal: NRP sudah digunakan oleh personil lain.');
    }
    console.error(error);
    throw new Error('Terjadi kesalahan saat memperbarui data.');
  }

  revalidatePath('/satker-admin/personil');
  revalidatePath('/dashboard/personil');
}

/**
 * Aksi untuk Admin Satker menghapus data Personil.
 */
export async function deletePersonil(personilId: string) {
  await getSatkerIdOrThrow(); // Otorisasi

  if (!personilId) throw new Error('ID Personil tidak valid.');

  try {
    // Validasi: Pastikan personil tidak sedang meminjam HT
    const peminjamanAktif = await prisma.peminjaman.count({
      where: { personilId: personilId, tanggalKembali: null },
    });

    if (peminjamanAktif > 0) {
      throw new Error('Personil tidak dapat dihapus karena masih memiliki tanggungan peminjaman HT.');
    }

    // Hapus semua data terkait personil (misal: riwayat peminjaman)
    await prisma.peminjaman.deleteMany({ where: { personilId } });

    // Hapus personil
    await prisma.personil.delete({ where: { id: personilId } });
  } catch (error: any) {
    if (error instanceof Error) throw error;
    console.error('Gagal menghapus personil:', error);
    throw new Error('Gagal menghapus data personil.');
  }
  
  revalidatePath('/satker-admin/personil');
  revalidatePath('/dashboard/personil');
  revalidatePath('/dashboard/satker');
}