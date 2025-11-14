// File: app/satker-admin/peminjaman/actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
      // Cek apakah HT sedang dipinjam
      const peminjamanAktif = await tx.peminjaman.findFirst({
        where: { htId: htId, tanggalKembali: null },
      });

      if (peminjamanAktif) {
        throw new Error('Peminjaman gagal: HT tersebut sedang tidak tersedia atau sudah dipinjam.');
      }

      // Cek apakah personil sudah memiliki peminjaman aktif
      const personilMeminjam = await tx.peminjaman.findFirst({
        where: { 
          personilId: personilId, 
          tanggalKembali: null 
        },
        include: {
          ht: true
        }
      });

      if (personilMeminjam) {
        throw new Error(`Peminjaman gagal: ${personilMeminjam.ht.serialNumber} masih dipinjam oleh personil ini. Harap kembalikan terlebih dahulu sebelum meminjam HT lain.`);
      }

      await tx.peminjaman.create({
        data: {
          htId,
          personilId,
          kondisiSaatPinjam,
          estimasiKembali: estimasiKembali,
          catatan,
          fileUrl: fileUrl,
          adminPencatatId: session.user.id,
        },
      });
    });
  } catch (error: unknown) {
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


// ==========================================================
// --- FUNGSI BARU UNTUK RIWAYAT ---
// Tambahkan kode di bawah ini di akhir file actions.ts Anda
// ==========================================================
/**
 * Aksi untuk mengambil RIWAYAT peminjaman (yang sudah selesai) untuk Satker.
 */
export async function getRiwayatPeminjamanBySatker() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    // Kembalikan array kosong jika tidak terotentikasi agar halaman tidak error
    return [];
  }

  // Mengambil data peminjaman yang sudah memiliki tanggal kembali
  const riwayat = await prisma.peminjaman.findMany({
    where: {
      personil: {
        satkerId: satkerId,
      },
      tanggalKembali: {
        not: null, // Hanya ambil yang sudah dikembalikan
      },
    },
    include: {
      ht: true,
      personil: true,
      riwayatPerpanjangan: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      tanggalKembali: 'desc', // Urutkan berdasarkan yang paling baru dikembalikan
    },
  });

  return riwayat;
}

/**
 * Aksi untuk memperpanjang peminjaman dengan update estimasi kembali dan SPRINT baru
 */
export async function perpanjangPeminjaman(formData: FormData) {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    throw new Error('Otentikasi gagal: Anda tidak memiliki wewenang.');
  }

  const peminjamanId = formData.get('peminjamanId') as string;
  const estimasiKembaliString = formData.get('estimasiKembaliBaru') as string;
  const file = formData.get('fileSprint') as File;
  const catatan = formData.get('catatanPerpanjangan') as string | null;

  if (!peminjamanId || !estimasiKembaliString) {
    throw new Error('ID Peminjaman dan tanggal estimasi baru wajib diisi.');
  }

  const estimasiKembaliBaru = new Date(estimasiKembaliString);
  let fileUrl: string | null = null;

  // Upload SPRINT baru jika ada
  if (file && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Ukuran file tidak boleh lebih dari 2MB.');
    }
    if (file.type !== 'application/pdf') {
      throw new Error('File yang diunggah harus berformat PDF.');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_perpanjangan_${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'berita_acara');

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    fileUrl = `/uploads/berita_acara/${filename}`;
  }

  try {
    // Ambil data peminjaman lama
    const peminjamanLama = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: {
        ht: true,
        personil: true,
      },
    });

    if (!peminjamanLama) {
      throw new Error('Peminjaman tidak ditemukan.');
    }

    // Update estimasi kembali dan SPRINT
    const updateData: { estimasiKembali: Date; fileUrl?: string; catatan?: string } = {
      estimasiKembali: estimasiKembaliBaru,
    };

    if (fileUrl) {
      updateData.fileUrl = fileUrl;
    }

    if (catatan) {
      updateData.catatan = catatan;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update peminjaman
      await tx.peminjaman.update({
        where: { id: peminjamanId },
        data: updateData,
      });

      // 2. Catat riwayat perpanjangan
      await tx.riwayatPerpanjangan.create({
        data: {
          peminjamanId: peminjamanId,
          estimasiKembaliLama: peminjamanLama.estimasiKembali,
          estimasiKembaliBaru: estimasiKembaliBaru,
          fileUrlLama: peminjamanLama.fileUrl,
          fileUrlBaru: fileUrl,
          catatan: catatan,
          adminPencatatId: session.user.id,
        },
      });

      // 3. Buat notifikasi untuk admin satker
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'perpanjangan_peminjaman',
          title: 'Perpanjangan Peminjaman HT',
          message: `HT ${peminjamanLama.ht.serialNumber} oleh ${peminjamanLama.personil.nama} diperpanjang hingga ${estimasiKembaliBaru.toLocaleDateString('id-ID', { dateStyle: 'long' })}`,
          relatedId: peminjamanId,
          priority: 'medium',
        },
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error('Terjadi kesalahan saat memperpanjang peminjaman.');
  }

  revalidatePath('/satker-admin/peminjaman');
  revalidatePath('/satker-admin/inventaris');
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
}