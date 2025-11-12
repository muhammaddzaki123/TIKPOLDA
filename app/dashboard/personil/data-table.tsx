// app/dashboard/personil/data-table.tsx

'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonilWithSatker } from '@/types/custom';
// import { Satker } from '@prisma/client'; // Satker tidak digunakan, jadi dihapus
import { mutasiPersonil } from './actions';
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Satker } from '@prisma/client';

interface PersonilDataTableProps<TData extends PersonilWithSatker, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  satkerList: Satker[];
  penempatanList: string[];
}

export function PersonilDataTable<TData extends PersonilWithSatker, TValue>({
  columns,
  data,
  satkerList,
  penempatanList,
}: PersonilDataTableProps<TData, TValue>) {
  const [isMutasiDialogOpen, setIsMutasiDialogOpen] = useState(false);
  const [selectedPersonil, setSelectedPersonil] = useState<TData | null>(null);
  const [, setIsPhotoDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // State untuk popover
  const [openSatker, setOpenSatker] = useState(false);
  const [openPenempatan, setOpenPenempatan] = useState(false);

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openMutasiDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsMutasiDialogOpen(true);
      },
      openPhotoDialog: (personil) => {
        setSelectedPersonil(personil as TData);
        setIsPhotoDialogOpen(true);
      },
    },
    state: {
        columnFilters,
    },
  });

  const handleMutasiSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await mutasiPersonil(formData);
        setIsMutasiDialogOpen(false);
        alert('Mutasi personil berhasil!');
      } catch (error: unknown) {
        if (error instanceof Error) {
            alert(`Mutasi Gagal: ${error.message}`);
        } else {
            alert('Mutasi Gagal: Terjadi kesalahan yang tidak diketahui.');
        }
      }
    });
  };

  const satkerOptions = useMemo(() => satkerList.map(s => ({ value: s.nama, label: s.nama })), [satkerList]);
  const penempatanOptions = useMemo(() => penempatanList.map(p => ({ value: p, label: p })), [penempatanList]);

  const satkerFilterValue = table.getColumn('satker_nama')?.getFilterValue() as string ?? '';
  const penempatanFilterValue = table.getColumn('penempatan')?.getFilterValue() as string ?? '';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        {/* Filter Satker Induk */}
        <Popover open={openSatker} onOpenChange={setOpenSatker}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openSatker} className="w-full justify-between md:w-[250px]">
              {satkerFilterValue ? satkerOptions.find(s => s.value === satkerFilterValue)?.label : "Filter Satker Induk..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Cari Satker..." />
              <CommandList>
                <CommandEmpty>Satker tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => { table.getColumn('satker_nama')?.setFilterValue(''); setOpenSatker(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", !satkerFilterValue ? "opacity-100" : "opacity-0")} />
                    Semua Satker
                  </CommandItem>
                  {satkerOptions.map((satker) => (
                    <CommandItem key={satker.value} value={satker.value} onSelect={() => { table.getColumn('satker_nama')?.setFilterValue(satker.value); setOpenSatker(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", satkerFilterValue === satker.value ? "opacity-100" : "opacity-0")} />
                      {satker.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filter Penempatan */}
        <Popover open={openPenempatan} onOpenChange={setOpenPenempatan}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openPenempatan} className="w-full justify-between md:w-[250px]">
              {penempatanFilterValue ? penempatanOptions.find(p => p.value === penempatanFilterValue)?.label : "Filter Penempatan..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Cari Penempatan..." />
              <CommandList>
                <CommandEmpty>Penempatan tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => { table.getColumn('penempatan')?.setFilterValue(''); setOpenPenempatan(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", !penempatanFilterValue ? "opacity-100" : "opacity-0")} />
                    Semua Penempatan
                  </CommandItem>
                  {penempatanOptions.map((option) => (
                    <CommandItem key={option.value} value={option.value} onSelect={() => { table.getColumn('penempatan')?.setFilterValue(option.value); setOpenPenempatan(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", penempatanFilterValue === option.value ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Table View */}
      <div className="hidden rounded-md border md:block">
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
                <TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada data personil.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
            <div key={row.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                    {/* Render the photo cell */}
                    {row.getVisibleCells().map(cell => cell.column.id === 'foto' ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null)}
                </div>
                <div className="flex-grow space-y-2">
                    <p className="font-bold text-lg">{row.original.nama}</p>
                    <div className="space-y-2 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">NRP</p>
                            <p className="font-mono">{row.original.nrp}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Penempatan</p>
                            <p>{row.original.subSatker || row.original.satker.nama}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Jabatan</p>
                            <p>{row.original.jabatan}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {/* Render the action cell */}
                    {row.getVisibleCells().map(cell => cell.column.id === 'actions' ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center text-muted-foreground shadow-sm">Tidak ada data personil.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 md:justify-end">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Selanjutnya
        </Button>
      </div>


      <Dialog open={isMutasiDialogOpen} onOpenChange={setIsMutasiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mutasi Personil</DialogTitle>
            <DialogDescription>
              Pindahkan <strong>{selectedPersonil?.nama}</strong> (NRP: {selectedPersonil?.nrp}) dari Penempatan{' '}
              <strong>{selectedPersonil?.subSatker || selectedPersonil?.satker.nama}</strong> ke Satker lain.
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
    </div>
  );
}