// app/satker-admin/pengajuan/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Fungsi helper untuk mendapatkan ID Satker dari sesi admin yang sedang login.
async function getSatkerIdOrThrow() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;
  if (!satkerId) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }
  return satkerId;
}

// Aksi untuk membuat pengajuan peminjaman HT baru
export async function createPengajuanPeminjaman(formData: FormData) {
  const satkerId = await getSatkerIdOrThrow();

  const jumlah = parseInt(formData.get('jumlah') as string);
  const keperluan = formData.get('keperluan') as string;
  const file = formData.get('file') as File;

  if (!jumlah || !keperluan || jumlah <= 0) {
    throw new Error('Jumlah HT dan Keperluan wajib diisi dengan benar.');
  }

  let fileUrl: string | null = null;

  // --- LOGIKA UNTUK MENANGANI DAN MENYIMPAN FILE UPLOAD ---
  if (file && file.size > 0) {
    // Validasi di sisi server untuk keamanan
    if (file.size > 2 * 1024 * 1024) { // 2MB
      throw new Error('Ukuran file tidak boleh lebih dari 2MB.');
    }
    if (file.type !== 'application/pdf') {
       throw new Error('File yang diunggah harus berformat PDF.');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file yang unik untuk menghindari penimpaan file
    const filename = `${Date.now()}_${satkerId}_${file.name.replace(/\s/g, '_')}`;
    
    // Tentukan path direktori
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'surat_permohonan');
    
    // Buat direktori jika belum ada
    await mkdir(uploadDir, { recursive: true });

    // Tentukan path lengkap file
    const filePath = path.join(uploadDir, filename);
    
    // Tulis file ke sistem
    await writeFile(filePath, buffer);
    
    // Simpan URL yang dapat diakses publik ke database
    fileUrl = `/uploads/surat_permohonan/${filename}`;
  }
  // --- AKHIR LOGIKA FILE UPLOAD ---

  try {
    await prisma.pengajuanPeminjaman.create({
      data: {
        jumlah,
        keperluan,
        fileUrl: fileUrl, // Simpan URL file jika ada
        satkerId: satkerId,
      },
    });
  } catch (error) {
    console.error('Gagal membuat pengajuan peminjaman:', error);
    throw new Error('Terjadi kesalahan saat mengirim pengajuan.');
  }

  revalidatePath('/satker-admin/pengajuan');
}

// Aksi untuk membuat pengajuan mutasi personil
export async function createPengajuanMutasi(formData: FormData) {
    const satkerAsalId = await getSatkerIdOrThrow();

    const personilId = formData.get('personilId') as string;
    const satkerTujuanId = formData.get('satkerTujuanId') as string;
    const alasan = formData.get('alasan') as string;
    const file = formData.get('file') as File; // Ambil file dari form data

    if (!personilId || !satkerTujuanId || !alasan) {
        throw new Error('Personil, Satker Tujuan, dan Alasan wajib diisi.');
    }
    
    if (satkerAsalId === satkerTujuanId) {
        throw new Error('Satker Tujuan tidak boleh sama dengan Satker asal.');
    }

    let fileUrl: string | null = null;

    // --- LOGIKA UNTUK MENANGANI FILE UPLOAD ---
    if (file && file.size > 0) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        throw new Error('Ukuran file tidak boleh lebih dari 2MB.');
      }
      if (file.type !== 'application/pdf') {
         throw new Error('File yang diunggah harus berformat PDF.');
      }
  
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
  
      const filename = `${Date.now()}_${satkerAsalId}_${file.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'surat_mutasi');
      
      await mkdir(uploadDir, { recursive: true });
  
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/surat_mutasi/${filename}`;
    }
    // --- AKHIR LOGIKA FILE UPLOAD ---

    try {
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
                fileUrl: fileUrl, // Simpan URL file jika ada
            },
        });
    } catch (error: any) {
        if (error instanceof Error) throw error;
        console.error('Gagal membuat pengajuan mutasi:', error);
        throw new Error('Terjadi kesalahan saat mengirim pengajuan.');
    }

    revalidatePath('/satker-admin/pengajuan');
}

/**
 * [DESAIN BARU] Aksi untuk membuat pengajuan pengembalian untuk satu PAKET peminjaman.
 */
export async function createPackagePengembalian(formData: FormData) {
  const satkerId = await getSatkerIdOrThrow();
  const pengajuanPeminjamanId = formData.get('pengajuanPeminjamanId') as string;
  const alasan = formData.get('alasan') as string;

  if (!pengajuanPeminjamanId || !alasan) {
    throw new Error('ID Paket Peminjaman dan Alasan wajib diisi.');
  }

  // 1. Cari semua HT yang terkait dengan paket peminjaman ini dan masih aktif (belum dikembalikan)
  const activeLoans = await prisma.peminjamanSatker.findMany({
    where: {
      satkerId: satkerId,
      tanggalKembali: null,
      catatan: {
        contains: pengajuanPeminjamanId.substring(0, 8),
      },
    },
    select: {
      htId: true,
    },
  });

  const htIdsToReturn = activeLoans.map(loan => loan.htId);

  if (htIdsToReturn.length === 0) {
    throw new Error('Tidak ada HT aktif yang bisa dikembalikan untuk paket ini. Mungkin sudah dalam proses pengembalian.');
  }

  // 2. Cek apakah salah satu HT dalam paket ini sudah dalam proses pengajuan pengembalian
  const existingPendingReturns = await prisma.pengajuanPengembalian.count({
    where: {
      htId: { in: htIdsToReturn },
      status: 'PENDING',
    },
  });

  if (existingPendingReturns > 0) {
    throw new Error('Satu atau lebih HT dalam paket ini sudah memiliki pengajuan pengembalian yang sedang diproses.');
  }

  // 3. Buat pengajuan pengembalian untuk SETIAP HT dalam paket secara atomik
  try {
    const returnSubmissions = htIdsToReturn.map(htId => ({
      htId: htId,
      alasan: alasan,
      satkerId: satkerId,
    }));

    await prisma.pengajuanPengembalian.createMany({
      data: returnSubmissions,
    });

  } catch (error) {
    console.error('Gagal membuat pengajuan pengembalian paket:', error);
    throw new Error('Terjadi kesalahan saat mengirim pengajuan paket pengembalian.');
  }

  // Revalidasi path untuk memperbarui UI
  revalidatePath('/satker-admin/pengajuan');
  revalidatePath('/dashboard/persetujuan');
}