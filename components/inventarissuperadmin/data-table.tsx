// app/components/inventarissuperadmin/data-table.tsx

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

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    // BARIS YANG MENYEBABKAN ERROR SUDAH DIHAPUS DARI SINI
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

  const uniqueMerks = useMemo(() => Array.from(new Set(data.map((item) => item.merk))).filter(Boolean), [data]);
  const hasSatkerColumn = table.getAllColumns().some(column => column.id === 'penempatan');
  
  const isGudangTable = !hasSatkerColumn;
  const selectedRowCount = Object.keys(rowSelection).length;

  return (
    <div>
      <div className="flex items-center gap-2 py-4 flex-wrap">
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
          className="max-w-xs"
        />

        <Select
          value={(table.getColumn('merk')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) => table.getColumn('merk')?.setFilterValue(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Merek..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Merek</SelectItem>
            {uniqueMerks.map((merk) => (
              <SelectItem key={merk} value={merk}>
                {merk}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) => table.getColumn('status')?.setFilterValue(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Kondisi..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kondisi</SelectItem>
            {Object.values(HTStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasSatkerColumn && (
          <Select
            value={(table.getColumn('penempatan')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) => table.getColumn('penempatan')?.setFilterValue(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter Penempatan..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Satker</SelectItem>
              {satkerList.map((satker) => (
                <SelectItem key={satker.id} value={satker.nama}>
                  {satker.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Memproses...' : `Distribusikan ${selectedRowCount} HT`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}