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
import { Satker } from '@prisma/client';
import { mutasiPersonil } from './actions';
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [openSatker, setOpenSatker] = useState(false);

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
      } catch (error: any) {
        alert(`Mutasi Gagal: ${error.message}`);
      }
    });
  };

  const satkerOptions = useMemo(() => satkerList.map(s => ({ value: s.nama, label: s.nama })), [satkerList]);
  const satkerFilterValue = table.getColumn('satker_nama')?.getFilterValue() as string ?? '';

  return (
    <>
      <div className="flex items-center py-4 gap-2">
        <Popover open={openSatker} onOpenChange={setOpenSatker}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openSatker} className="w-[250px] justify-between">
              {satkerFilterValue ? satkerOptions.find(s => s.value === satkerFilterValue)?.label : "Filter berdasarkan Satker..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Cari Satker..." />
              <CommandList>
                <CommandEmpty>Satker tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => { table.getColumn('satker_nama')?.setFilterValue(null); setOpenSatker(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", !satkerFilterValue ? "opacity-100" : "opacity-0")} />
                    Semua Satker
                  </CommandItem>
                  {satkerOptions.map((satker) => (
                    <CommandItem key={satker.value} value={satker.value} onSelect={(currentValue) => { table.getColumn('satker_nama')?.setFilterValue(currentValue === satkerFilterValue ? null : currentValue); setOpenSatker(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", satkerFilterValue === satker.value ? "opacity-100" : "opacity-0")} />
                      {satker.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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