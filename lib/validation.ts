// lib/validation.ts

import { z } from 'zod';
import validator from 'validator';

// Password validation schema dengan kompleksitas
export const passwordSchema = z
  .string()
  .min(12, 'Password minimal 12 karakter')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^a-zA-Z0-9]/, 'Password harus mengandung karakter spesial')
  .refine((password) => {
    // Check against common passwords
    const commonPasswords = [
      'Password123!', 'Admin123!', 'Welcome123!',
      'Qwerty123!', 'Letmein123!', 'Password1!',
    ];
    return !commonPasswords.includes(password);
  }, 'Password terlalu umum, gunakan kombinasi yang lebih unik');

// Email validation
export const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .refine((email) => validator.isEmail(email), 'Email tidak valid');

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password wajib diisi'),
});

// Register schema
export const registerSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .refine((name) => /^[a-zA-Z0-9\s]+$/.test(name), 
      'Nama hanya boleh berisi huruf dan angka'),
  email: emailSchema,
  password: passwordSchema,
});

// Personil schema
export const personilSchema = z.object({
  nrp: z
    .string()
    .min(5, 'NRP minimal 5 karakter')
    .max(20, 'NRP maksimal 20 karakter')
    .refine((nrp) => /^[0-9]+$/.test(nrp), 'NRP hanya boleh berisi angka'),
  nama: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  jabatan: z
    .string()
    .min(2, 'Jabatan minimal 2 karakter')
    .max(100, 'Jabatan maksimal 100 karakter'),
  pangkat: z
    .string()
    .min(2, 'Pangkat minimal 2 karakter')
    .max(50, 'Pangkat maksimal 50 karakter'),
  subSatker: z.string().optional(),
});

// HT (Handy Talky) schema
export const htSchema = z.object({
  serialNumber: z
    .string()
    .min(3, 'Serial Number minimal 3 karakter')
    .max(50, 'Serial Number maksimal 50 karakter')
    .refine((serial) => /^[A-Z0-9-]+$/i.test(serial), 
      'Serial Number hanya boleh berisi huruf, angka, dan tanda hubung'),
  merk: z
    .string()
    .min(2, 'Merk minimal 2 karakter')
    .max(50, 'Merk maksimal 50 karakter'),
  jenis: z
    .string()
    .min(2, 'Jenis minimal 2 karakter')
    .max(50, 'Jenis maksimal 50 karakter'),
  tahunBuat: z
    .number()
    .min(1990, 'Tahun buat minimal 1990')
    .max(new Date().getFullYear() + 1, 'Tahun buat tidak valid'),
  tahunPeroleh: z
    .number()
    .min(1990, 'Tahun perolehan minimal 1990')
    .max(new Date().getFullYear() + 1, 'Tahun perolehan tidak valid'),
});

// Satker schema
export const satkerSchema = z.object({
  kode: z
    .string()
    .min(2, 'Kode satker minimal 2 karakter')
    .max(20, 'Kode satker maksimal 20 karakter')
    .refine((kode) => /^[A-Z0-9-]+$/i.test(kode), 
      'Kode satker hanya boleh berisi huruf, angka, dan tanda hubung'),
  nama: z
    .string()
    .min(3, 'Nama satker minimal 3 karakter')
    .max(100, 'Nama satker maksimal 100 karakter'),
});

// File upload validation
export const validateFileUpload = (file: File) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '5') * 1024 * 1024; // Default 5MB
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(',');

  if (file.size > maxSize) {
    throw new Error(`File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipe file tidak diizinkan. Hanya: ${allowedTypes.join(', ')}`);
  }

  // Sanitize filename
  const sanitizedName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();
  
  return {
    isValid: true,
    sanitizedName,
  };
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  return validator.escape(validator.trim(input));
};

// Validate and sanitize ID
export const validateId = (id: string): boolean => {
  return validator.isAlphanumeric(id, 'en-US', { ignore: '-_' });
};
