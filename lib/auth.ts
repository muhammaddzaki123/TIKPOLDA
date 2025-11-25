// lib/auth.ts

import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { securityLogger } from '@/lib/logger';
import { securityService } from '@/lib/security';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Get client IP
        const ip = securityService.getClientIp(req as unknown as Request);

        // Check if account is locked
        if (securityService.isAccountLocked(credentials.email)) {
          const remainingTime = securityService.getRemainingLockoutTime(credentials.email);
          securityLogger.logFailedLogin(
            credentials.email, 
            ip, 
            `Account locked. ${remainingTime} minutes remaining`
          );
          throw new Error(`Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${remainingTime} menit.`);
        }

        // --- PERBAIKAN UTAMA DI SINI ---
        // Saat mencari user, kita juga ikut sertakan (include) data Satker-nya
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            satker: true, // <-- Ini akan mengambil data Satker yang terhubung
          },
        });

        if (!user) {
          securityService.recordLoginAttempt(credentials.email, ip, false);
          securityLogger.logFailedLogin(credentials.email, ip, 'User not found');
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          securityService.recordLoginAttempt(credentials.email, ip, false);
          securityLogger.logFailedLogin(credentials.email, ip, 'Invalid password');
          return null;
        }

        // Login successful - reset attempts and log
        securityService.resetLoginAttempts(credentials.email);
        securityLogger.logSuccessfulLogin(user.id, user.email, ip);

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
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // Update session every 1 hour
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
    error: '/login', // Redirect errors to login page
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Enable CSRF protection
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
