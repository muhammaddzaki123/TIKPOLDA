// File: app/satker-admin/peminjaman/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Aksi untuk mencatat peminjaman HT baru oleh Admin Satker.
 * --- DIMODIFIKASI ---
 */
export async function createPeminjaman(formData: FormData) {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }

  const htId = formData.get('htId') as string;
  const personilId = formData.get('personilId') as string;
  const kondisiSaatPinjam = formData.get('kondisiSaatPinjam') as string;
  const catatan = formData.get('catatan') as string | null;
  const file = formData.get('file') as File;
  
  // <-- PERUBAHAN 1: Mengambil dan memvalidasi estimasiKembali dari FormData -->
  const estimasiKembaliString = formData.get('estimasiKembali') as string;
  if (!estimasiKembaliString) {
      throw new Error('Estimasi tanggal kembali wajib diisi.');
  }
  const estimasiKembali = new Date(estimasiKembaliString);


  if (!htId || !personilId || !kondisiSaatPinjam) {
    throw new Error('HT, Personil, dan Kondisi wajib diisi.');
  }

  let fileUrl: string | null = null;

  if (file && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) { // 2MB
      throw new Error('Ukuran file tidak boleh lebih dari 2MB.');
    }
    if (file.type !== 'application/pdf') {
       throw new Error('File yang diunggah harus berformat PDF.');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${personilId}_${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'berita_acara');
    
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    fileUrl = `/uploads/berita_acara/${filename}`;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const peminjamanAktif = await tx.peminjaman.findFirst({
        where: { htId: htId, tanggalKembali: null },
      });

      if (peminjamanAktif) {
        throw new Error('Peminjaman gagal: HT tersebut sedang tidak tersedia atau sudah dipinjam.');
      }

      await tx.peminjaman.create({
        data: {
          htId,
          personilId,
          kondisiSaatPinjam,
          estimasiKembali: estimasiKembali, // <-- PERUBAHAN 2: Menyimpan nilai ke database
          catatan,
          fileUrl: fileUrl,
          adminPencatatId: session.user.id,
        },
      });
    });
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    console.error(error);
    throw new Error('Terjadi kesalahan pada server saat mencatat peminjaman.');
  }

  revalidatePath('/satker-admin/peminjaman');
  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}

/**
 * Aksi untuk mencatat pengembalian HT.
 * --- TIDAK ADA PERUBAHAN PADA FUNGSI INI ---
 */
export async function createPengembalian(formData: FormData) {
  const peminjamanId = formData.get('peminjamanId') as string;
  const kondisiSaatKembali = formData.get('kondisiSaatKembali') as string;

  if (!peminjamanId || !kondisiSaatKembali) {
    throw new Error('ID Peminjaman dan Kondisi saat kembali wajib diisi.');
  }
  
  try {
    await prisma.peminjaman.update({
        where: { id: peminjamanId },
        data: {
            tanggalKembali: new Date(),
            kondisiSaatKembali: kondisiSaatKembali,
        }
    });
  } catch(error) {
      console.error(error);
      throw new Error('Terjadi kesalahan saat mencatat pengembalian.');
  }

  revalidatePath('/satker-admin/peminjaman');
  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}