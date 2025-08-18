// File: app/satker-admin/pengajuan/actions.ts

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

// --- FUNGSI YANG DIMODIFIKASI ---
// Aksi untuk membuat pengajuan peminjaman HT baru
export async function createPengajuanPeminjaman(formData: FormData) {
  const satkerId = await getSatkerIdOrThrow();

  const jumlah = parseInt(formData.get('jumlah') as string);
  const keperluan = formData.get('keperluan') as string;
  const file = formData.get('file') as File;

  // <-- PERUBAHAN 1: Mengambil data tanggal dari FormData -->
  const tanggalMulaiString = formData.get('tanggalMulai') as string;
  const tanggalSelesaiString = formData.get('tanggalSelesai') as string;

  if (!jumlah || !keperluan || jumlah <= 0) {
    throw new Error('Jumlah HT dan Keperluan wajib diisi dengan benar.');
  }

  // <-- PERUBAHAN 2: Validasi dan konversi tanggal -->
  if (!tanggalMulaiString || !tanggalSelesaiString) {
    throw new Error('Rentang tanggal peminjaman wajib diisi.');
  }
  const tanggalMulai = new Date(tanggalMulaiString);
  const tanggalSelesai = new Date(tanggalSelesaiString);


  let fileUrl: string | null = null;

  // --- LOGIKA UNTUK MENANGANI DAN MENYIMPAN FILE UPLOAD (TIDAK BERUBAH) ---
  if (file && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) { // 2MB
      throw new Error('Ukuran file tidak boleh lebih dari 2MB.');
    }
    if (file.type !== 'application/pdf') {
       throw new Error('File yang diunggah harus berformat PDF.');
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${satkerId}_${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'surat_permohonan');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    fileUrl = `/uploads/surat_permohonan/${filename}`;
  }
  // --- AKHIR LOGIKA FILE UPLOAD ---

  try {
    await prisma.pengajuanPeminjaman.create({
      data: {
        jumlah,
        keperluan,
        // <-- PERUBAHAN 3: Menyimpan tanggal ke database -->
        tanggalMulai: tanggalMulai,
        tanggalSelesai: tanggalSelesai,
        fileUrl: fileUrl,
        satkerId: satkerId,
      },
    });
  } catch (error) {
    console.error('Gagal membuat pengajuan peminjaman:', error);
    throw new Error('Terjadi kesalahan saat mengirim pengajuan.');
  }

  revalidatePath('/satker-admin/pengajuan');
}

// ==========================================================
// --- SEMUA FUNGSI DI BAWAH INI TIDAK DIUBAH SAMA SEKALI ---
// ==========================================================

// Aksi untuk membuat pengajuan mutasi personil
export async function createPengajuanMutasi(formData: FormData) {
    const satkerAsalId = await getSatkerIdOrThrow();

    const personilId = formData.get('personilId') as string;
    const satkerTujuanId = formData.get('satkerTujuanId') as string;
    const alasan = formData.get('alasan') as string;
    const file = formData.get('file') as File;

    if (!personilId || !satkerTujuanId || !alasan) {
        throw new Error('Personil, Satker Tujuan, dan Alasan wajib diisi.');
    }
    
    if (satkerAsalId === satkerTujuanId) {
        throw new Error('Satker Tujuan tidak boleh sama dengan Satker asal.');
    }

    let fileUrl: string | null = null;

    if (file && file.size > 0) {
      if (file.size > 2 * 1024 * 1024) {
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
                fileUrl: fileUrl,
            },
        });
    } catch (error: any) {
        if (error instanceof Error) throw error;
        console.error('Gagal membuat pengajuan mutasi:', error);
        throw new Error('Terjadi kesalahan saat mengirim pengajuan.');
    }

    revalidatePath('/satker-admin/pengajuan');
}


export async function createPackagePengembalian(formData: FormData) {
  const satkerId = await getSatkerIdOrThrow();
  const pengajuanPeminjamanId = formData.get('pengajuanPeminjamanId') as string;
  const alasan = formData.get('alasan') as string;

  if (!pengajuanPeminjamanId || !alasan.trim()) {
    throw new Error('ID Paket Peminjaman dan Alasan wajib diisi.');
  }

  try {
    // Validate the original loan request exists and is approved
    const originalLoan = await prisma.pengajuanPeminjaman.findUnique({
      where: { id: pengajuanPeminjamanId },
      include: { satkerPengaju: true }
    });

    if (!originalLoan) {
      throw new Error('Pengajuan peminjaman tidak ditemukan.');
    }

    if (originalLoan.status !== 'APPROVED') {
      throw new Error('Hanya pengajuan yang sudah disetujui yang dapat dikembalikan.');
    }

    if (originalLoan.satkerId !== satkerId) {
      throw new Error('Anda tidak memiliki wewenang untuk mengembalikan paket ini.');
    }

    // Find active loans for this package
    const activeLoans = await prisma.peminjamanSatker.findMany({
      where: {
        satkerId: satkerId,
        tanggalKembali: null,
        catatan: {
          contains: pengajuanPeminjamanId.substring(0, 8),
        },
      },
      include: {
        ht: {
          select: {
            id: true,
            serialNumber: true,
            merk: true
          }
        }
      }
    });

    const htIdsToReturn = activeLoans.map(loan => loan.htId);

    if (htIdsToReturn.length === 0) {
      throw new Error('Tidak ada HT aktif yang dapat dikembalikan untuk paket ini. Mungkin sudah dalam proses pengembalian atau sudah dikembalikan.');
    }

    // Check for existing pending returns for this package
    const existingPendingReturn = await prisma.pengajuanPengembalian.findFirst({
      where: {
        pengajuanPeminjamanId: pengajuanPeminjamanId,
        status: 'PENDING',
      },
    });

    if (existingPendingReturn) {
      throw new Error('Paket ini sudah memiliki pengajuan pengembalian yang sedang diproses.');
    }

    // Create package return request in a transaction
    await prisma.$transaction(async (tx) => {
      // Create the main return request
      const returnRequest = await tx.pengajuanPengembalian.create({
        data: {
          alasan: alasan.trim(),
          status: 'PENDING',
          satkerId: satkerId,
          pengajuanPeminjamanId: pengajuanPeminjamanId,
        },
      });

      // Create detail records for each HT in the package
      await tx.pengembalianDetail.createMany({
        data: htIdsToReturn.map(htId => ({
          pengajuanPengembalianId: returnRequest.id,
          htId: htId,
        })),
      });
    });

    console.log(`Package return request created successfully for loan ${pengajuanPeminjamanId} with ${htIdsToReturn.length} HT units`);

  } catch (error: any) {
    console.error('Error creating package return request:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan saat mengirim pengajuan paket pengembalian.');
  }

  // Revalidate paths to update tracking status
  revalidatePath('/satker-admin/pengajuan');
  revalidatePath('/dashboard/persetujuan');
  
  console.log(`Revalidated paths after creating return request for loan ${pengajuanPeminjamanId}`);
}
