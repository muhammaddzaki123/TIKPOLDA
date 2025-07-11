// types/custom.d.ts

import { Satker, User, Personil } from '@prisma/client';
import '@tanstack/react-table';

// Definisikan tipe gabungan di sini agar bisa digunakan di banyak tempat
export type AdminWithSatker = User & { satker: Satker | null };
export type PersonilWithSatker = Personil & { satker: Satker };

/**
 * Perluas tipe TableMeta dari @tanstack/react-table.
 * Di sini kita definisikan SEMUA kemungkinan fungsi kustom dari seluruh aplikasi.
 * Semua properti dibuat opsional (?) agar setiap tabel hanya perlu
 * mengimplementasikan fungsi yang relevan untuknya.
 */
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // Fungsi untuk tabel admin
    openResetDialog?: (user: TData) => void;
    openDeleteDialog?: (user: TData) => void;

    // Fungsi untuk tabel personil
    openMutasiDialog?: (personil: TData) => void;
  }
}