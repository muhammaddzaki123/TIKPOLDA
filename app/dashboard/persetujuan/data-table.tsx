// app/dashboard/persetujuan/data-table.tsx
'use client';

import { useState, useTransition } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { approveMutasi, approvePeminjaman, rejectPengajuan } from './actions';

// Mendefinisikan tipe data generik untuk pengajuan
type Pengajuan = { id: string; [key: string]: any };

interface DataTablePersetujuanProps<TData extends Pengajuan, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tipe: 'mutasi' | 'peminjaman';
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    handleApprove?: (id: string) => void;
    handleReject?: (pengajuan: TData) => void;
  }
}

export function DataTablePersetujuan<TData extends Pengajuan, TValue>({
  columns,
  data,
  tipe,
}: DataTablePersetujuanProps<TData, TValue>) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    const action = tipe === 'mutasi' ? approveMutasi : approvePeminjaman;
    if (confirm(`Anda yakin ingin menyetujui pengajuan ini? Aksi ini tidak dapat dibatalkan.`)) {
      startTransition(async () => {
        try {
          await action(id);
          alert('Pengajuan berhasil disetujui.');
        } catch (error: any) {
          alert(`Error: ${error.message}`);
        }
      });
    }
  };
  
  const handleRejectSubmit = (formData: FormData) => {
    startTransition(async () => {
        try {
            await rejectPengajuan(formData);
            alert('Pengajuan berhasil ditolak.');
            setIsRejectDialogOpen(false);
        } catch(error: any) {
            alert(`Error: ${error.message}`);
        }
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      handleApprove,
      handleReject: (pengajuan) => {
        setSelectedPengajuan(pengajuan);
        setIsRejectDialogOpen(true);
      },
    },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada pengajuan baru.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>Anda akan menolak pengajuan ini. Mohon berikan alasan yang jelas.</DialogDescription>
          </DialogHeader>
          <form action={handleRejectSubmit}>
            <input type="hidden" name="pengajuanId" value={selectedPengajuan?.id ?? ''} />
            <input type="hidden" name="tipe" value={tipe} />
            <div className="py-4 space-y-2">
              <Label htmlFor="catatanAdmin">Alasan Penolakan</Label>
              <Textarea id="catatanAdmin" name="catatanAdmin" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
              <Button type="submit" variant="destructive" disabled={isPending}>{isPending ? 'Memproses...' : 'Tolak Pengajuan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}