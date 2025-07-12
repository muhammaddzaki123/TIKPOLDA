// app/dashboard/inventaris/components/data-tables.tsx

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
import { HtDetails } from '../app/dashboard/inventaris/columns';
import { pinjamkanHtKeSatker } from '../app/dashboard/inventaris/actions';
import { Satker } from '@prisma/client';

// Definisikan tipe meta untuk tabel ini
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    openPinjamkanDialog?: (ht: TData) => void;
  }
}

interface InventarisDataTableProps<TData extends HtDetails, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn: string;
  filterPlaceholder: string;
  satkerList?: Satker[]; // Opsional, hanya untuk tabel gudang
}

export function InventarisDataTable<TData extends HtDetails, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  satkerList = [],
}: InventarisDataTableProps<TData, TValue>) {
  const [isPinjamkanOpen, setIsPinjamkanOpen] = useState(false);
  const [selectedHt, setSelectedHt] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openPinjamkanDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsPinjamkanOpen(true);
      },
    },
  });
  
  const handlePinjamkanSubmit = (formData: FormData) => {
      startTransition(async () => {
          await pinjamkanHtKeSatker(formData);
          setIsPinjamkanOpen(false);
      });
  }

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
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
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada data.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button>
      </div>

      <Dialog open={isPinjamkanOpen} onOpenChange={setIsPinjamkanOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Pinjamkan HT ke Satker</DialogTitle></DialogHeader>
              <form action={handlePinjamkanSubmit}>
                  <input type="hidden" name="htId" value={selectedHt?.id ?? ''} />
                  <div className="py-4 space-y-4">
                      <div className="space-y-2"><Label>Kode HT</Label><Input value={selectedHt?.kodeHT} disabled /></div>
                      <div className="space-y-2">
                          <Label htmlFor="satkerId">Pinjamkan Ke Satker</Label>
                          <Select name="satkerId" required><SelectTrigger><SelectValue placeholder="Pilih Satker tujuan..." /></SelectTrigger>
                              <SelectContent>{satkerList.map(satker => (<SelectItem key={satker.id} value={satker.id}>{satker.nama}</SelectItem>))}</SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2"><Label htmlFor="catatan">Catatan (Opsional)</Label><Textarea id="catatan" name="catatan" /></div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsPinjamkanOpen(false)}>Batal</Button>
                      <Button type="submit" disabled={isPending}>{isPending ? 'Memproses...' : 'Pinjamkan'}</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}