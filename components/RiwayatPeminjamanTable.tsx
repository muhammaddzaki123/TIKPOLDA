// File: components/RiwayatPeminjamanTable.tsx

'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from './ui/badge';
import { RiwayatPerpanjanganModal } from './RiwayatPerpanjanganModal';
import type { Peminjaman, HT, Personil, RiwayatPerpanjangan } from '@prisma/client';
import Link from 'next/link';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, History, Search } from 'lucide-react';

/*
  PERUBAHAN DI SINI:
  - Tipe `tanggalKembali` diubah menjadi `Date | null` agar cocok dengan tipe dari Prisma.
  - Ditambahkan riwayatPerpanjangan untuk tracking history perpanjangan
*/
type RiwayatPeminjaman = (Peminjaman & { 
    ht: HT; 
    personil: Personil; 
    tanggalKembali: Date | null;
    riwayatPerpanjangan: RiwayatPerpanjangan[];
});

interface RiwayatPeminjamanTableProps {
  data: RiwayatPeminjaman[];
}

export function RiwayatPeminjamanTable({ data }: RiwayatPeminjamanTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<RiwayatPeminjaman | null>(null);

  // Filter data berdasarkan search term
  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.ht.serialNumber.toLowerCase().includes(searchLower) ||
      item.personil.nama.toLowerCase().includes(searchLower) ||
      item.personil.nrp.toLowerCase().includes(searchLower)
    );
  });

  // Hitung statistik dari data yang sudah include riwayatPerpanjangan
  const totalPeminjaman = filteredData.length;
  const totalPerpanjangan = filteredData.reduce((sum, item) => sum + item.riwayatPerpanjangan.length, 0);
  const peminjamanDenganPerpanjangan = filteredData.filter(item => item.riwayatPerpanjangan.length > 0).length;

  const openRiwayatModal = (peminjaman: RiwayatPeminjaman) => {
    setSelectedPeminjaman(peminjaman);
    setIsRiwayatModalOpen(true);
  };
  const renderCell = (label: string, content: React.ReactNode) => (
    <TableCell className="p-2 md:p-4 flex justify-between items-start border-b md:border-none md:table-cell">
      <span className="text-sm font-semibold text-gray-600 md:hidden">{label}</span>
      <div className="text-right md:text-left">{content}</div>
    </TableCell>
  );

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Peminjaman</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{totalPeminjaman}</div>
          <div className="text-xs text-blue-500 mt-1">Peminjaman selesai</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total Perpanjangan</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{totalPerpanjangan}</div>
          <div className="text-xs text-purple-500 mt-1">Kali perpanjangan</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Dengan Perpanjangan</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{peminjamanDenganPerpanjangan}</div>
          <div className="text-xs text-green-500 mt-1">Dari {totalPeminjaman} peminjaman</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari berdasarkan Serial Number, Nama, atau NRP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        {searchTerm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="md:border md:rounded-md">
      <Table>
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead className="text-xs sm:text-sm">Serial Number</TableHead>
            <TableHead className="text-xs sm:text-sm">Personil Peminjam</TableHead>
            <TableHead className="text-xs sm:text-sm">Tgl Pinjam</TableHead>
            <TableHead className="text-xs sm:text-sm">Tgl Kembali</TableHead>
            <TableHead className="text-xs sm:text-sm">Kondisi Kembali</TableHead>
            <TableHead className="text-xs sm:text-sm">SPRINT</TableHead>
            <TableHead className="text-xs sm:text-sm">Perpanjangan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="flex flex-col gap-4 md:table-row-group">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <TableRow key={item.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 md:table-row md:shadow-none md:p-0 md:bg-transparent">
                {renderCell("Serial Number", (
                  <div className="font-medium">
                    {item.ht.serialNumber}
                    <div className="text-xs text-muted-foreground">{item.ht.merk}</div>
                  </div>
                ))}
                {renderCell("Peminjam", (
                  <div>
                    {item.personil.nama}
                    <div className="text-xs text-muted-foreground">{item.personil.nrp}</div>
                  </div>
                ))}
                {renderCell("Tgl Pinjam", format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id }))}
                {renderCell("Tgl Kembali", (
                  <span className="font-semibold">
                    {item.tanggalKembali 
                      ? format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })
                      : '-'}
                  </span>
                ))}
                {renderCell("Kondisi Kembali", (
                  <div className="text-xs sm:text-sm">{item.kondisiSaatKembali || '-'}</div>
                ))}
                {renderCell("SPRINT", (
                  item.fileUrl ? (
                    <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs" asChild>
                      <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-1 h-3 w-3" /> PDF
                      </Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">Tidak ada</Badge>
                  )
                ))}
                {renderCell("Perpanjangan", (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 sm:h-8 text-[10px] sm:text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                      onClick={() => openRiwayatModal(item)}
                    >
                      <History className="mr-1 h-3 w-3" /> Lihat
                    </Button>
                    {item.riwayatPerpanjangan.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs bg-purple-100 text-purple-700">
                        {item.riwayatPerpanjangan.length}x
                      </Badge>
                    )}
                  </div>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="md:table-row">
              <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                {searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada riwayat peminjaman yang selesai.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {/* Modal untuk melihat riwayat perpanjangan */}
      <RiwayatPerpanjanganModal
        isOpen={isRiwayatModalOpen}
        onClose={() => setIsRiwayatModalOpen(false)}
        peminjaman={selectedPeminjaman}
      />
    </div>
  );
}