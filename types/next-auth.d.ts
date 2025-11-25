// types/next-auth.d.ts

import { Role, Satker } from '@prisma/client';
import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Mendefinisikan tipe User yang dikembalikan oleh callback `authorize`.
   * Kita tambahkan 'satker' di sini.
   */
  interface User {
    id: string;
    role: Role;
    nama: string;
    satker: Satker | null; // Tambahkan ini
    satkerId: string | null; // Tambahkan ini
    loginTime?: number; // Track login timestamp for single session
  }

  /**
   * Mendefinisikan tipe Session yang bisa diakses di sisi klien.
   */
  interface Session {
    user: {
      id: string;
      role: Role;
      nama: string;
      satker: Satker | null; // Tambahkan ini
      satkerId: string | null; // Tambahkan ini
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Mendefinisikan tipe token JWT.
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    nama: string;
    satker: Satker | null; // Tambahkan ini
    satkerId: string | null; // Tambahkan ini
    loginTime?: number; // Track login timestamp for single session
  }
}
