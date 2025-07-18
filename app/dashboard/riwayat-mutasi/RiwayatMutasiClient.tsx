// app/dashboard/riwayat-mutasi/RiwayatMutasiClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Satker } from '@prisma/client';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { columns, RiwayatMutasiWithDetails } from './columns';

interface RiwayatMutasiClientProps {
    riwayatData: RiwayatMutasiWithDetails[];
    satkerList: Satker[];
}

// Helper Combobox Component
function SatkerCombobox({ value, setValue, open, setOpen, satkerList, placeholder }: any) {
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
    }, [searchQuery, satkerAsalFilter, satkerTujuanFilter, pathname, router]);
    
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Cari nama, nrp, atau alasan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
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