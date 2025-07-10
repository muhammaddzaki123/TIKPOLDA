// app/dashboard/satker/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Aksi untuk menambah Satker baru
export async function addSatker(formData: FormData) {
  const kode = formData.get('kode') as string;
  const nama = formData.get('nama') as string;

  if (!kode || !nama) {
    throw new Error('Kode dan Nama Satker wajib diisi.');
  }

  try {
    await prisma.satker.create({
      data: {
        kode,
        nama,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Kode Satker sudah ada. Gunakan kode unik.');
    }
    throw new Error('Gagal menyimpan Satker baru.');
  }

  revalidatePath('/dashboard/satker');
}

// Aksi untuk menghapus Satker
export async function deleteSatker(formData: FormData) {
  const satkerId = formData.get('satkerId') as string;

  if (!satkerId) {
    throw new Error('ID Satker tidak ditemukan.');
  }
  
  // Tambahan: Cek apakah Satker masih memiliki HT atau Personil
  const relatedItems = await prisma.satker.findUnique({
    where: { id: satkerId },
    include: { _count: { select: { ht: true, personil: true } } },
  });

  if ((relatedItems?._count?.ht ?? 0) > 0 || (relatedItems?._count?.personil ?? 0) > 0) {
    throw new Error('Gagal menghapus. Satker masih memiliki HT atau Personil terdaftar.');
  }

  try {
    await prisma.satker.delete({
      where: { id: satkerId },
    });
  } catch (error) {
    throw new Error('Gagal menghapus Satker.');
  }

  revalidatePath('/dashboard/satker');
}