// app/satker-admin/inventaris/data-table.tsx

'use client';

import { useState, useTransition } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { HTStatus } from '@prisma/client';
import { HtWithPeminjaman } from '@/types/custom';
import { updateStatusHT, deleteHtBySatker } from './actions';

interface InventarisDataTableProps<TData extends HtWithPeminjaman, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function InventarisDataTable<TData extends HtWithPeminjaman, TValue>({
  columns,
  data,
}: InventarisDataTableProps<TData, TValue>) {
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHt, setSelectedHt] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openUpdateStatusDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsUpdateStatusOpen(true);
      },
      openDeleteHtDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsDeleteOpen(true);
      },
    },
  });

  const handleUpdateStatusSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateStatusHT(formData);
      setIsUpdateStatusOpen(false);
    });
  };

  const handleDelete = () => {
    if (!selectedHt) return;
    startTransition(async () => {
      await deleteHtBySatker(selectedHt.id);
      setIsDeleteOpen(false);
    });
  };

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari berdasarkan Serial Number..."
          value={(table.getColumn('serialNumber')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('serialNumber')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (
                <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}</TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>{row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}</TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada data inventaris.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button>
      </div>

      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Kondisi HT: {selectedHt?.serialNumber}</DialogTitle></DialogHeader>
          <form action={handleUpdateStatusSubmit}>
            <input type="hidden" name="htId" value={selectedHt?.id ?? ''} />
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Kondisi Baru</Label>
                <Select name="status" defaultValue={selectedHt?.status} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(HTStatus).map(status => (
                      <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatanKondisi">Catatan (Opsional)</Label>
                <Textarea id="catatanKondisi" name="catatanKondisi" placeholder="Contoh: Baterai drop, antena rusak, dll." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Memperbarui...' : 'Update Status'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anda yakin ingin menghapus HT ini?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus data HT <strong>{selectedHt?.serialNumber}</strong> secara permanen. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? 'Menghapus...' : 'Hapus Permanen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
