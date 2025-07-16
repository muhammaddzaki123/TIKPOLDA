'use client';

import { useState, useTransition } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteAdminAndSatker, resetPassword, updateAdminAndSatker } from './actions';
import { AdminWithSatker } from '@/types/custom';

interface AdminDataTableProps<TData extends AdminWithSatker, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function AdminDataTable<TData extends AdminWithSatker, TValue>({
  columns,
  data,
}: AdminDataTableProps<TData, TValue>) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      openResetDialog: (user) => {
        setSelectedUser(user as TData);
        setIsResetDialogOpen(true);
      },
      openDeleteDialog: (user) => {
        setSelectedUser(user as TData);
        setIsDeleteDialogOpen(true);
      },
      openEditDialog: (user) => {
        setSelectedUser(user as TData);
        setIsEditDialogOpen(true);
      },
    },
  });
  
  const handleUpdateSubmit = (formData: FormData) => {
    startTransition(async () => {
        try {
            await updateAdminAndSatker(formData);
            setIsEditDialogOpen(false);
            alert('Data berhasil diperbarui!');
        } catch (error: any) {
            alert(`Gagal: ${error.message}`);
        }
    });
  };
  
  const handleResetSubmit = (formData: FormData) => {
    startTransition(async () => {
      await resetPassword(formData);
      setIsResetDialogOpen(false);
    });
  };

  const handleDelete = () => {
    if (!selectedUser?.id) return;
    startTransition(async () => {
      await deleteAdminAndSatker(selectedUser.id);
      setIsDeleteDialogOpen(false);
    });
  };

  return (
    <>
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
                  Belum ada data Admin Satker.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Admin & Satker</DialogTitle>
            <DialogDescription>Ubah detail untuk akun dan Satker yang dipilih.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form action={handleUpdateSubmit}>
              <input type="hidden" name="userId" value={selectedUser.id} />
              <input type="hidden" name="satkerId" value={selectedUser.satker?.id ?? ''} />
              <div className="grid gap-4 py-4">
                <p className="font-semibold text-sm">Detail Satuan Kerja</p>
                <div className="space-y-2">
                  <Label htmlFor="kodeSatker">Kode Satker</Label>
                  <Input id="kodeSatker" name="kodeSatker" defaultValue={selectedUser.satker?.kode} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaSatker">Nama Lengkap Satker</Label>
                  <Input id="namaSatker" name="namaSatker" defaultValue={selectedUser.satker?.nama} required />
                </div>
                
                <p className="font-semibold text-sm pt-4 border-t mt-4">Detail Akun Admin</p>
                <div className="space-y-2">
                  <Label htmlFor="namaAdmin">Nama Lengkap Admin</Label>
                  <Input id="namaAdmin" name="namaAdmin" defaultValue={selectedUser.nama} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Admin</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedUser.email} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password untuk {selectedUser?.nama}</DialogTitle></DialogHeader>
          <form action={handleResetSubmit}>
            <input type="hidden" name="userId" value={selectedUser?.id ?? ''} />
            <div className="py-4 space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Memproses...' : 'Reset'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anda yakin?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus permanen akun <strong>{selectedUser?.nama}</strong> dan Satker terkait. Tindakan ini tidak dapat dibatalkan.
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