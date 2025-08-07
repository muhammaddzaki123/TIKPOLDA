// app/satker-admin/personil/data-table.tsx

'use client';

import { useState, useTransition, useEffect } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Personil } from '@prisma/client';
import { addPersonil, updatePersonil, deletePersonil } from './actions';
import { PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { PersonilWithSatkerName } from './columns';

interface PersonilDataTableProps<TData extends PersonilWithSatkerName, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialSubSatkers: string[];
  satkerName: string;
}

export function PersonilDataTable<TData extends PersonilWithSatkerName, TValue>({
  columns,
  data,
  initialSubSatkers,
  satkerName,
}: PersonilDataTableProps<TData, TValue>) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddSubSatkerOpen, setIsAddSubSatkerOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPersonil, setSelectedPersonil] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [subSatkerOptions, setSubSatkerOptions] = useState<string[]>(initialSubSatkers);
  const [selectedSubSatker, setSelectedSubSatker] = useState('');
  const [newSubSatkerInput, setNewSubSatkerInput] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openEditPersonilDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setSelectedSubSatker(personil.subSatker || satkerName);
        setIsEditDialogOpen(true);
      },
      openDeletePersonilDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsDeleteDialogOpen(true);
      },
      openPhotoDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsPhotoDialogOpen(true);
      },
    },
  });

  const handleFormSubmit = (formData: FormData) => {
    formData.append('subSatker', selectedSubSatker);
    const action = selectedPersonil ? updatePersonil : addPersonil;

    startTransition(async () => {
      try {
        await action(formData);
        if (selectedSubSatker && !subSatkerOptions.includes(selectedSubSatker) && selectedSubSatker !== satkerName) {
          setSubSatkerOptions(prev => [...prev, selectedSubSatker].sort());
        }
        setIsEditDialogOpen(false);
        setIsAddDialogOpen(false);
        setSelectedPersonil(null);
      } catch (error: any) {
        alert(`Gagal: ${error.message}`);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedPersonil) return;
    startTransition(async () => {
      await deletePersonil(selectedPersonil.id);
      setIsDeleteDialogOpen(false);
    });
  };

  const handleOpenAddDialog = () => {
    setSelectedPersonil(null);
    setSelectedSubSatker(satkerName);
    setIsAddDialogOpen(true);
  };
  
  const handleAddSubSatker = () => {
    if (newSubSatkerInput && !subSatkerOptions.includes(newSubSatkerInput) && newSubSatkerInput !== satkerName) {
        setSubSatkerOptions(prev => [...prev, newSubSatkerInput].sort());
        setSelectedSubSatker(newSubSatkerInput);
    }
    setNewSubSatkerInput("");
    setIsAddSubSatkerOpen(false);
  };

  const FormContent = ({ personil }: { personil?: TData | null }) => {
    // --- PERBAIKAN UTAMA DI SINI ---
    // Pastikan daftar pilihan unik untuk menghindari error key
    const uniqueOptions = Array.from(new Set([satkerName, ...subSatkerOptions]));

    return (
        <form action={handleFormSubmit}>
        {personil && <input type="hidden" name="personilId" value={personil.id} />}
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" name="nama" defaultValue={personil?.nama} required />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="nrp">NRP</Label>
                <Input id="nrp" name="nrp" defaultValue={personil?.nrp} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pangkat">Pangkat</Label>
                    <Input id="pangkat" name="pangkat" defaultValue={personil?.pangkat} placeholder="Contoh: Brigadir" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input id="jabatan" name="jabatan" defaultValue={personil?.jabatan} placeholder="Contoh: Kapolsek" required />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="foto">Foto Personil (3x4)</Label>
                <Input 
                    id="foto" 
                    name="foto" 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                    Format: JPG, JPEG, PNG. Ukuran maksimal: 1MB. Rasio 3:4 (contoh: 300x400px)
                </p>
                {personil?.fotoUrl && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Foto saat ini:</p>
                        <img 
                            src={personil.fotoUrl} 
                            alt="Foto saat ini" 
                            className="w-16 h-20 object-cover rounded border"
                        />
                    </div>
                )}
            </div>
            
            <div className="space-y-2">
                <Label>Penempatan</Label>
                <div className="flex items-center gap-2">
                    <Popover open={openPopover} onOpenChange={setOpenPopover}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {selectedSubSatker || "Pilih Penempatan..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Cari Penempatan..." />
                                <CommandList>
                                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {uniqueOptions.map((option) => (
                                            <CommandItem
                                                key={option} // Key sekarang dijamin unik
                                                value={option}
                                                onSelect={() => {
                                                    setSelectedSubSatker(option);
                                                    setOpenPopover(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", selectedSubSatker === option ? "opacity-100" : "opacity-0")} />
                                                {option}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <Button type="button" variant="secondary" size="icon" onClick={() => setIsAddSubSatkerOpen(true)}>
                        <PlusCircle className="h-4 w-4"/>
                        <span className="sr-only">Tambah Penempatan Baru</span>
                    </Button>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>Batal</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan Data'}</Button>
        </DialogFooter>
        </form>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Cari nama personil..."
          value={(table.getColumn('nama')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('nama')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleOpenAddDialog}><PlusCircle className="mr-2 h-4 w-4" />Tambah Personil</Button>
      </div>
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

      <Dialog open={isAddSubSatkerOpen} onOpenChange={setIsAddSubSatkerOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Tambah Penempatan Baru</DialogTitle>
                  <DialogDescription>Masukkan nama unit baru (contoh: Polsek Sandubaya).</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                  <Label htmlFor="new-subsatker-name">Nama Penempatan</Label>
                  <Input 
                    id="new-subsatker-name" 
                    value={newSubSatkerInput}
                    onChange={(e) => setNewSubSatkerInput(e.target.value)}
                    placeholder="Nama unit..."
                  />
              </div>
              <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddSubSatkerOpen(false)}>Batal</Button>
                  <Button type="button" onClick={handleAddSubSatker}>Tambah ke Pilihan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Tambah Personil Baru</DialogTitle><DialogDescription>Masukkan data lengkap untuk anggota baru di unit Anda.</DialogDescription></DialogHeader><FormContent /></DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Edit Data Personil</DialogTitle></DialogHeader><FormContent personil={selectedPersonil} /></DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anda yakin ingin menghapus data ini?</DialogTitle>
            <DialogDescription>Tindakan ini akan menghapus data personil <strong>{selectedPersonil?.nama}</strong> secara permanen.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? 'Menghapus...' : 'Hapus Permanen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Foto Personil</DialogTitle>
            <DialogDescription>
              {selectedPersonil?.nama} - {selectedPersonil?.pangkat} {selectedPersonil?.jabatan}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {selectedPersonil?.fotoUrl ? (
              <div className="relative">
                <img 
                  src={selectedPersonil.fotoUrl} 
                  alt={`Foto ${selectedPersonil.nama}`}
                  className="max-w-full max-h-96 object-contain rounded-lg border shadow-lg"
                />
                <div className="mt-2 text-center text-sm text-gray-600">
                  <p><strong>NRP:</strong> {selectedPersonil.nrp}</p>
                  <p><strong>Pangkat:</strong> {selectedPersonil.pangkat}</p>
                  <p><strong>Jabatan:</strong> {selectedPersonil.jabatan}</p>
                  <p><strong>Penempatan:</strong> {selectedPersonil.subSatker || selectedPersonil.satkerName}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-32 h-40 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500 mb-4">
                  <span className="text-sm">Tidak ada foto</span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Foto belum tersedia untuk personil ini
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
