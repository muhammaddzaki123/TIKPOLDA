// app/dashboard/riwayat-mutasi/RiwayatMutasiClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Satker } from '@prisma/client';
import ExportRiwayatMutasiButton from '@/components/ExportRiwayatMutasiButton';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { columns, RiwayatMutasiWithDetails } from './columns';
import { Badge } from '@/components/ui/badge';

interface RiwayatMutasiClientProps {
    riwayatData: RiwayatMutasiWithDetails[];
    satkerList: Satker[];
}

interface SatkerComboboxProps {
    value: string;
    setValue: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    satkerList: Satker[];
    placeholder: string;
}

// Helper Combobox Component
function SatkerCombobox({ value, setValue, open, setOpen, satkerList, placeholder }: SatkerComboboxProps) {
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full sm:w-[220px] justify-between">
                    {value ? satkerList.find((s: Satker) => s.id === value)?.nama : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
                <Command>
                    <CommandInput placeholder="Cari Satker..." />
                    <CommandList>
                        <CommandEmpty>Satker tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem onSelect={() => { setValue(""); setOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")}/>
                                Semua Satker
                            </CommandItem>
                            {satkerList.map((s: Satker) => (
                                <CommandItem key={s.id} value={s.id} onSelect={(val) => { setValue(val === value ? "" : val); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", value === s.id ? "opacity-100" : "opacity-0")}/>
                                    {s.nama}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}


export function RiwayatMutasiClient({ riwayatData, satkerList }: RiwayatMutasiClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [satkerAsalFilter, setSatkerAsalFilter] = useState(searchParams.get('asal') || '');
    const [satkerTujuanFilter, setSatkerTujuanFilter] = useState(searchParams.get('tujuan') || '');
    
    const [openAsal, setOpenAsal] = useState(false);
    const [openTujuan, setOpenTujuan] = useState(false);
    
    const table = useReactTable({
        data: riwayatData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (searchQuery) params.set('q', searchQuery); else params.delete('q');
        if (satkerAsalFilter) params.set('asal', satkerAsalFilter); else params.delete('asal');
        if (satkerTujuanFilter) params.set('tujuan', satkerTujuanFilter); else params.delete('tujuan');

        const handler = setTimeout(() => {
            router.replace(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery, satkerAsalFilter, satkerTujuanFilter, pathname, router, searchParams]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    const getStatusVariant = (status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
        switch (status) {
            case 'APPROVED': return 'default';
            case 'REJECTED': return 'destructive';
            default: return 'secondary';
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-1 sm:flex-wrap sm:items-center">
                <Input
                    placeholder="Cari nama, nrp, atau alasan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:max-w-sm"
                />
                <SatkerCombobox 
                    value={satkerAsalFilter}
                    setValue={setSatkerAsalFilter}
                    open={openAsal}
                    setOpen={setOpenAsal}
                    satkerList={satkerList}
                    placeholder="Filter Satker Asal..."
                />
                 <SatkerCombobox 
                    value={satkerTujuanFilter}
                    setValue={setSatkerTujuanFilter}
                    open={openTujuan}
                    setOpen={setOpenTujuan}
                    satkerList={satkerList}
                    placeholder="Filter Satker Tujuan..."
                />
                </div>
                
                {/* Tombol Export */}
                <div className="w-full sm:w-auto">
                    <ExportRiwayatMutasiButton />
                </div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                {/* Tampilan Tabel untuk Desktop */}
                <div className="hidden md:block">
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
                                            Tidak ada data riwayat yang cocok dengan filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button>
                    </div>
                </div>

                {/* Tampilan Kartu untuk Mobile */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {riwayatData.length > 0 ? (
                        riwayatData.map((item) => (
                            <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-semibold text-slate-800">{item.personil.nama}</span>
                                        <p className="text-sm text-slate-500 font-mono">{item.personil.nrp}</p>
                                    </div>
                                    <Badge variant={getStatusVariant(item.status)} className="whitespace-nowrap">
                                        {item.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                                    </Badge>
                                </div>
                                
                                <div className="text-sm text-slate-600 space-y-2 pt-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-slate-700 truncate">{item.satkerAsal.nama}</span>
                                        <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
                                        <span className="font-medium text-slate-700 truncate text-right">{item.satkerTujuan.nama}</span>
                                    </div>
                                    <p><span className="font-medium text-slate-700">Tgl Diproses:</span> {formatDate(item.updatedAt.toString())}</p>
                                    <p className="truncate" title={item.alasan}><span className="font-medium text-slate-700">Alasan:</span> {item.alasan}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <p>Tidak ada data riwayat mutasi yang cocok.</p>
                        </div>
                    )}
                </div>
                 {/* Navigasi Paginasi untuk Mobile */}
                 <div className="flex items-center justify-end space-x-2 pt-4 md:hidden">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button>
                </div>
            </div>
        </div>
    );
}