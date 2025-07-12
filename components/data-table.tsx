// app/dashboard/inventaris/components/data-tables.tsx

'use client';

import { useState, useTransition, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, ColumnFiltersState } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { HtDetails } from '@/app/dashboard/inventaris/columns';
import { pinjamkanHtKeSatker,deleteHT } from '@/app/dashboard/inventaris/actions';
import { Satker, HTStatus } from '@prisma/client';

interface FilterOption {
  value: string;
  label: string;
}

interface InventarisDataTableProps<TData extends HtDetails, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  satkerList?: Satker[];
  merkList?: FilterOption[];
  statusList?: FilterOption[];
}

export function InventarisDataTable<TData extends HtDetails, TValue>({
  columns,
  data,
  satkerList = [],
  merkList = [],
  statusList = [],
}: InventarisDataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isPinjamkanOpen, setIsPinjamkanOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHt, setSelectedHt] = useState<TData | null>(null);
  const [isPending, startTransition] = useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        {merkList.length > 0 && (
          <Select value={(table.getColumn('merk')?.getFilterValue() as string) ?? ''} onValueChange={(value) => table.getColumn('merk')?.setFilterValue(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Merk..." /></SelectTrigger>
            <SelectContent><SelectItem value="all">Semua Merk</SelectItem>{merkList.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
        )}
        {satkerList.length > 0 && (
          <Select value={(table.getColumn('satker_nama')?.getFilterValue() as string) ?? ''} onValueChange={(value) => table.getColumn('satker_nama')?.setFilterValue(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Satker..." /></SelectTrigger>
            <SelectContent><SelectItem value="all">Semua Satker</SelectItem>{satkerList.map(s => (<SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>))}</SelectContent>
          </Select>
        )}
        {statusList.length > 0 && (
          <Select value={(table.getColumn('status')?.getFilterValue() as string) ?? ''} onValueChange={(value) => table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Kondisi..." /></SelectTrigger>
            <SelectContent><SelectItem value="all">Semua Kondisi</SelectItem>{statusList.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
          </Select>
        )}
      </div>
      {/* Sisa kode tabel dan dialog tidak berubah */}
       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anda yakin ingin menghapus HT ini?</DialogTitle>
            <DialogDescription>Aksi ini akan menghapus data HT <strong>{selectedHt?.kodeHT}</strong> secara permanen dan tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? 'Menghapus...' : 'Hapus Permanen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
