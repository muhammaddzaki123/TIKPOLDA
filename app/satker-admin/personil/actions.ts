// app/satker-admin/personil/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.satkerId || !session.user.satker?.nama) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }
  return session;
}

async function handleFileUpload(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  // Validasi ukuran file (1MB = 1024 * 1024 bytes)
  if (file.size > 1024 * 1024) {
    throw new Error('Ukuran file tidak boleh lebih dari 1MB.');
  }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file harus JPG, JPEG, atau PNG.');
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate nama file unik
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Buat direktori jika belum ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'foto_personil');
    await mkdir(uploadDir, { recursive: true });
    
    // Simpan file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return URL relatif
    return `/uploads/foto_personil/${filename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
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
  } catch (error: any) {
    throw new Error(error.message);
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
  } catch (error: any) {
    throw new Error(error.message);
  }

  try {
    // Prepare data untuk update
    const updateData: any = {
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