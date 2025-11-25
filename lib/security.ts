// lib/security.ts

import { securityLogger } from './logger';

interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  ip: string;
}

// In-memory storage untuk login attempts (production harus pakai Redis)
const loginAttempts = new Map<string, LoginAttempt[]>();
const lockedAccounts = new Map<string, Date>();

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15') * 60 * 1000;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 menit

export const securityService = {
  /**
   * Check if account is locked
   */
  isAccountLocked(email: string): boolean {
    const lockUntil = lockedAccounts.get(email);
    if (!lockUntil) return false;

    const now = new Date();
    if (now < lockUntil) {
      return true;
    }

    // Unlock account jika waktu lockout sudah habis
    lockedAccounts.delete(email);
    loginAttempts.delete(email);
    return false;
  },

  /**
   * Get remaining lockout time in minutes
   */
  getRemainingLockoutTime(email: string): number {
    const lockUntil = lockedAccounts.get(email);
    if (!lockUntil) return 0;

    const remaining = Math.max(0, lockUntil.getTime() - Date.now());
    return Math.ceil(remaining / 60000);
  },

  /**
   * Record login attempt
   */
  recordLoginAttempt(email: string, ip: string, success: boolean): void {
    const attempts = loginAttempts.get(email) || [];
    const now = new Date();

    // Filter attempts dalam window waktu yang ditentukan
    const recentAttempts = attempts.filter(
      (attempt) => now.getTime() - attempt.timestamp.getTime() < ATTEMPT_WINDOW
    );

    recentAttempts.push({
      email,
      timestamp: now,
      success,
      ip,
    });

    loginAttempts.set(email, recentAttempts);

    // Check jika perlu lock account
    const failedAttempts = recentAttempts.filter((a) => !a.success);
    if (failedAttempts.length >= MAX_ATTEMPTS) {
      const lockUntil = new Date(now.getTime() + LOCKOUT_DURATION);
      lockedAccounts.set(email, lockUntil);
      securityLogger.logAccountLockout(email, ip, failedAttempts.length);
    }
  },

  /**
   * Reset login attempts setelah login berhasil
   */
  resetLoginAttempts(email: string): void {
    loginAttempts.delete(email);
    lockedAccounts.delete(email);
  },

  /**
   * Get failed login attempts count
   */
  getFailedAttempts(email: string): number {
    const attempts = loginAttempts.get(email) || [];
    const now = new Date();
    
    return attempts.filter(
      (attempt) =>
        !attempt.success &&
        now.getTime() - attempt.timestamp.getTime() < ATTEMPT_WINDOW
    ).length;
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isStrong: boolean;
    weaknesses: string[];
  } {
    const weaknesses: string[] = [];

    if (password.length < 12) {
      weaknesses.push('Password terlalu pendek (minimal 12 karakter)');
    }

    if (!/[a-z]/.test(password)) {
      weaknesses.push('Harus mengandung huruf kecil');
    }

    if (!/[A-Z]/.test(password)) {
      weaknesses.push('Harus mengandung huruf besar');
    }

    if (!/[0-9]/.test(password)) {
      weaknesses.push('Harus mengandung angka');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      weaknesses.push('Harus mengandung karakter spesial');
    }

    // Check common passwords
    const commonPasswords = [
      'password', '12345678', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'sunshine',
    ];

    if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
      weaknesses.push('Password mengandung kata yang umum digunakan');
    }

    return {
      isStrong: weaknesses.length === 0,
      weaknesses,
    };
  },

  /**
   * Get client IP address from request
   */
  getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    return 'unknown';
  },

  /**
   * Sanitize filename untuk mencegah path traversal
   */
  sanitizeFilename(filename: string): string {
    // Remove path separators and dangerous characters
    return filename
      .replace(/[\/\\]/g, '')
      .replace(/\.\./g, '')
      .replace(/[^a-z0-9._-]/gi, '_')
      .toLowerCase();
  },

  /**
   * Check if request is from trusted source
   */
  isTrustedSource(request: Request): boolean {
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Dalam development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // Check if request comes from same origin
    if (referer && origin && host) {
      const refererUrl = new URL(referer);
      const originUrl = new URL(origin);
      
      return refererUrl.host === host && originUrl.host === host;
    }

    return false;
  },
};

export default securityService;
