// app/dashboard/riwayat-internal/RiwayatInternalClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { columns, PeminjamanWithDetails } from './columns';
import { Satker } from '@prisma/client';

interface RiwayatInternalClientProps {
    riwayatData: PeminjamanWithDetails[];
    satkerList: Satker[];
}

export function RiwayatInternalClient({ riwayatData, satkerList }: RiwayatInternalClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [satkerFilter, setSatkerFilter] = useState(searchParams.get('satker') || 'all');

    const table = useReactTable({
        data: riwayatData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }

        const handler = setTimeout(() => {
            router.replace(`${pathname}?${params.toString()}`);
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery, pathname, router, searchParams]);
    
    const handleSatkerChange = (value: string) => {
        setSatkerFilter(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('satker');
        } else {
            params.set('satker', value);
        }
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Cari kode HT atau nama peminjam..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={satkerFilter} onValueChange={handleSatkerChange}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Filter Satker..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Satker</SelectItem>
                        {satkerList.map((satker) => (
                            <SelectItem key={satker.id} value={satker.id}>{satker.nama}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
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
                                        Tidak ada data riwayat yang cocok dengan filter.
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
            </div>
        </div>
    );
}