// lib/supabase/storage.ts
'use server';

import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client untuk server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Upload file ke Supabase Storage
 * @param file File yang akan diupload
 * @param bucketName Nama bucket di Supabase Storage (default: 'foto-personil')
 * @param folder Subfolder di dalam bucket (default: 'foto_personil')
 * @returns Public URL dari file yang diupload
 */
export async function uploadFileToSupabase(
  file: File,
  bucketName: string = 'foto-personil',
  folder: string = 'foto_personil'
): Promise<string> {
  // Validasi ukuran file (1MB untuk gambar)
  if (file.size > 1024 * 1024) {
    throw new Error('Ukuran file tidak boleh lebih dari 1MB.');
  }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file harus JPG, JPEG, atau PNG.');
  }

  try {
    // Generate nama file unik
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Gagal mengupload file: ${error.message}`);
    }

    // Dapatkan public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Gagal mengupload foto ke cloud storage.');
  }
}

/**
 * Hapus file dari Supabase Storage
 * @param fileUrl URL file yang akan dihapus
 * @param bucketName Nama bucket di Supabase Storage
 */
export async function deleteFileFromSupabase(
  fileUrl: string,
  bucketName: string = 'foto-personil'
): Promise<void> {
  try {
    // Extract path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucketName}/`);
    if (pathParts.length < 2) {
      throw new Error('Invalid file URL');
    }
    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Gagal menghapus file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    // Don't throw error untuk delete, karena file mungkin sudah tidak ada
  }
}

/**
 * Upload file PDF atau dokumen ke Supabase Storage
 * @param file File PDF/dokumen yang akan diupload
 * @param bucketName Nama bucket di Supabase Storage (default: 'dokumen-peminjaman')
 * @param folder Subfolder di dalam bucket (default: 'berita_acara')
 * @returns Public URL dari file yang diupload
 */
export async function uploadPdfToSupabase(
  file: File,
  bucketName: string = 'dokumen-peminjaman',
  folder: string = 'berita_acara'
): Promise<string> {
  // Validasi ukuran file (2MB untuk PDF)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Ukuran file tidak boleh lebih dari 2MB.');
  }

  // Validasi tipe file
  if (file.type !== 'application/pdf') {
    throw new Error('File yang diunggah harus berformat PDF.');
  }

  try {
    // Generate nama file unik
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name.replace(/\s/g, '_');
    const filename = `${timestamp}_${randomString}_${originalName}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Gagal mengupload file: ${error.message}`);
    }

    // Dapatkan public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading PDF to Supabase:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Gagal mengupload dokumen ke cloud storage.');
  }
}
