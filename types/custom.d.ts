// types/custom.d.ts

import { Satker, User, Personil, HT, Peminjaman, PeminjamanSatker } from '@prisma/client';
import '@tanstack/react-table';

// Tipe data gabungan yang akan kita gunakan di seluruh aplikasi
export type AdminWithSatker = User & { satker: Satker | null };
export type PersonilWithSatker = Personil & { satker: Satker };
export type HtDetails = HT & {
  satker: Satker | null;
  peminjaman: (Peminjaman & { personil: Personil })[];
  peminjamanOlehSatker: PeminjamanSatker[];
};
export type RiwayatPeminjamanInternal = Peminjaman & { ht: HT; personil: Personil & { satker: Satker } };
export type RiwayatPeminjamanPusat = PeminjamanSatker & { ht: HT; satker: Satker };


/**
 * Memperluas tipe TableMeta dari @tanstack/react-table.
 * Semua properti dibuat opsional (?) untuk mencegah konflik tipe.
 */
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // Fungsi untuk tabel admin
    openResetDialog?: (data: TData) => void;
    openDeleteDialog?: (data: TData) => void;

    // Fungsi untuk tabel personil
    openMutasiDialog?: (data: TData) => void;

    // Fungsi untuk tabel inventaris super admin
    openPinjamkanDialog?: (data: TData) => void;
  }
}