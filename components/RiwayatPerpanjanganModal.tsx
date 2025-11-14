// components/RiwayatPerpanjanganModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, FileText, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Peminjaman, HT, Personil, RiwayatPerpanjangan as PrismaRiwayatPerpanjangan } from '@prisma/client';

type PeminjamanWithDetails = (Peminjaman & { 
  ht: HT; 
  personil: Personil; 
  estimasiKembali?: Date | null;
  riwayatPerpanjangan?: PrismaRiwayatPerpanjangan[];
});

interface RiwayatPerpanjanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  peminjaman: PeminjamanWithDetails | null;
}

export function RiwayatPerpanjanganModal({ isOpen, onClose, peminjaman }: RiwayatPerpanjanganModalProps) {
  const [riwayat, setRiwayat] = useState<PrismaRiwayatPerpanjangan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRiwayat = async () => {
    if (!peminjaman) return;
    
    if (peminjaman.riwayatPerpanjangan) {
      setRiwayat(peminjaman.riwayatPerpanjangan);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/peminjaman/${peminjaman.id}/riwayat-perpanjangan`);
      if (response.ok) {
        const data = await response.json();
        setRiwayat(data.riwayat || []);
      }
    } catch (error) {
      console.error('Error fetching riwayat perpanjangan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && peminjaman) {
      fetchRiwayat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, peminjaman]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Riwayat Perpanjangan Peminjaman</DialogTitle>
          {peminjaman && (
            <div className="text-xs sm:text-sm text-muted-foreground mt-2 space-y-1">
              <p><strong>HT:</strong> {peminjaman.ht.serialNumber} - {peminjaman.ht.merk}</p>
              <p><strong>Peminjam:</strong> {peminjaman.personil.nama} ({peminjaman.personil.nrp})</p>
              <p><strong>Tanggal Pinjam:</strong> {format(new Date(peminjaman.tanggalPinjam), 'dd MMMM yyyy', { locale: id })}</p>
            </div>
          )}
        </DialogHeader>

        <div className="py-3 sm:py-4">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Memuat riwayat perpanjangan...
            </div>
          ) : riwayat.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
              Belum ada riwayat perpanjangan untuk peminjaman ini.
            </div>
          ) : (
            <div className="space-y-3">
              {riwayat.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 bg-slate-50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        Perpanjangan #{riwayat.length - index}
                      </Badge>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </span>
                    </div>
                  </div>

                  {/* Perubahan Tanggal */}
                  <div className="bg-white border rounded-md p-2 sm:p-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="font-medium">Estimasi Kembali:</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-red-600 line-through">
                          {item.estimasiKembaliLama 
                            ? format(new Date(item.estimasiKembaliLama), 'dd MMM yyyy', { locale: id })
                            : '-'}
                        </span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="font-bold text-green-600">
                          {format(new Date(item.estimasiKembaliBaru), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SPRINT */}
                  {(item.fileUrlBaru || item.fileUrlLama) && (
                    <div className="bg-white border rounded-md p-2 sm:p-3">
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <span className="font-medium">SPRINT:</span>
                          <div className="flex flex-wrap gap-2">
                            {item.fileUrlLama && (
                              <Button variant="outline" size="sm" className="h-7 text-[10px] sm:text-xs" asChild>
                                <Link href={item.fileUrlLama} target="_blank">
                                  SPRINT Lama
                                </Link>
                              </Button>
                            )}
                            {item.fileUrlBaru && (
                              <Button variant="default" size="sm" className="h-7 text-[10px] sm:text-xs" asChild>
                                <Link href={item.fileUrlBaru} target="_blank">
                                  SPRINT Baru
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Catatan */}
                  {item.catatan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 sm:p-3">
                      <p className="text-xs sm:text-sm">
                        <strong className="text-blue-900">Catatan:</strong>{' '}
                        <span className="text-blue-800">{item.catatan}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
