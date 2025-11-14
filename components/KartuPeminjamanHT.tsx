'use client';

import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import type { Peminjaman, HT, Personil } from '@prisma/client';
import { getOptimizedImageUrl } from '@/lib/image-utils';

type PeminjamanWithDetails = Peminjaman & {
  ht: HT;
  personil: Personil;
  estimasiKembali: Date | null;
};

interface KartuPeminjamanHTProps {
  data: PeminjamanWithDetails;
}

export function KartuPeminjamanHT({ data }: KartuPeminjamanHTProps) {
  const { personil, ht, tanggalPinjam, estimasiKembali } = data;

  return (
    <div
      id="kartu-peminjaman"
      className="relative mx-auto overflow-hidden"
      style={{ 
        width: '323px',
        height: '220px',
        background: 'linear-gradient(to bottom, #1a4d9e 0%, #2563eb 100%)',
        borderRadius: '6px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Background Pattern - Subtle */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
        }}></div>
      </div>

      <div className="relative z-10 h-full flex flex-col text-white">
        {/* Header Kartu */}
        <div className="bg-blue-800 px-3 py-1.5 flex items-center justify-between border-b-2 border-yellow-400">
          {/* Logo Polri Kiri */}
          <div className="w-9 h-9 relative shrink-0">
            <Image
              src="/polri.png"
              alt="Logo Polri"
              width={36}
              height={36}
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          {/* Judul Tengah */}
          <div className="text-center flex-1 mx-2">
            <h2 className="text-[13px] font-extrabold tracking-wide text-yellow-300 uppercase leading-tight">
              POLDA NUSA TENGGARA BARAT
            </h2>
          </div>
          {/* Logo Polda Kanan */}
          <div className="w-9 h-9 relative shrink-0">
            <Image
              src="/polda.png"
              alt="Logo Polda NTB"
              width={36}
              height={36}
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Konten Utama */}
        <div className="flex-1 px-3 py-1.5 flex gap-3">
          {/* Foto Personil */}
          <div className="flex-shrink-0">
            <div className="w-[70px] h-[88px] bg-white rounded overflow-hidden border-2 border-gray-200">
              {personil.fotoUrl ? (
                <Image
                  src={getOptimizedImageUrl(personil.fotoUrl, true) || ''}
                  alt={`Foto ${personil.nama}`}
                  width={70}
                  height={88}
                  className="w-full h-full object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs font-semibold">
                  NO PHOTO
                </div>
              )}
            </div>
          </div>

          {/* Data Personil dan HT */}
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {/* Kolom Kiri */}
            <div className="space-y-1.5">
              <div>
                <p className="text-[9px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Nama Personil</p>
                <p className="font-bold text-[13px] leading-tight text-white">{personil.nama}</p>
              </div>
              <div>
                <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">NRP</p>
                <p className="font-semibold text-[11px] leading-tight text-white">{personil.nrp}</p>
              </div>
              <div>
                <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Jabatan</p>
                <p className="font-medium text-[11px] leading-tight text-white">{personil.jabatan}</p>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-1.5">
              <div>
                <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Pangkat</p>
                <p className="font-semibold text-[11px] leading-tight text-white">{personil.pangkat}</p>
              </div>
              <div>
                <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Serial Number</p>
                <p className="font-bold text-[13px] leading-tight text-yellow-200">{ht.serialNumber}</p>
              </div>
              <div>
                <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Merk</p>
                <p className="font-semibold text-[11px] leading-tight text-white">{ht.merk}</p>
              </div>
            </div>

            {/* Baris Bawah - Full Width */}
            <div className="col-span-2 mt-0.5 pt-1.5 border-t border-white/20">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Tgl Pinjam</p>
                  <p className="font-semibold text-[11px] leading-tight text-white">
                    {format(new Date(tanggalPinjam), 'dd/MM/yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] text-yellow-300 font-bold uppercase tracking-wide mb-0.5">Batas Kembali</p>
                  <p className="font-bold text-[11px] leading-tight text-red-300">
                    {estimasiKembali
                      ? format(new Date(estimasiKembali), 'dd/MM/yyyy', { locale: id })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-800 px-3 py-1 border-t-2 border-yellow-400">
          <p className="text-[8.5px] text-center text-yellow-200 font-semibold tracking-wide uppercase">
            Divisi TIK Polda NTB • Kartu Bukti Peminjaman Resmi
          </p>
        </div>
      </div>
    </div>
  );
}
