// app/dashboard/inventaris/components/data-tables.tsx

'use client';

import { useState, useTransition } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, ColumnFiltersState } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { pinjamkanHtKeSatker,deleteHT } from '@/app/dashboard/inventaris/actions';
import type { HtDetails } from '@/types/custom';
import type { Satker } from '@prisma/client';

interface FilterOption { value: string; label: string; }
interface InventarisDataTableProps<TData extends HtDetails, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  satkerList?: Satker[];
  merkOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  isGudang?: boolean;
}

export function InventarisDataTable<TData extends HtDetails, TValue>({
  columns, data, satkerList = [], merkOptions = [], statusOptions = [], isGudang = false
}: InventarisDataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isPinjamkanOpen, setIsPinjamkanOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHt, setSelectedHt] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data, columns, getCoreRowModel: getCoreRowModel(), onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    state: { columnFilters },
    meta: {
      openPinjamkanDialog: (ht) => { setSelectedHt(ht as TData); setIsPinjamkanOpen(true); },
      openDeleteDialog: (ht) => { setSelectedHt(ht as TData); setIsDeleteOpen(true); },
    },
  });

  const handlePinjamkanSubmit = (formData: FormData) => { startTransition(() => { pinjamkanHtKeSatker(formData).then(() => setIsPinjamkanOpen(false)); }); };
  const handleDelete = () => { if (!selectedHt) return; startTransition(() => { deleteHT(selectedHt.id).then(() => setIsDeleteOpen(false)); }); };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 py-4">
        <Input placeholder="Cari Kode HT..." value={(table.getColumn('kodeHT')?.getFilterValue() as string) ?? ''} onChange={(e) => table.getColumn('kodeHT')?.setFilterValue(e.target.value)} className="max-w-xs" />
        <Select value={(table.getColumn('merk')?.getFilterValue() as string) ?? ''} onValueChange={(value) => table.getColumn('merk')?.setFilterValue(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-auto min-w-[180px]"><SelectValue placeholder="Filter Merk..." /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua Merk</SelectItem>{merkOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
        </Select>
        {!isGudang && (
          <Select value={(table.getColumn('satker')?.getFilterValue() as string) ?? ''} onValueChange={(value) => table.getColumn('satker')?.setFilterValue(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-auto min-w-[180px]"><SelectValue placeholder="Filter Satker..." /></SelectTrigger>
            <SelectContent><SelectItem value="all">Semua Satker</SelectItem>{satkerList.map(s => (<SelectItem key={s.id} value={s.nama}>{s.nama}</SelectItem>))}</SelectContent>
          </Select>
        )}
        <Select value={(table.getColumn('status')?.getFilterValue() as string) ?? ''} onValueChange={(value) => table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-auto min-w-[180px]"><SelectValue placeholder="Filter Kondisi..." /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua Kondisi</SelectItem>{statusOptions.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="rounded-md border"><Table><TableHeader>{table.getHeaderGroups().map(hg => (<TableRow key={hg.id}>{hg.headers.map(h => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader><TableBody>{table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada data.</TableCell></TableRow>)}</TableBody></Table></div>
      <div className="flex items-center justify-end space-x-2 py-4"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button></div>
      <Dialog open={isPinjamkanOpen} onOpenChange={setIsPinjamkanOpen}><DialogContent><DialogHeader><DialogTitle>Pinjamkan HT ke Satker</DialogTitle></DialogHeader><form action={handlePinjamkanSubmit}><input type="hidden" name="htId" value={selectedHt?.id ?? ''} /><div className="py-4 space-y-4"><div className="space-y-2"><Label>Kode HT</Label><Input value={selectedHt?.kodeHT} disabled /></div><div className="space-y-2"><Label htmlFor="satkerId">Pinjamkan Ke Satker</Label><Select name="satkerId" required><SelectTrigger><SelectValue placeholder="Pilih Satker tujuan..." /></SelectTrigger><SelectContent>{satkerList.map(satker => (<SelectItem key={satker.id} value={satker.id}>{satker.nama}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="catatan">Catatan (Opsional)</Label><Textarea id="catatan" name="catatan" /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setIsPinjamkanOpen(false)}>Batal</Button><Button type="submit" disabled={isPending}>{isPending ? 'Memproses...' : 'Pinjamkan'}</Button></DialogFooter></form></DialogContent></Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}><DialogContent><DialogHeader><DialogTitle>Anda yakin ingin menghapus HT ini?</DialogTitle><DialogDescription>Aksi ini akan menghapus data HT <strong>{selectedHt?.kodeHT}</strong> secara permanen.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? 'Menghapus...' : 'Hapus Permanen'}</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}