'use client';

import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import type { Peminjaman, HT, Personil } from '@prisma/client';

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
      className="relative w-full max-w-3xl mx-auto bg-[#3E2723] text-white rounded-xl shadow-2xl shadow-black/50 overflow-hidden border-2 border-yellow-800/50"
      style={{ aspectRatio: '1.586 / 1', minHeight: '360px' }} // Rasio KTP/SIM, ukuran lebih besar
    >
      {/* Latar Belakang dengan Pola Halus */}
      <div 
        className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20"
      ></div>

      {/* Watermark Logo TIK di tengah */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-5 pointer-events-none">
        <Image
          src="/tik.png"
          alt="Watermark Divisi TIK"
          layout="fill"
          objectFit="contain"
        />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header Kartu */}
        <div className="bg-black/30 px-6 py-3 flex items-center justify-between border-b-2 border-yellow-700">
          {/* Logo Polri Kiri */}
          <div className="w-16 h-16 relative">
            <Image
              src="/polri.png"
              alt="Logo Polri"
              layout="fill"
              objectFit="contain"
            />
          </div>
          {/* Judul Tengah */}
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-wider text-yellow-500">KARTU PEMINJAMAN</h2>
            <p className="text-lg opacity-90 font-semibold">ALAT KOMUNIKASI HT</p>
          </div>
          {/* Logo Polda Kanan */}
          <div className="w-16 h-16 relative">
            <Image
              src="/polda.png"
              alt="Logo Polda NTB"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        {/* Konten Utama */}
        <div className="flex-1 px-6 py-4 flex">
          {/* Foto Personil */}
          <div className="flex-shrink-0 mr-6">
            <div className="w-28 h-36 bg-black/20 rounded-lg overflow-hidden border-2 border-yellow-600/60 p-1">
              {personil.fotoUrl ? (
                <Image
                  src={personil.fotoUrl}
                  alt={`Foto ${personil.nama}`}
                  width={112}
                  height={144}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
                  No Photo
                </div>
              )}
            </div>
          </div>

          {/* Data Personil dan HT */}
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 text-base">
            {/* Kolom Kiri */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">NAMA</p>
                <p className="font-semibold text-lg leading-tight">{personil.nama}</p>
              </div>
              <div>
                <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">NRP / PANGKAT</p>
                <p className="font-medium leading-tight">{personil.nrp} / {personil.pangkat}</p>
              </div>
              <div>
                <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">JABATAN</p>
                <p className="font-medium leading-tight">{personil.jabatan}</p>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">SERIAL NUMBER</p>
                <p className="font-bold text-lg leading-tight">{ht.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">MERK / JENIS</p>
                <p className="font-medium leading-tight">{ht.merk} - {ht.jenis}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">TGL PINJAM</p>
                  <p className="font-semibold text-white leading-tight">
                    {format(new Date(tanggalPinjam), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-yellow-500/80 leading-tight tracking-wider">BATAS WAKTU</p>
                  <p className="font-bold text-yellow-400 leading-tight">
                    {estimasiKembali
                      ? format(new Date(estimasiKembali), 'dd MMM yyyy', { locale: id })
                      : 'Tidak ditentukan'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/30 px-6 py-2 border-t-2 border-yellow-700">
          <p className="text-sm text-center text-white/80 font-medium">
            Kartu ini merupakan bukti peminjaman resmi dan wajib dijaga
          </p>
        </div>
      </div>
    </div>
  );
}
