// app/satker-admin/personil/data-table.tsx

'use client';

import { useState, useTransition } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Personil } from '@prisma/client';
import { updatePersonil, deletePersonil } from './actions';

interface PersonilDataTableProps<TData extends Personil, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function PersonilDataTable<TData extends Personil, TValue>({
  columns,
  data,
}: PersonilDataTableProps<TData, TValue>) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPersonil, setSelectedPersonil] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openEditPersonilDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsEditDialogOpen(true);
      },
      openDeletePersonilDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsDeleteDialogOpen(true);
      },
    },
  });

  const handleUpdateSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updatePersonil(formData);
      setIsEditDialogOpen(false);
    });
  };

  const handleDelete = () => {
    if (!selectedPersonil) return;
    startTransition(async () => {
      await deletePersonil(selectedPersonil.id);
      setIsDeleteDialogOpen(false);
    });
  };

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari nama personil..."
          value={(table.getColumn('nama')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('nama')?.setFilterValue(event.target.value)}
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
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada data personil.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Data Personil</DialogTitle></DialogHeader>
          <form action={handleUpdateSubmit}>
            <input type="hidden" name="personilId" value={selectedPersonil?.id ?? ''} />
            <div className="py-4 space-y-4">
              <div className="space-y-2"><Label htmlFor="nama">Nama Lengkap</Label><Input id="nama" name="nama" defaultValue={selectedPersonil?.nama} required /></div>
              <div className="space-y-2"><Label htmlFor="nrp">NRP</Label><Input id="nrp" name="nrp" defaultValue={selectedPersonil?.nrp} required /></div>
              <div className="space-y-2"><Label htmlFor="jabatan">Jabatan / Pangkat</Label><Input id="jabatan" name="jabatan" defaultValue={selectedPersonil?.jabatan} required /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Memperbarui...' : 'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anda yakin ingin menghapus data ini?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus data personil <strong>{selectedPersonil?.nama}</strong> secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? 'Menghapus...' : 'Hapus Permanen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
