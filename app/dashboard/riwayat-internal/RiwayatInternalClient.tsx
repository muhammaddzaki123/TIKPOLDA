// app/dashboard/riwayat-internal/RiwayatInternalClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronsUpDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

import { columns, PeminjamanWithDetails } from './columns';
import { Satker, Personil, HT } from '@prisma/client'; // Import tipe HT

interface RiwayatInternalClientProps {
    riwayatData: PeminjamanWithDetails[];
    satkerList: Satker[];
    personilList: Personil[];
    htList: HT[]; // Terima daftar HT
}

export function RiwayatInternalClient({ riwayatData, satkerList, personilList, htList }: RiwayatInternalClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // State untuk setiap filter
    const [htFilter, setHtFilter] = useState(searchParams.get('q_ht') || '');
    const [peminjamFilter, setPeminjamFilter] = useState(searchParams.get('q_peminjam') || '');
    const [satkerFilter, setSatkerFilter] = useState(searchParams.get('satker') || '');

    // State untuk popover
    const [openHt, setOpenHt] = useState(false);
    const [openPeminjam, setOpenPeminjam] = useState(false);
    const [openSatker, setOpenSatker] = useState(false);
    
    const table = useReactTable({
        data: riwayatData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (htFilter) params.set('q_ht', htFilter); else params.delete('q_ht');
        if (peminjamFilter) params.set('q_peminjam', peminjamFilter); else params.delete('q_peminjam');
        if (satkerFilter) params.set('satker', satkerFilter); else params.delete('satker');

        const handler = setTimeout(() => {
            router.replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(handler);
    }, [htFilter, peminjamFilter, satkerFilter, pathname, router]);
    
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                
                {/* Combobox untuk Kode HT */}
                <Popover open={openHt} onOpenChange={setOpenHt}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openHt} className="w-full sm:w-[220px] justify-between">
                        {htFilter ? htList.find((ht) => ht.id === htFilter)?.kodeHT : "Pilih Kode HT..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0">
                        <Command>
                            <CommandInput placeholder="Cari Kode HT..." />
                            <CommandList><CommandEmpty>Kode HT tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem value="all" onSelect={() => { setHtFilter(""); setOpenHt(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", !htFilter ? "opacity-100" : "opacity-0")}/>
                                        Semua HT
                                    </CommandItem>
                                    {htList.map((ht) => (
                                        <CommandItem key={ht.id} value={ht.id} onSelect={(val) => { setHtFilter(val === htFilter ? "" : val); setOpenHt(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", htFilter === ht.id ? "opacity-100" : "opacity-0")}/>
                                            {ht.kodeHT}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Combobox untuk Nama Peminjam */}
                <Popover open={openPeminjam} onOpenChange={setOpenPeminjam}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openPeminjam} className="w-full sm:w-[220px] justify-between">
                        {peminjamFilter ? personilList.find((p) => p.id === peminjamFilter)?.nama : "Pilih Peminjam..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0">
                        <Command>
                            <CommandInput placeholder="Cari Nama Peminjam..." />
                            <CommandList><CommandEmpty>Peminjam tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem value="all" onSelect={() => { setPeminjamFilter(""); setOpenPeminjam(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", !peminjamFilter ? "opacity-100" : "opacity-0")}/>
                                        Semua Peminjam
                                    </CommandItem>
                                    {personilList.map((p) => (
                                        <CommandItem key={p.id} value={p.id} onSelect={(val) => { setPeminjamFilter(val === peminjamFilter ? "" : val); setOpenPeminjam(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", peminjamFilter === p.id ? "opacity-100" : "opacity-0")}/>
                                            {p.nama}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Combobox untuk Satker */}
                <Popover open={openSatker} onOpenChange={setOpenSatker}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openSatker} className="w-full sm:w-[220px] justify-between">
                        {satkerFilter ? satkerList.find((s) => s.id === satkerFilter)?.nama : "Pilih Satker..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0">
                        <Command><CommandInput placeholder="Cari Satker..." />
                            <CommandList><CommandEmpty>Satker tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem value="all" onSelect={() => { setSatkerFilter(""); setOpenSatker(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", !satkerFilter ? "opacity-100" : "opacity-0")}/>
                                        Semua Satker
                                    </CommandItem>
                                    {satkerList.map((s) => (
                                        <CommandItem key={s.id} value={s.id} onSelect={(val) => { setSatkerFilter(val === satkerFilter ? "" : val); setOpenSatker(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", satkerFilter === s.id ? "opacity-100" : "opacity-0")}/>
                                            {s.nama}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
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
        </div>
    );
}