// app/dashboard/riwayat/RiwayatPusatClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/date-range-picker';
import { RiwayatPusatTable, RiwayatPusatGrouped } from './RiwayatPusatTable';
import { Satker } from '@prisma/client';
import { Button } from '@/components/ui/button';

// --- Import Baru untuk Combobox ---
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface RiwayatPusatClientProps {
    riwayatData: RiwayatPusatGrouped[];
    satkerList: Satker[];
}

export function RiwayatPusatClient({ riwayatData, satkerList }: RiwayatPusatClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // State untuk filter, diinisialisasi dari URL
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [satkerFilter, setSatkerFilter] = useState(searchParams.get('satker') || '');

    // State untuk mengontrol popover combobox
    const [openSatker, setOpenSatker] = useState(false);

    // useEffect untuk filter teks pencarian (dengan debounce)
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }

        const handler = setTimeout(() => {
            router.replace(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery, pathname, router, searchParams]);
    
    // Handler untuk perubahan filter Satker
    const handleSatkerChange = (value: string | null) => {
        const newSatkerValue = value === satkerFilter ? '' : value || '';
        setSatkerFilter(newSatkerValue);
        
        const params = new URLSearchParams(searchParams.toString());
        if (newSatkerValue) {
            params.set('satker', newSatkerValue);
        } else {
            params.delete('satker');
        }
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Cari keperluan atau nama satker..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />

                {/* --- COMBOBOX UNTUK FILTER SATKER --- */}
                <Popover open={openSatker} onOpenChange={setOpenSatker}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openSatker} className="w-[220px] justify-between">
                        {satkerFilter ? satkerList.find((s) => s.id === satkerFilter)?.nama : "Filter Satker..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0">
                        <Command>
                            <CommandInput placeholder="Cari Satker..." />
                            <CommandList>
                                <CommandEmpty>Satker tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem value="all" onSelect={() => { handleSatkerChange(null); setOpenSatker(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", !satkerFilter ? "opacity-100" : "opacity-0")} />
                                        Semua Satker
                                    </CommandItem>
                                    {satkerList.map((satker) => (
                                        <CommandItem key={satker.id} value={satker.id} onSelect={(currentValue) => { handleSatkerChange(currentValue); setOpenSatker(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", satkerFilter === satker.id ? "opacity-100" : "opacity-0")} />
                                            {satker.nama}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <DateRangePicker />
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <RiwayatPusatTable data={riwayatData} />
            </div>
        </div>
    );
}