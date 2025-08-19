// app/satker-admin/pengajuan/EnhancedRiwayatTable.tsx

'use client';

import { useState } from 'react';
import { PengajuanDetailCard } from '@/components/tracking/PengajuanDetailCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Package } from 'lucide-react';
import { TrackingStatus } from '@/components/tracking/TrackingTimeline';

interface HtDetail {
  id: string;
  merk: string;
  serialNumber: string;
}

interface EnhancedRiwayat {
  id: string;
  keperluan?: string;
  jumlah?: number;
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  trackingStatus?: TrackingStatus;
  fileUrl?: string | null;
  catatanAdmin?: string | null;
  estimasiSelesai?: Date | null;
  tanggalPickup?: Date | null;
  tanggalReturn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  approvedHts?: HtDetail[];
  tipe: string;
  // Untuk mutasi
  alasan?: string;
  personil?: { nama: string };
  satkerTujuan?: { nama: string };
}

interface EnhancedRiwayatTableProps {
  data: EnhancedRiwayat[];
  onReturnRequest?: (pengajuanId: string) => void;
}

export function EnhancedRiwayatTable({ data, onReturnRequest }: EnhancedRiwayatTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingFilter, setTrackingFilter] = useState<string>('all');

  // Filter data berdasarkan pencarian dan filter
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.keperluan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alasan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTracking = trackingFilter === 'all' || item.trackingStatus === trackingFilter;
    
    return matchesSearch && matchesStatus && matchesTracking;
  });

  // Pisahkan data peminjaman dan lainnya
  const peminjamanData = filteredData.filter(item => item.tipe === 'Peminjaman HT');
  const otherData = filteredData.filter(item => item.tipe !== 'Peminjaman HT');

  const renderPeminjamanCard = (pengajuan: EnhancedRiwayat) => {
    const pengajuanDetail = {
      id: pengajuan.id,
      keperluan: pengajuan.keperluan || '',
      jumlah: pengajuan.jumlah || 0,
      tanggalMulai: pengajuan.tanggalMulai,
      tanggalSelesai: pengajuan.tanggalSelesai,
      status: pengajuan.status,
      trackingStatus: pengajuan.trackingStatus || 'PENGAJUAN_DIKIRIM',
      fileUrl: pengajuan.fileUrl,
      catatanAdmin: pengajuan.catatanAdmin,
      estimasiSelesai: pengajuan.estimasiSelesai,
      tanggalPickup: pengajuan.tanggalPickup,
      tanggalReturn: pengajuan.tanggalReturn,
      createdAt: pengajuan.createdAt,
      updatedAt: pengajuan.updatedAt,
      approvedHts: pengajuan.approvedHts
    };

    return (
      <PengajuanDetailCard
        key={pengajuan.id}
        pengajuan={pengajuanDetail}
        onReturnRequest={onReturnRequest}
      />
    );
  };

  const renderOtherCard = (item: EnhancedRiwayat) => {
    return (
      <div key={item.id} className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg">
              {item.tipe} #{item.id.substring(0, 8).toUpperCase()}
            </h3>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.status}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {item.createdAt.toLocaleDateString('id-ID')}
          </div>
        </div>
        
        <div className="space-y-2">
          {item.tipe === 'Mutasi Personil' && (
            <p className="text-sm">
              <strong>Personil:</strong> {item.personil?.nama} → {item.satkerTujuan?.nama}
            </p>
          )}
          {item.alasan && (
            <p className="text-sm">
              <strong>Alasan:</strong> {item.alasan}
            </p>
          )}
          {item.catatanAdmin && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Catatan Admin:</strong> {item.catatanAdmin}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter dan Pencarian */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan keperluan, alasan, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={trackingFilter} onValueChange={setTrackingFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Tracking" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tracking</SelectItem>
            <SelectItem value="PENGAJUAN_DIKIRIM">Pengajuan Dikirim</SelectItem>
            <SelectItem value="SEDANG_DIPROSES">Sedang Diproses</SelectItem>
            <SelectItem value="DISETUJUI">Disetujui</SelectItem>
            <SelectItem value="SIAP_DIAMBIL">Siap Diambil</SelectItem>
            <SelectItem value="SEDANG_DIGUNAKAN">Sedang Digunakan</SelectItem>
            <SelectItem value="PERMINTAAN_PENGEMBALIAN">Permintaan Pengembalian</SelectItem>
            <SelectItem value="SUDAH_DIKEMBALIKAN">Sudah Dikembalikan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hasil */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
          <p className="text-gray-500">
            {data.length === 0 
              ? 'Belum ada riwayat pengajuan.' 
              : 'Tidak ada data yang sesuai dengan filter yang dipilih.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pengajuan Peminjaman dengan tracking detail */}
          {peminjamanData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Pengajuan Peminjaman HT ({peminjamanData.length})
              </h3>
              <div className="grid gap-4">
                {peminjamanData.map(renderPeminjamanCard)}
              </div>
            </div>
          )}

          {/* Pengajuan lainnya */}
          {otherData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Pengajuan Lainnya ({otherData.length})
              </h3>
              <div className="grid gap-4">
                {otherData.map(renderOtherCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
