// app/satker-admin/personil/actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFileToSupabase } from '@/lib/supabase/storage';

async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.satkerId || !session.user.satker?.nama) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }
  return session;
}

async function handleFileUpload(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    // Upload ke Supabase Storage
    const fileUrl = await uploadFileToSupabase(file);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Gagal mengupload foto.');
  }
}

export async function addPersonil(formData: FormData) {
  const session = await getSessionOrThrow();
  const satkerId = session.user.satkerId!;
  const satkerName = session.user.satker!.nama;

  const nama = formData.get('nama') as string;
  const nrp = formData.get('nrp') as string;
  const jabatan = formData.get('jabatan') as string;
  const pangkat = formData.get('pangkat') as string;
  const foto = formData.get('foto') as File;
  let subSatker = formData.get('subSatker') as string; // Ini adalah nilai penempatan

  if (!nama || !nrp || !jabatan || !pangkat) {
    throw new Error('Nama, NRP, Jabatan, dan Pangkat wajib diisi.');
  }

  // Jika penempatannya adalah Satker utama, maka subSatker di database adalah null
  if (subSatker === satkerName) {
    subSatker = '';
  }

  // Handle upload foto
  let fotoUrl: string | null = null;
  try {
    fotoUrl = await handleFileUpload(foto);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Terjadi kesalahan saat mengupload foto.');
  }

  try {
    await prisma.personil.create({
      data: {
        nama,
        nrp,
        jabatan,
        pangkat,
        fotoUrl,
        subSatker: subSatker || null,
        satkerId: satkerId,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      typeof error.meta === 'object' &&
      error.meta !== null &&
      'target' in error.meta &&
      (error.meta.target as string[])?.includes('nrp')
    ) {
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
  const pangkat = formData.get('pangkat') as string;
  const foto = formData.get('foto') as File;
  let subSatker = formData.get('subSatker') as string; // Ini adalah nilai penempatan

  if (!personilId || !nama || !nrp || !jabatan || !pangkat) {
    throw new Error('Semua kolom wajib diisi.');
  }

  // Jika penempatannya adalah Satker utama, maka subSatker di database adalah null
  if (subSatker === satkerName) {
    subSatker = '';
  }

  // Handle upload foto (hanya jika ada file baru)
  let fotoUrl: string | null = null;
  try {
    fotoUrl = await handleFileUpload(foto);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Terjadi kesalahan saat mengupload foto.');
  }

  try {
    
    type UpdateDataType = {
      nama: string;
      nrp: string;
      jabatan: string;
      pangkat: string;
      subSatker: string | null;
      fotoUrl?: string;
    };
    
    // Prepare data untuk update
    const updateData: UpdateDataType = {
      nama, 
      nrp, 
      jabatan,
      pangkat,
      subSatker: subSatker || null,
    };

    // Hanya update foto jika ada file baru yang diupload
    if (fotoUrl) {
      updateData.fotoUrl = fotoUrl;
    }

    await prisma.personil.update({
      where: { id: personilId },
      data: updateData,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      typeof error.meta === 'object' &&
      error.meta !== null &&
      'target' in error.meta &&
      (error.meta.target as string[])?.includes('nrp')
    ) {
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
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    console.error('Gagal menghapus personil:', error);
    throw new Error('Gagal menghapus data personil.');
  }
  
  revalidatePath('/satker-admin/personil');
}