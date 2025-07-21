// app/satker-admin/peminjaman/components/PengembalianTable.tsx

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

// Tipe data untuk properti komponen
type PeminjamanAktif = (Peminjaman & { ht: HT; personil: Personil });

interface PengembalianTableProps {
  data: PeminjamanAktif[];
}

export function PengembalianTable({ data }: PengembalianTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PeminjamanAktif | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDialog = (peminjaman: PeminjamanAktif) => {
    setSelectedPeminjaman(peminjaman);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createPengembalian(formData);
        setIsDialogOpen(false);
        alert('Pengembalian HT berhasil dicatat.');
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode HT</TableHead>
              <TableHead>Nama Peminjam</TableHead>
              <TableHead>NRP</TableHead>
              <TableHead>Tgl. Pinjam</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((peminjaman) => (
                <TableRow key={peminjaman.id}>
                  <TableCell className="font-medium">{peminjaman.ht.kodeHT}</TableCell>
                  <TableCell>{peminjaman.personil.nama}</TableCell>
                  <TableCell>{peminjaman.personil.nrp}</TableCell>
                  <TableCell>{new Date(peminjaman.tanggalPinjam).toLocaleDateString('id-ID')}</TableCell>
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
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => openDialog(peminjaman)}>Kembalikan</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
              Anda akan mencatat pengembalian untuk HT <strong>{selectedPeminjaman?.ht.kodeHT}</strong> oleh <strong>{selectedPeminjaman?.personil.nama}</strong>.
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
    </>
  );
}