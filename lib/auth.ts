// lib/auth.ts

import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { securityLogger } from '@/lib/logger';
import { securityService } from '@/lib/security';

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');

// Helper function to get IP from NextAuth request
const getClientIp = (req: { headers?: Record<string, string | string[]> }): string => {
  // NextAuth request object is different from NextRequest
  if (req?.headers) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    
    if (forwarded) {
      return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
    }
    
    if (realIp) {
      return typeof realIp === 'string' ? realIp : realIp[0];
    }
  }
  
  return 'unknown';
};

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
        const ip = getClientIp(req);

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
          const failedAttempts = securityService.getFailedAttempts(credentials.email);
          const remainingAttempts = MAX_ATTEMPTS - failedAttempts;
          
          securityLogger.logFailedLogin(credentials.email, ip, 'User not found');
          
          if (remainingAttempts > 0) {
            throw new Error(`Email tidak ditemukan. Sisa ${remainingAttempts} percobaan sebelum akun terkunci.`);
          }
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          securityService.recordLoginAttempt(credentials.email, ip, false);
          const failedAttempts = securityService.getFailedAttempts(credentials.email);
          const remainingAttempts = MAX_ATTEMPTS - failedAttempts;
          
          securityLogger.logFailedLogin(credentials.email, ip, 'Invalid password');
          
          if (remainingAttempts > 0) {
            throw new Error(`Password salah. Sisa ${remainingAttempts} percobaan sebelum akun terkunci.`);
          } else {
            throw new Error(`Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.`);
          }
        }

        // Login successful - reset attempts and log
        securityService.resetLoginAttempts(credentials.email);
        securityLogger.logSuccessfulLogin(user.id, user.email, ip);

        // Kembalikan semua data yang dibutuhkan, termasuk loginTime untuk single session
        return {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          satker: user.satker,
          satkerId: user.satkerId,
          loginTime: Date.now(), // Will be used to invalidate old sessions
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
        // Login baru - simpan semua data termasuk loginTime
        token.id = user.id;
        token.role = user.role;
        token.nama = user.nama;
        token.satker = user.satker;
        token.satkerId = user.satkerId;
        token.loginTime = user.loginTime; // New login timestamp
        
        if (user.loginTime) {
          console.log(`[JWT] New token created for user ${user.email} at ${new Date(user.loginTime).toISOString()}`);
        }
      }
      
      return token;
    },
    // Callback 'session' akan mengambil data dari token dan menyediakannya ke klien
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nama = token.nama;
        session.user.satker = token.satker;
        session.user.satkerId = token.satkerId;
      }
      return session;
    },
  },
  events: {
    // Event saat user sign in
    async signIn({ user }) {
      console.log(`[AUTH] User ${user.email} logged in at ${new Date().toISOString()}`);
    },
    // Event saat user sign out
    async signOut({ token }) {
      if (token?.email) {
        console.log(`[AUTH] User ${token.email} logged out at ${new Date().toISOString()}`);
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Auto-detect production HTTPS for secure cookies
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://'),
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_URL?.startsWith('https://')
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://'),
      },
    },
  },
};
