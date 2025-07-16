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
  RowSelectionState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { HtDetails } from '@/app/dashboard/inventaris/columns';
import { pinjamkanHtKeSatker, distributeMultipleHtToSatker } from '@/app/dashboard/inventaris/actions';
import { Satker, HTStatus } from '@prisma/client';
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
  satkerList?: Satker[];
}

export function InventarisDataTable<TData extends HtDetails, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  satkerList = [],
}: InventarisDataTableProps<TData, TValue>) {
  const [isPinjamkanOpen, setIsPinjamkanOpen] = useState(false);
  const [isDistribusiOpen, setIsDistribusiOpen] = useState(false);
  const [selectedHt, setSelectedHt] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [openMerk, setOpenMerk] = useState(false);
  const [openKondisi, setOpenKondisi] = useState(false);
  const [openPenempatan, setOpenPenempatan] = useState(false);

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    meta: {
      openPinjamkanDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsPinjamkanOpen(true);
      },
    },
    state: {
      columnFilters,
      rowSelection,
    },
  });

  const handlePinjamkanSubmit = (formData: FormData) => {
    startTransition(async () => {
      await pinjamkanHtKeSatker(formData);
      setIsPinjamkanOpen(false);
    });
  };

  const handleDistribusiSubmit = (formData: FormData) => {
    const satkerTujuanId = formData.get('satkerTujuanId') as string;
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);

    startTransition(async () => {
      try {
        await distributeMultipleHtToSatker(selectedIds, satkerTujuanId);
        alert(`${selectedIds.length} unit HT berhasil didistribusikan.`);
        setIsDistribusiOpen(false);
        table.resetRowSelection();
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };
  
  const uniqueMerks = useMemo(() => Array.from(new Set(data.map((item) => item.merk))).filter(Boolean).map(merk => ({ value: merk, label: merk })), [data]);
  const kondisiOptions = useMemo(() => Object.values(HTStatus).map(status => ({ value: status, label: status.replace('_', ' ') })), []);
  const satkerOptions = useMemo(() => satkerList.map(satker => ({ value: satker.nama, label: satker.nama })), [satkerList]);
  
  const hasSatkerColumn = table.getAllColumns().some(column => column.id === 'penempatan');
  const isGudangTable = !hasSatkerColumn;
  const selectedRowCount = Object.keys(rowSelection).length;

  const merkFilterValue = table.getColumn('merk')?.getFilterValue() as string ?? '';
  const kondisiFilterValue = table.getColumn('status')?.getFilterValue() as string ?? '';
  
  // --- PERBAIKAN UTAMA DI SINI ---
  // Hanya ambil nilai filter 'penempatan' jika kolomnya ada
  const penempatanFilterValue = hasSatkerColumn
    ? table.getColumn('penempatan')?.getFilterValue() as string ?? ''
    : '';

  return (
    <div>
      <div className="flex items-center gap-2 py-4 flex-wrap">
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
          className="max-w-xs"
        />

        {/* --- COMBOBOX Merek --- */}
        <Popover open={openMerk} onOpenChange={setOpenMerk}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openMerk} className="w-[180px] justify-between">
              {merkFilterValue ? uniqueMerks.find(m => m.value === merkFilterValue)?.label : "Filter Merek..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder="Cari merek..." />
              <CommandList><CommandEmpty>Merek tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => { table.getColumn('merk')?.setFilterValue(null); setOpenMerk(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", !merkFilterValue ? "opacity-100" : "opacity-0")} />
                    Semua Merek
                  </CommandItem>
                  {uniqueMerks.map((merk) => (
                    <CommandItem key={merk.value} value={merk.value} onSelect={(currentValue) => { table.getColumn('merk')?.setFilterValue(currentValue === merkFilterValue ? null : currentValue); setOpenMerk(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", merkFilterValue === merk.value ? "opacity-100" : "opacity-0")} />
                      {merk.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* --- COMBOBOX Kondisi --- */}
        <Popover open={openKondisi} onOpenChange={setOpenKondisi}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openKondisi} className="w-[180px] justify-between">
              {kondisiFilterValue ? kondisiOptions.find(k => k.value === kondisiFilterValue)?.label : "Filter Kondisi..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder="Cari kondisi..." />
              <CommandList><CommandEmpty>Kondisi tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => { table.getColumn('status')?.setFilterValue(null); setOpenKondisi(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", !kondisiFilterValue ? "opacity-100" : "opacity-0")} />
                    Semua Kondisi
                  </CommandItem>
                  {kondisiOptions.map((kondisi) => (
                    <CommandItem key={kondisi.value} value={kondisi.value} onSelect={(currentValue) => { table.getColumn('status')?.setFilterValue(currentValue === kondisiFilterValue ? null : currentValue); setOpenKondisi(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", kondisiFilterValue === kondisi.value ? "opacity-100" : "opacity-0")} />
                      {kondisi.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* --- COMBOBOX Penempatan (Kondisional) --- */}
        {hasSatkerColumn && (
          <Popover open={openPenempatan} onOpenChange={setOpenPenempatan}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={openPenempatan} className="w-[220px] justify-between">
                {penempatanFilterValue ? satkerOptions.find(s => s.value === penempatanFilterValue)?.label : "Filter Penempatan..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Cari penempatan..." />
                <CommandList><CommandEmpty>Satker tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="all" onSelect={() => { table.getColumn('penempatan')?.setFilterValue(null); setOpenPenempatan(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", !penempatanFilterValue ? "opacity-100" : "opacity-0")} />
                      Semua Satker
                    </CommandItem>
                    {satkerOptions.map((satker) => (
                      <CommandItem key={satker.value} value={satker.value} onSelect={(currentValue) => { table.getColumn('penempatan')?.setFilterValue(currentValue === penempatanFilterValue ? null : currentValue); setOpenPenempatan(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", penempatanFilterValue === satker.value ? "opacity-100" : "opacity-0")} />
                        {satker.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        
        {isGudangTable && (
          <Button
            onClick={() => setIsDistribusiOpen(true)}
            disabled={selectedRowCount === 0}
            variant="outline"
          >
            Distribusikan Terpilih ({selectedRowCount})
          </Button>
        )}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Selanjutnya
        </Button>
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
      
      <Dialog open={isDistribusiOpen} onOpenChange={setIsDistribusiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribusikan HT ke Satker</DialogTitle>
            <DialogDescription>
              Anda akan mendistribusikan <strong>{selectedRowCount} unit HT</strong> yang dipilih. Pilih Satker tujuan di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form action={handleDistribusiSubmit}>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="satkerTujuanId">Distribusikan Ke Satker</Label>
                <Select name="satkerTujuanId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Satker tujuan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {satkerList.map(satker => (
                      <SelectItem key={satker.id} value={satker.id}>
                        {satker.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDistribusiOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending || selectedRowCount === 0}>
                {isPending ? 'Memproses...' : `Distribusikan ${selectedRowCount} HT`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}