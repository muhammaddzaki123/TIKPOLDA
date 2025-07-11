// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // --- PERBAIKAN UTAMA DI SINI ---
        // Saat mencari user, kita juga ikut sertakan (include) data Satker-nya
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            satker: true, // <-- Ini akan mengambil data Satker yang terhubung
          },
        });

        if (!user) return null;

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // Kembalikan semua data yang dibutuhkan, termasuk objek 'satker'
        return {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          satker: user.satker,
          satkerId: user.satkerId,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // Callback 'jwt' sekarang juga akan menerima data 'satker' dari 'authorize'
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nama = user.nama;
        token.satker = user.satker; // Simpan data satker ke token
        token.satkerId = user.satkerId; // Simpan satkerId ke token
      }
      return token;
    },
    // Callback 'session' akan mengambil data dari token dan menyediakannya ke klien
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nama = token.nama;
        session.user.satker = token.satker; // Teruskan data satker ke sesi
        session.user.satkerId = token.satkerId; // Teruskan satkerId ke sesi
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
