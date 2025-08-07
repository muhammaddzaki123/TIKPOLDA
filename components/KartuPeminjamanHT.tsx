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
      className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg shadow-2xl overflow-hidden"
      style={{ aspectRatio: '1.586/1', height: '240px' }} // Rasio KTP/SIM (85.6mm x 54mm)
    >
      <div className="h-full flex flex-col">
        {/* Header Kartu */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">KARTU PEMINJAMAN HT</h2>
            <p className="text-xs opacity-90">POLDA NTB</p>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">📻</span>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="flex-1 px-4 py-3 flex">
          {/* Foto Personil */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-16 h-20 bg-white/20 rounded-md overflow-hidden border border-white/30">
              {personil.fotoUrl ? (
                <Image
                  src={personil.fotoUrl}
                  alt={`Foto ${personil.nama}`}
                  width={64}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60 text-xs">
                  No Photo
                </div>
              )}
            </div>
          </div>

          {/* Data Personil dan HT */}
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1">
            {/* Kolom Kiri */}
            <div className="space-y-1">
              <div>
                <p className="text-xs opacity-75 leading-tight">NAMA</p>
                <p className="font-semibold text-sm leading-tight">{personil.nama}</p>
              </div>
              
              <div>
                <p className="text-xs opacity-75 leading-tight">NRP</p>
                <p className="font-medium text-xs leading-tight">{personil.nrp}</p>
              </div>

              <div>
                <p className="text-xs opacity-75 leading-tight">PANGKAT</p>
                <p className="font-medium text-xs leading-tight">{personil.pangkat}</p>
              </div>

              <div>
                <p className="text-xs opacity-75 leading-tight">JABATAN</p>
                <p className="font-medium text-xs leading-tight">{personil.jabatan}</p>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-1">
              <div>
                <p className="text-xs opacity-75 leading-tight">KODE HT</p>
                <p className="font-bold text-sm leading-tight">{ht.kodeHT}</p>
              </div>

              <div>
                <p className="text-xs opacity-75 leading-tight">MERK/JENIS</p>
                <p className="font-medium text-xs leading-tight">{ht.merk} - {ht.jenis}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs opacity-75 leading-tight">TGL PINJAM</p>
                  <p className="font-medium text-xs text-white leading-tight">
                    {format(new Date(tanggalPinjam), 'dd/MM/yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75 leading-tight">MASA EXP</p>
                  <p className="font-bold text-xs text-yellow-300 leading-tight">
                    {estimasiKembali 
                      ? format(new Date(estimasiKembali), 'dd/MM/yyyy', { locale: id })
                      : 'Tidak ditentukan'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-1">
          <p className="text-xs text-center text-white font-medium">
            Kartu ini berlaku sebagai bukti peminjaman resmi
          </p>
        </div>
      </div>
    </div>
  );
}
