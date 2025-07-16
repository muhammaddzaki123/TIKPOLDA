// app/dashboard/persetujuan/data-table.tsx

'use client';

import { useState, useTransition, Fragment, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, Row, Table as TanstackTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { approveMutasi, approvePeminjaman, rejectPengajuan, approvePengembalian } from './actions';
import { HT, HTStatus } from '@prisma/client';

type Pengajuan = { id: string; jumlah?: number; [key: string]: any };

interface DataTablePersetujuanProps<TData extends Pengajuan, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tipe: 'mutasi' | 'peminjaman' | 'pengembalian';
  htDiGudang?: HT[];
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    handleApprove?: (pengajuan: TData) => void;
    handleReject?: (pengajuan: TData) => void;
  }
}

export function DataTablePersetujuan<TData extends Pengajuan, TValue>({
  columns,
  data,
  tipe,
  htDiGudang = [],
}: DataTablePersetujuanProps<TData, TValue>) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSelectHtDialogOpen, setIsSelectHtDialogOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<TData | null>(null);
  const [selectedHtIds, setSelectedHtIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [merkFilter, setMerkFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleApproveClick = (pengajuan: TData) => {
    switch (tipe) {
      case 'mutasi':
        if (confirm(`Anda yakin ingin menyetujui mutasi untuk ${pengajuan.personil.nama}?`)) {
          startTransition(async () => {
            try {
              await approveMutasi(pengajuan.id);
              alert('Pengajuan mutasi berhasil disetujui.');
            } catch (error: any) {
              alert(`Error: ${error.message}`);
            }
          });
        }
        break;
      case 'peminjaman':
        setSelectedPengajuan(pengajuan);
        setSelectedHtIds(new Set());
        setMerkFilter('all');
        setStatusFilter('all');
        setIsSelectHtDialogOpen(true);
        break;
      case 'pengembalian':
        if (confirm(`Konfirmasi penerimaan HT ${pengajuan.ht.kodeHT} dari ${pengajuan.satkerPengaju.nama}?`)) {
          startTransition(async () => {
            try {
              await approvePengembalian(pengajuan.id);
              alert('Pengajuan pengembalian berhasil disetujui.');
            } catch (error: any) {
              alert(`Error: ${error.message}`);
            }
          });
        }
        break;
    }
  };

  const handleApprovePeminjamanSubmit = () => {
    if (!selectedPengajuan) return;
    startTransition(async () => {
      try {
        await approvePeminjaman(selectedPengajuan.id, Array.from(selectedHtIds));
        alert('Pengajuan peminjaman berhasil disetujui.');
        setIsSelectHtDialogOpen(false);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    });
  };
  
  const handleRejectSubmit = (formData: FormData) => {
    startTransition(async () => {
        try {
            await rejectPengajuan(formData);
            alert('Pengajuan berhasil ditolak.');
            setIsRejectDialogOpen(false);
        } catch(error: any) {
            alert(`Error: ${error.message}`);
        }
    });
  };

  const handleHtSelectionChange = (htId: string) => {
    setSelectedHtIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(htId)) {
            newSet.delete(htId);
        } else {
            if (newSet.size < (selectedPengajuan?.jumlah || 0)) {
                newSet.add(htId);
            } else {
                alert(`Anda hanya dapat memilih ${selectedPengajuan?.jumlah} unit HT.`);
            }
        }
        return newSet;
    });
  };

  const modifiedColumns = columns.map(col => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row, table }: { row: Row<TData>, table: TanstackTable<TData> }) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => table.options.meta?.handleApprove?.(row.original)}>
              Setujui
            </Button>
            <Button size="sm" variant="destructive" onClick={() => table.options.meta?.handleReject?.(row.original)}>
              Tolak
            </Button>
          </div>
        ),
      };
    }
    return col;
  });

  const table = useReactTable({
    data,
    columns: modifiedColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      handleApprove: (pengajuan) => handleApproveClick(pengajuan as TData),
      handleReject: (pengajuan) => {
        setSelectedPengajuan(pengajuan as TData);
        setIsRejectDialogOpen(true);
      },
    },
  });

  const uniqueMerks = useMemo(() => Array.from(new Set(htDiGudang.map(ht => ht.merk))), [htDiGudang]);
  const filteredHtDiGudang = useMemo(() => {
    return htDiGudang.filter(ht => {
      const merkMatch = merkFilter === 'all' || ht.merk === merkFilter;
      const statusMatch = statusFilter === 'all' || ht.status === statusFilter;
      return merkMatch && statusMatch;
    });
  }, [htDiGudang, merkFilter, statusFilter]);

  const handleSelectFiltered = () => {
    const newSelectedIds = new Set(selectedHtIds);
    let count = newSelectedIds.size;
  
    for (const ht of filteredHtDiGudang) {
      if (count >= (selectedPengajuan?.jumlah || 0)) {
        break;
      }
      if (!newSelectedIds.has(ht.id)) {
        newSelectedIds.add(ht.id);
        count++;
      }
    }
    setSelectedHtIds(newSelectedIds);
  };

  return (
    <Fragment>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada pengajuan baru.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isSelectHtDialogOpen} onOpenChange={setIsSelectHtDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pilih HT untuk Dipinjamkan</DialogTitle>
            <DialogDescription>
              Pilih <strong>{selectedPengajuan?.jumlah || 0} unit HT</strong> dari gudang pusat untuk dikirim ke <strong>{selectedPengajuan?.satkerPengaju.nama}</strong>.
              <br />
              <span className="font-bold">Terpilih: {selectedHtIds.size} / {selectedPengajuan?.jumlah || 0}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <Select value={merkFilter} onValueChange={setMerkFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Merek..." /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Semua Merek</SelectItem>
                      {uniqueMerks.map(merk => <SelectItem key={merk} value={merk}>{merk}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Kondisi..." /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Semua Kondisi</SelectItem>
                      {Object.values(HTStatus).map(status => <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleSelectFiltered} disabled={isPending}>
                Pilih Semua (Hasil Filter)
              </Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-1 space-y-2 border-t pt-4">
            {filteredHtDiGudang.length > 0 ? filteredHtDiGudang.map(ht => (
              <div key={ht.id} className="flex items-center space-x-3 rounded-md border p-3 transition-colors hover:bg-accent">
                <Checkbox
                  id={ht.id}
                  checked={selectedHtIds.has(ht.id)}
                  onCheckedChange={() => handleHtSelectionChange(ht.id)}
                />
                <Label htmlFor={ht.id} className="flex-1 cursor-pointer grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold">{ht.kodeHT}</p>
                    <p className="text-sm text-muted-foreground">{ht.merk}</p>
                  </div>
                  <p className="text-sm">{ht.serialNumber}</p>
                  <p className={`text-sm font-medium ${ht.status === 'BAIK' ? 'text-green-600' : 'text-orange-600'}`}>
                    {ht.status.replace('_', ' ')}
                  </p>
                </Label>
              </div>
            )) : <p className="text-center text-muted-foreground py-8">Tidak ada HT yang cocok dengan filter.</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSelectHtDialogOpen(false)}>Batal</Button>
            <Button 
              type="button" 
              disabled={isPending || selectedHtIds.size !== (selectedPengajuan?.jumlah || 0)} 
              onClick={handleApprovePeminjamanSubmit}>
                {isPending ? 'Memproses...' : 'Setujui & Pinjamkan Terpilih'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk pengajuan ini. Alasan akan ditampilkan kepada Admin Satker yang bersangkutan.
            </DialogDescription>
          </DialogHeader>
          <form action={handleRejectSubmit}>
            <input type="hidden" name="pengajuanId" value={selectedPengajuan?.id ?? ''} />
            <input type="hidden" name="tipe" value={tipe} />
            
            <div className="py-4 space-y-2">
              <Label htmlFor="catatanAdmin">Alasan Penolakan</Label>
              <Textarea
                id="catatanAdmin"
                name="catatanAdmin"
                placeholder="Contoh: Stok HT tidak tersedia, data personil tidak valid, dll."
                required
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Memproses...' : 'Kirim Penolakan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}