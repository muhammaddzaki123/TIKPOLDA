'use server'; // Ini adalah Server Action!

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Fungsi untuk menambah personil baru
export async function addPersonil(formData: FormData) {
  const nama = formData.get('nama') as string;
  const nrp = formData.get('nrp') as string;
  const jabatan = formData.get('jabatan') as string;

  // TODO: Tambahkan validasi di sini

  try {
    await prisma.personil.create({
      data: {
        nama,
        nrp,
        jabatan,
        satkerId: 'clsrxxxxxxxxx', // ID Satker sementara, nanti akan diambil dari user yang login
      },
    });
  } catch (error) {
    console.error(error);
    // Handle error (e.g., NRP sudah ada)
  }

  // Memberitahu Next.js untuk memuat ulang data di halaman ini
  revalidatePath('/satker-admin/personil');
}