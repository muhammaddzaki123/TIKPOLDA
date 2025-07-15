// app/dashboard/riwayat/RiwayatPusatClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import { RiwayatPusatTable, RiwayatPusatGrouped } from './RiwayatPusatTable';
import { Satker } from '@prisma/client';

interface RiwayatPusatClientProps {
    riwayatData: RiwayatPusatGrouped[];
    satkerList: Satker[];
}

export function RiwayatPusatClient({ riwayatData, satkerList }: RiwayatPusatClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // State untuk setiap filter, diinisialisasi dari URL
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [satkerFilter, setSatkerFilter] = useState(searchParams.get('satker') || 'all');

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        // Hapus query jika kosong, atau set jika ada isinya
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }

        // Debounce untuk mencegah request berlebihan saat mengetik
        const handler = setTimeout(() => {
            router.replace(`${pathname}?${params.toString()}`);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
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
                    placeholder="Cari berdasarkan keperluan atau nama satker..."
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
                {/* Komponen DateRangePicker perlu dimodifikasi agar bisa berinteraksi */}
                {/* Untuk saat ini, kita tampilkan saja */}
                <DateRangePicker />
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <RiwayatPusatTable data={riwayatData} />
            </div>
        </div>
    );
}