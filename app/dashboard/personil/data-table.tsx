// app/dashboard/personil/data-table.tsx

'use client';

import { useState, useTransition } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonilWithSatker } from '@/types/custom';
import { Satker } from '@prisma/client';
import { mutasiPersonil } from './actions';

interface PersonilDataTableProps<TData extends PersonilWithSatker, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  satkerList: Satker[];
}

export function PersonilDataTable<TData extends PersonilWithSatker, TValue>({
  columns,
  data,
  satkerList
}: PersonilDataTableProps<TData, TValue>) {
  const [isMutasiDialogOpen, setIsMutasiDialogOpen] = useState(false);
  const [selectedPersonil, setSelectedPersonil] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openMutasiDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsMutasiDialogOpen(true);
      },
    },
  });

  const handleMutasiSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await mutasiPersonil(formData);
        setIsMutasiDialogOpen(false);
        // Di aplikasi nyata, gunakan library notifikasi seperti 'sonner' atau 'react-toastify'
        alert('Mutasi personil berhasil!');
      } catch (error: any) {
        alert(`Mutasi Gagal: ${error.message}`);
      }
    });
  };

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari nama personil..."
          value={(table.getColumn('nama')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nama')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data personil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>

      <Dialog open={isMutasiDialogOpen} onOpenChange={setIsMutasiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mutasi Personil</DialogTitle>
            <DialogDescription>
              Pindahkan <strong>{selectedPersonil?.nama}</strong> (NRP: {selectedPersonil?.nrp}) dari Satker{' '}
              <strong>{selectedPersonil?.satker.nama}</strong> ke Satker lain.
            </DialogDescription>
          </DialogHeader>
          <form action={handleMutasiSubmit}>
            <input type="hidden" name="personilId" value={selectedPersonil?.id ?? ''} />
            <div className="py-4 space-y-2">
              <Label htmlFor="satkerTujuanId">Pindahkan Ke Satker Tujuan</Label>
              <Select name="satkerTujuanId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Satker tujuan..." />
                </SelectTrigger>
                <SelectContent>
                  {satkerList
                    .filter(satker => satker.id !== selectedPersonil?.satkerId)
                    .map(satker => (
                      <SelectItem key={satker.id} value={satker.id}>
                        {satker.nama}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMutasiDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Memproses...' : 'Lakukan Mutasi'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
