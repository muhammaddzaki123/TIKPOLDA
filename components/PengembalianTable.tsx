// File: components/PengembalianTable.tsx

'use client';

import { useState, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPengembalian } from '@/app/satker-admin/peminjaman/actions';
import type { Peminjaman, HT, Personil } from '@prisma/client';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { KartuPeminjamanModal } from './KartuPeminjamanModal';
import { PerpanjanganModal } from './PerpanjanganModal';
import { RiwayatPerpanjanganModal } from './RiwayatPerpanjanganModal';

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

/*
  PERUBAHAN DI SINI:
  - Tipe `estimasiKembali` diubah menjadi `Date | null` agar bisa menerima data lama.
*/
type PeminjamanAktif = (Peminjaman & { 
  ht: HT; 
  personil: Personil; 
  estimasiKembali: Date | null; // <-- Tipe diubah di sini
});

interface PengembalianTableProps {
  data: PeminjamanAktif[];
}

export function PengembalianTable({ data }: PengembalianTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PeminjamanAktif | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // State untuk modal kartu
  const [isKartuModalOpen, setIsKartuModalOpen] = useState(false);
  const [selectedKartuData, setSelectedKartuData] = useState<PeminjamanAktif | null>(null);

  // State untuk modal perpanjangan
  const [isPerpanjanganModalOpen, setIsPerpanjanganModalOpen] = useState(false);
  const [selectedPerpanjanganData, setSelectedPerpanjanganData] = useState<PeminjamanAktif | null>(null);

  // State untuk modal riwayat perpanjangan
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState(false);
  const [selectedRiwayatData, setSelectedRiwayatData] = useState<PeminjamanAktif | null>(null);

  const openDialog = (peminjaman: PeminjamanAktif) => {
    setSelectedPeminjaman(peminjaman);
    setIsDialogOpen(true);
  };

  const openKartuModal = (peminjaman: PeminjamanAktif) => {
    setSelectedKartuData(peminjaman);
    setIsKartuModalOpen(true);
  };

  const openPerpanjanganModal = (peminjaman: PeminjamanAktif) => {
    setSelectedPerpanjanganData(peminjaman);
    setIsPerpanjanganModalOpen(true);
  };

  const openRiwayatModal = (peminjaman: PeminjamanAktif) => {
    setSelectedRiwayatData(peminjaman);
    setIsRiwayatModalOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createPengembalian(formData);
        setIsDialogOpen(false);
        toast.success('Pengembalian HT berhasil dicatat.');
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Terjadi kesalahan yang tidak diketahui.');
        }
      }
    });
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Serial Number</TableHead>
              <TableHead className="text-xs sm:text-sm">Peminjam</TableHead>
              <TableHead className="text-xs sm:text-sm">Tgl Pinjam</TableHead>
              <TableHead className="text-xs sm:text-sm">Batas Kembali</TableHead>
              <TableHead className="text-xs sm:text-sm">Sprint</TableHead>
              <TableHead className="text-xs sm:text-sm">Kartu</TableHead>
              <TableHead className="text-xs sm:text-sm">Riwayat</TableHead>
              <TableHead className="text-right text-xs sm:text-sm">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((peminjaman) => {
                /*
                  PERUBAHAN DI SINI:
                  - Logika `isOverdue` sekarang mengecek apakah `estimasiKembali` ada sebelum membandingkan.
                */
                const isOverdue = peminjaman.estimasiKembali ? new Date() > new Date(peminjaman.estimasiKembali) : false;

                return (
                  <TableRow key={peminjaman.id} className={cn(isOverdue && "bg-red-50 text-red-900")}>
                    <TableCell className="font-medium text-xs sm:text-sm">{peminjaman.ht.serialNumber}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <div>{peminjaman.personil.nama}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{peminjaman.personil.nrp}</div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{format(new Date(peminjaman.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</TableCell>
                    
                    {/*
                      PERUBAHAN DI SINI:
                      - Tampilkan tanggal jika ada, atau tampilkan placeholder jika null.
                    */}
                    <TableCell className={cn("text-xs sm:text-sm", isOverdue && "font-bold")}>
                      {peminjaman.estimasiKembali 
                        ? format(new Date(peminjaman.estimasiKembali), 'dd MMM yyyy', { locale: id }) 
                        : <span className="text-[10px] sm:text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    
                    <TableCell>
                      {peminjaman.fileUrl ? (
                        <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs" asChild>
                          <Link href={peminjaman.fileUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-1 h-3 w-3" /> PDF
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 sm:h-8 text-[10px] sm:text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        onClick={() => openKartuModal(peminjaman)}
                      >
                        Lihat Kartu
                      </Button>
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 sm:h-8 text-[10px] sm:text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                        onClick={() => openRiwayatModal(peminjaman)}
                      >
                        Lihat
                      </Button>
                    </TableCell>
                    
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="h-7 sm:h-8 text-[10px] sm:text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200" 
                        onClick={() => openPerpanjanganModal(peminjaman)}
                      >
                        Perpanjang
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 sm:h-8 text-[10px] sm:text-xs" 
                        onClick={() => openDialog(peminjaman)}
                      >
                        Kembalikan
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Tidak ada HT yang sedang dipinjam.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.length > 0 ? (
          data.map((peminjaman) => {
            const isOverdue = peminjaman.estimasiKembali ? new Date() > new Date(peminjaman.estimasiKembali) : false;
            
            return (
              <div key={peminjaman.id} className={cn(
                "rounded-lg border p-3 space-y-3 shadow-sm",
                isOverdue && "bg-red-50 border-red-200"
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{peminjaman.ht.serialNumber}</h3>
                    <p className="text-xs text-muted-foreground">{peminjaman.ht.merk}</p>
                  </div>
                  {isOverdue && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">Terlambat</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Peminjam</p>
                    <p className="font-medium">{peminjaman.personil.nama}</p>
                    <p className="text-[10px] text-muted-foreground">{peminjaman.personil.nrp}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Tgl Pinjam</p>
                    <p className="font-medium">{format(new Date(peminjaman.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Batas Kembali</p>
                    <p className={cn("font-medium", isOverdue && "text-red-700 font-bold")}>
                      {peminjaman.estimasiKembali 
                        ? format(new Date(peminjaman.estimasiKembali), 'dd MMM yyyy', { locale: id }) 
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {peminjaman.fileUrl && (
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                      <Link href={peminjaman.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-1 h-3 w-3" /> Lihat Sprint PDF
                      </Link>
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      onClick={() => openKartuModal(peminjaman)}
                    >
                      Kartu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                      onClick={() => openRiwayatModal(peminjaman)}
                    >
                      Riwayat
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="w-full text-xs h-8 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                    onClick={() => openPerpanjanganModal(peminjaman)}
                  >
                    Perpanjang Peminjaman
                  </Button>
                  <Button 
                    size="sm" 
                    className="w-full text-xs h-8"
                    onClick={() => openDialog(peminjaman)}
                  >
                    Kembalikan HT
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
            Tidak ada HT yang sedang dipinjam.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Formulir Pengembalian HT</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Anda akan mencatat pengembalian untuk HT <strong>{selectedPeminjaman?.ht.serialNumber}</strong> oleh <strong>{selectedPeminjaman?.personil.nama}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit}>
            <input type="hidden" name="peminjamanId" value={selectedPeminjaman?.id ?? ''} />
            <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kondisiSaatKembali" className="text-xs sm:text-sm">Kondisi HT Saat Dikembalikan</Label>
                <Textarea id="kondisiSaatKembali" name="kondisiSaatKembali" placeholder="Contoh: Kondisi baik, lengkap dengan charger." className="text-xs sm:text-sm" required />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">Batal</Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto text-xs sm:text-sm">{isPending ? 'Memproses...' : 'Catat Pengembalian'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Kartu Peminjaman */}
      <KartuPeminjamanModal
        isOpen={isKartuModalOpen}
        onClose={() => setIsKartuModalOpen(false)}
        data={selectedKartuData}
      />

      {/* Modal Perpanjangan */}
      <PerpanjanganModal
        isOpen={isPerpanjanganModalOpen}
        onClose={() => setIsPerpanjanganModalOpen(false)}
        peminjaman={selectedPerpanjanganData}
      />

      {/* Modal Riwayat Perpanjangan */}
      <RiwayatPerpanjanganModal
        isOpen={isRiwayatModalOpen}
        onClose={() => setIsRiwayatModalOpen(false)}
        peminjaman={selectedRiwayatData}
      />
    </>
  );
}
