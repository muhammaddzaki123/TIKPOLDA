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
import { pinjamkanHtKeSatker, distributeMultipleHtToSatker, tarikMultipleHtKeGudangPusat } from '@/app/dashboard/inventaris/actions';
import { Satker, HTStatus } from '@prisma/client';
import EditHtForm from './edit-ht-form';
import DeleteHtDialog from './delete-ht-dialog';
import TarikHtDialog from './tarik-ht-dialog';
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    openPinjamkanDialog?: (ht: TData) => void;
    openEditDialog?: (ht: TData) => void;
    openDeleteDialog?: (ht: TData) => void;
    openTarikDialog?: (ht: TData) => void;
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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTarikOpen, setIsTarikOpen] = useState(false);
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
      openEditDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsEditOpen(true);
      },
      openDeleteDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsDeleteOpen(true);
      },
      openTarikDialog: (ht) => {
        setSelectedHt(ht as TData);
        setIsTarikOpen(true);
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
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Error: ${error.message}`);
        } else {
          alert('Terjadi kesalahan yang tidak diketahui.');
        }
      }
    });
  };

  const handleTarikMultiple = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);

    startTransition(async () => {
      try {
        await tarikMultipleHtKeGudangPusat(selectedIds);
        alert(`${selectedIds.length} unit HT berhasil ditarik ke gudang pusat.`);
        table.resetRowSelection();
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Error: ${error.message}`);
        } else {
          alert('Terjadi kesalahan yang tidak diketahui.');
        }
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
    <div className="space-y-4">
      {/* Filter Section - Responsive */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search Input */}
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
          className="w-full text-sm sm:max-w-xs"
        />

        {/* Filter Buttons - Responsive */}
        <div className="flex flex-wrap gap-2">
          {/* --- COMBOBOX Merek --- */}
          <Popover open={openMerk} onOpenChange={setOpenMerk}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={openMerk} className="w-full justify-between text-xs sm:w-[160px] sm:text-sm">
                <span className="truncate">{merkFilterValue ? uniqueMerks.find(m => m.value === merkFilterValue)?.label : "Merek"}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
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
              <Button variant="outline" role="combobox" aria-expanded={openKondisi} className="w-full justify-between text-xs sm:w-[160px] sm:text-sm">
                <span className="truncate">{kondisiFilterValue ? kondisiOptions.find(k => k.value === kondisiFilterValue)?.label : "Kondisi"}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
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
                <Button variant="outline" role="combobox" aria-expanded={openPenempatan} className="w-full justify-between text-xs sm:w-[180px] sm:text-sm">
                  <span className="truncate">{penempatanFilterValue ? satkerOptions.find(s => s.value === penempatanFilterValue)?.label : "Penempatan"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0">
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
        </div>
      </div>

      {/* Action Buttons - Responsive */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {isGudangTable && (
          <Button
            onClick={() => setIsDistribusiOpen(true)}
            disabled={selectedRowCount === 0}
            variant="outline"
            className="w-full text-xs sm:w-auto sm:text-sm"
          >
            <span className="hidden sm:inline">Distribusikan Terpilih</span>
            <span className="sm:hidden">Distribusikan</span>
            <span className="ml-1">({selectedRowCount})</span>
          </Button>
        )}
        
        {!isGudangTable && (
          <Button
            onClick={handleTarikMultiple}
            disabled={selectedRowCount === 0}
            variant="secondary"
            className="w-full text-xs sm:w-auto sm:text-sm"
          >
            <span className="hidden sm:inline">Tarik ke Gudang</span>
            <span className="sm:hidden">Tarik</span>
            <span className="ml-1">({selectedRowCount})</span>
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap text-xs lg:text-sm">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs lg:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  Tidak ada data yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const ht = row.original;
            return (
              <div key={row.id} className={cn("rounded-lg border bg-card p-3 shadow-sm", row.getIsSelected() && "border-primary bg-primary/5")}>
                <div className="space-y-3">
                  {/* Header dengan Serial Number dan Checkbox */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{ht.serialNumber}</p>
                      <p className="text-xs text-muted-foreground">{ht.merk} - {ht.jenis}</p>
                    </div>
                    {/* Checkbox untuk selection */}
                    <div className="flex items-center space-x-2">
                      {row.getVisibleCells().map(cell => 
                        cell.column.id === 'select' ? (
                          <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        ) : null
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Tahun Buat</p>
                      <p className="font-medium">{ht.tahunBuat}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tahun Peroleh</p>
                      <p className="font-medium">{ht.tahunPeroleh}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">{ht.status}</p>
                    </div>
                    {ht.satker && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Penempatan</p>
                        <p className="font-medium">{ht.satker.nama}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 border-t pt-2">
                    {row.getVisibleCells().map(cell => 
                      cell.column.id === 'actions' ? (
                        <div key={cell.id} className="w-full">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            Tidak ada data yang cocok dengan filter.
          </div>
        )}
      </div>

      {/* Pagination - Responsive */}
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <div className="text-xs text-muted-foreground sm:text-sm">
          Menampilkan {table.getRowModel().rows.length} dari {data.length} data
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
            className="text-xs sm:text-sm"
          >
            Sebelumnya
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="text-xs sm:text-sm"
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      <Dialog open={isPinjamkanOpen} onOpenChange={setIsPinjamkanOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Pinjamkan HT ke Satker</DialogTitle>
                <DialogDescription className="text-sm">Pinjamkan HT ini ke Satker tujuan</DialogDescription>
              </DialogHeader>
              <form action={handlePinjamkanSubmit}>
                  <input type="hidden" name="htId" value={selectedHt?.id ?? ''} />
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Serial Number</Label>
                        <Input value={selectedHt?.serialNumber} disabled className="text-sm" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="satkerId" className="text-sm">Pinjamkan Ke Satker</Label>
                          <Select name="satkerId" required>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Pilih Satker tujuan..." />
                            </SelectTrigger>
                            <SelectContent>
                              {satkerList.map(satker => (
                                <SelectItem key={satker.id} value={satker.id} className="text-sm">
                                  {satker.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="catatan" className="text-sm">Catatan (Opsional)</Label>
                        <Textarea id="catatan" name="catatan" className="text-sm" rows={3} />
                      </div>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" onClick={() => setIsPinjamkanOpen(false)} className="w-full sm:w-auto">
                        Batal
                      </Button>
                      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                        {isPending ? 'Memproses...' : 'Pinjamkan'}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isDistribusiOpen} onOpenChange={setIsDistribusiOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Distribusikan HT ke Satker</DialogTitle>
            <DialogDescription className="text-sm">
              Anda akan mendistribusikan <strong>{selectedRowCount} unit HT</strong> yang dipilih. Pilih Satker tujuan di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form action={handleDistribusiSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="satkerTujuanId" className="text-sm">Distribusikan Ke Satker</Label>
                <Select name="satkerTujuanId" required>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Pilih Satker tujuan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {satkerList.map(satker => (
                      <SelectItem key={satker.id} value={satker.id} className="text-sm">
                        {satker.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setIsDistribusiOpen(false)} className="w-full sm:w-auto">
                Batal
              </Button>
              <Button type="submit" disabled={isPending || selectedRowCount === 0} className="w-full sm:w-auto">
                {isPending ? 'Memproses...' : `Distribusikan ${selectedRowCount} HT`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit HT Dialog */}
      {selectedHt && (
        <EditHtForm
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          htData={{
            id: selectedHt.id,
            serialNumber: selectedHt.serialNumber,
            merk: selectedHt.merk,
            jenis: selectedHt.jenis,
            tahunBuat: selectedHt.tahunBuat,
            tahunPeroleh: selectedHt.tahunPeroleh,
            status: selectedHt.status,
            catatanKondisi: selectedHt.catatanKondisi,
            satkerId: selectedHt.satkerId,
          }}
          satkerOptions={satkerList}
        />
      )}

      {/* Delete HT Dialog */}
      {selectedHt && (
        <DeleteHtDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          htData={{
            id: selectedHt.id,
            merk: selectedHt.merk,
            serialNumber: selectedHt.serialNumber,
          }}
        />
      )}

      {/* Tarik HT Dialog */}
      {selectedHt && (
        <TarikHtDialog
          isOpen={isTarikOpen}
          onClose={() => setIsTarikOpen(false)}
          htData={{
            id: selectedHt.id,
            merk: selectedHt.merk,
            serialNumber: selectedHt.serialNumber,
            satker: selectedHt.satker,
          }}
        />
      )}
    </div>
  );
}
