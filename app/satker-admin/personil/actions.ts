// app/satker-admin/personil/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.satkerId || !session.user.satker?.nama) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }
  return session;
}

export async function addPersonil(formData: FormData) {
  const session = await getSessionOrThrow();
  const satkerId = session.user.satkerId!;
  const satkerName = session.user.satker!.nama;

  const nama = formData.get('nama') as string;
  const nrp = formData.get('nrp') as string;
  const jabatan = formData.get('jabatan') as string;
  let subSatker = formData.get('subSatker') as string; // Ini adalah nilai penempatan

  if (!nama || !nrp || !jabatan) {
    throw new Error('Nama, NRP, dan Jabatan wajib diisi.');
  }

  // Jika penempatannya adalah Satker utama, maka subSatker di database adalah null
  if (subSatker === satkerName) {
    subSatker = '';
  }

  try {
    await prisma.personil.create({
      data: {
        nama,
        nrp,
        jabatan,
        subSatker: subSatker || null,
        satkerId: satkerId,
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
}

export async function updatePersonil(formData: FormData) {
  const session = await getSessionOrThrow();
  const satkerName = session.user.satker!.nama;

  const personilId = formData.get('personilId') as string;
  const nama = formData.get('nama') as string;
  const nrp = formData.get('nrp') as string;
  const jabatan = formData.get('jabatan') as string;
  let subSatker = formData.get('subSatker') as string; // Ini adalah nilai penempatan

  if (!personilId || !nama || !nrp || !jabatan) {
    throw new Error('Semua kolom wajib diisi.');
  }

  // Jika penempatannya adalah Satker utama, maka subSatker di database adalah null
  if (subSatker === satkerName) {
    subSatker = '';
  }

  try {
    await prisma.personil.update({
      where: { id: personilId },
      data: { 
        nama, 
        nrp, 
        jabatan,
        subSatker: subSatker || null,
       },
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nrp')) {
      throw new Error('Gagal: NRP sudah digunakan oleh personil lain.');
    }
    console.error(error);
    throw new Error('Terjadi kesalahan saat memperbarui data.');
  }

  revalidatePath('/satker-admin/personil');
}

export async function deletePersonil(personilId: string) {
  await getSessionOrThrow();

  if (!personilId) throw new Error('ID Personil tidak valid.');

  try {
    const peminjamanAktif = await prisma.peminjaman.count({
      where: { personilId: personilId, tanggalKembali: null },
    });

    if (peminjamanAktif > 0) {
      throw new Error('Personil tidak dapat dihapus karena masih memiliki tanggungan peminjaman HT.');
    }

    await prisma.peminjaman.deleteMany({ where: { personilId } });
    await prisma.personil.delete({ where: { id: personilId } });
  } catch (error: any) {
    if (error instanceof Error) throw error;
    console.error('Gagal menghapus personil:', error);
    throw new Error('Gagal menghapus data personil.');
  }
  
  revalidatePath('/satker-admin/personil');
}