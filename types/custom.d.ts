import { Satker, User, Personil, HT, Peminjaman } from '@prisma/client';
import '@tanstack/react-table';

export type AdminWithSatker = User & { satker: Satker | null };
export type PersonilWithSatker = Personil & { satker: Satker };

export type HtWithPeminjaman = HT & {
  peminjaman: (Peminjaman & { personil: Personil })[];
};

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // Fungsi untuk tabel admin
    openResetDialog?: (user: TData) => void;
    openDeleteDialog?: (user: TData) => void;

    // Fungsi untuk tabel personil
    openMutasiDialog?: (personil: TData) => void;

    // Fungsi untuk tabel inventaris satker
    openUpdateStatusDialog?: (ht: TData) => void;
    openDeleteHtDialog?: (ht: TData) => void;

   // --- FUNGSIUNTUK INVENTARIS SATKER ---
    openUpdateStatusDialog?: (ht: TData) => void;
    openDeleteHtDialog?: (ht: TData) => void;

    // --- FUNGSI UNTUK PERSONIL SATKER ---
    openEditPersonilDialog?: (personil: TData) => void;
    openDeletePersonilDialog?: (personil: TData) => void;
  }
}
