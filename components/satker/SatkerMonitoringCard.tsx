'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, RadioTower, ChevronDown, ChevronUp } from 'lucide-react';
import { Prisma } from '@prisma/client';

// Mendefinisikan tipe data yang kompleks yang akan diterima oleh komponen ini
type SatkerWithDetails = Prisma.SatkerGetPayload<{
  include: {
    personil: true;
    ht: {
      include: {
        peminjaman: {
          where: { tanggalKembali: null };
          include: { personil: true };
        };
      };
    };
    _count: {
      select: { personil: true; ht: true };
    };
  };
}>;

interface SatkerCardProps {
  satker: SatkerWithDetails;
}

export function SatkerMonitoringCard({ satker }: SatkerCardProps) {
  const [isPersonilOpen, setIsPersonilOpen] = useState(false);
  const [isHtOpen, setIsHtOpen] = useState(false);

  // Menghitung jumlah HT yang sedang dipinjam
  const htDipinjamCount = satker.ht.filter(h => h.peminjaman.length > 0).length;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{satker.nama}</CardTitle>
                <CardDescription>Kode: {satker.kode}</CardDescription>
            </div>
            <Badge variant="secondary">ID: {satker.id.substring(0, 10)}...</Badge>
        </div>
        <div className="flex gap-4 pt-4">
          <div className="flex items-center text-sm text-slate-600">
            <Users className="mr-2 h-4 w-4 text-cyan-600" />
            <span>{satker._count.personil} Personil</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <RadioTower className="mr-2 h-4 w-4 text-indigo-600" />
            <span>{satker._count.ht} Unit HT ({htDipinjamCount} dipinjam)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        {/* Bagian Daftar Personil (Collapsible) */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between px-2"
            onClick={() => setIsPersonilOpen(!isPersonilOpen)}
          >
            Lihat Daftar Personil
            {isPersonilOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
          {isPersonilOpen && (
            <div className="mt-2 space-y-3 rounded-md border bg-slate-50 p-3 max-h-48 overflow-y-auto">
              {satker.personil.length > 0 ? (
                satker.personil.map((p) => (
                  <div key={p.id} className="text-sm">
                    <p className="font-medium">{p.nama}</p>
                    <p className="text-xs text-slate-500">NRP: {p.nrp} - {p.jabatan}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-400">Belum ada data personil.</p>
              )}
            </div>
          )}
        </div>

        {/* Bagian Daftar HT (Collapsible) */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between px-2"
            onClick={() => setIsHtOpen(!isHtOpen)}
          >
            Lihat Daftar Aset HT
            {isHtOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
          {isHtOpen && (
            <div className="mt-2 space-y-3 rounded-md border bg-slate-50 p-3 max-h-48 overflow-y-auto">
              {satker.ht.length > 0 ? (
                satker.ht.map((h) => {
                  const pemegang = h.peminjaman[0]?.personil;
                  return (
                    <div key={h.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{h.kodeHT} ({h.merk})</p>
                        <p className="text-xs text-slate-500">
                          Pemegang: {pemegang ? pemegang.nama : '-'}
                        </p>
                      </div>
                      <Badge variant={pemegang ? 'destructive' : 'default'}>
                        {pemegang ? 'Dipinjam' : 'Tersedia'}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-slate-400">Belum ada data HT.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}