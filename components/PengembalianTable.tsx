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

  const openDialog = (peminjaman: PeminjamanAktif) => {
    setSelectedPeminjaman(peminjaman);
    setIsDialogOpen(true);
  };

  const openKartuModal = (peminjaman: PeminjamanAktif) => {
    setSelectedKartuData(peminjaman);
    setIsKartuModalOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createPengembalian(formData);
        setIsDialogOpen(false);
        toast.success('Pengembalian HT berhasil dicatat.');
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Peminjam</TableHead>
              <TableHead>Tgl Pinjam</TableHead>
              <TableHead>Batas Kembali</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Kartu</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
                    <TableCell className="font-medium">{peminjaman.ht.serialNumber}</TableCell>
                    <TableCell>
                      <div>{peminjaman.personil.nama}</div>
                      <div className="text-xs text-muted-foreground">{peminjaman.personil.nrp}</div>
                    </TableCell>
                    <TableCell>{format(new Date(peminjaman.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</TableCell>
                    
                    {/*
                      PERUBAHAN DI SINI:
                      - Tampilkan tanggal jika ada, atau tampilkan placeholder jika null.
                    */}
                    <TableCell className={cn(isOverdue && "font-bold")}>
                      {peminjaman.estimasiKembali 
                        ? format(new Date(peminjaman.estimasiKembali), 'dd MMM yyyy', { locale: id }) 
                        : <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    
                    <TableCell>
                      {peminjaman.fileUrl ? (
                        <Button variant="outline" size="sm" className="h-8" asChild>
                          <Link href={peminjaman.fileUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-3 w-3" /> PDF
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        onClick={() => openKartuModal(peminjaman)}
                      >
                        Lihat Kartu
                      </Button>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => openDialog(peminjaman)}>Kembalikan</Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Tidak ada HT yang sedang dipinjam.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Formulir Pengembalian HT</DialogTitle>
            <DialogDescription>
              Anda akan mencatat pengembalian untuk HT <strong>{selectedPeminjaman?.ht.serialNumber}</strong> oleh <strong>{selectedPeminjaman?.personil.nama}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit}>
            <input type="hidden" name="peminjamanId" value={selectedPeminjaman?.id ?? ''} />
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kondisiSaatKembali">Kondisi HT Saat Dikembalikan</Label>
                <Textarea id="kondisiSaatKembali" name="kondisiSaatKembali" placeholder="Contoh: Kondisi baik, lengkap dengan charger." required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Memproses...' : 'Catat Pengembalian'}</Button>
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
    </>
  );
}
