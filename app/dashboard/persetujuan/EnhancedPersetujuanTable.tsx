// app/dashboard/persetujuan/EnhancedPersetujuanTable.tsx

'use client';

import { useState } from 'react';
import { PengajuanApprovalCard } from '@/components/approval/PengajuanApprovalCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Clock, CheckCircle } from 'lucide-react';
import { TrackingStatus } from '@/components/tracking/TrackingTimeline';

interface HtOption {
  id: string;
  kodeHT: string;
  merk: string;
  serialNumber: string;
}

interface EnhancedPengajuan {
  id: string;
  tipe: 'peminjaman' | 'mutasi' | 'pengembalian';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  trackingStatus?: TrackingStatus;
  createdAt: Date;
  updatedAt: Date;
  catatanAdmin?: string | null;
  keperluan?: string;
  jumlah?: number;
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
  fileUrl?: string | null;
  satkerPengaju?: { nama: string };
  alasan?: string;
  personil?: { nama: string; nrp: string };
  satkerAsal?: { nama: string };
  satkerTujuan?: { nama: string };
  ht?: { kodeHT: string; merk: string; serialNumber: string };
  pengembalianDetails?: {
    ht: { kodeHT: string; merk: string; serialNumber: string };
  }[];
}

interface EnhancedPersetujuanTableProps {
  data: EnhancedPengajuan[];
  htOptions?: HtOption[];
  onApprove: (pengajuanId: string, selectedHtIds?: string[], trackingStatus?: TrackingStatus) => Promise<void>;
  onReject: (pengajuanId: string, reason: string) => Promise<void>;
  onUpdateTracking?: (pengajuanId: string, trackingStatus: TrackingStatus, notes?: string) => Promise<void>;
}

export function EnhancedPersetujuanTable({ 
  data, 
  htOptions = [], 
  onApprove, 
  onReject,
  onUpdateTracking 
}: EnhancedPersetujuanTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipeFilter, setTipeFilter] = useState<string>('all');

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.keperluan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alasan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.personil?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.satkerPengaju?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTipe = tipeFilter === 'all' || item.tipe === tipeFilter;
    
    return matchesSearch && matchesStatus && matchesTipe;
  });

  const pendingData = filteredData.filter(item => item.status === 'PENDING');
  const approvedData = filteredData.filter(item => item.status === 'APPROVED');
  const rejectedData = filteredData.filter(item => item.status === 'REJECTED');

  const stats = {
    total: data.length,
    pending: data.filter(item => item.status === 'PENDING').length,
    approved: data.filter(item => item.status === 'APPROVED').length,
    rejected: data.filter(item => item.status === 'REJECTED').length
  };

  const renderPengajuanCard = (pengajuan: EnhancedPengajuan) => {
    return (
      <PengajuanApprovalCard
        key={pengajuan.id}
        pengajuan={pengajuan}
        htOptions={pengajuan.tipe === 'peminjaman' ? htOptions : []}
        onApprove={onApprove}
        onReject={onReject}
        onUpdateTracking={onUpdateTracking}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <Package className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan keperluan, satker, personil, atau ID..."
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

        <Select value={tipeFilter} onValueChange={setTipeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="peminjaman">Peminjaman HT</SelectItem>
            <SelectItem value="mutasi">Mutasi Personil</SelectItem>
            <SelectItem value="pengembalian">Pengembalian HT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
          <p className="text-gray-500">
            {data.length === 0 
              ? 'Belum ada pengajuan yang perlu disetujui.' 
              : 'Tidak ada data yang sesuai dengan filter yang dipilih.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Menunggu Persetujuan ({pendingData.length})
                </h3>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Perlu Tindakan
                </Badge>
              </div>
              <div className="grid gap-4">
                {pendingData.map(renderPengajuanCard)}
              </div>
            </div>
          )}

          {approvedData.length > 0 && statusFilter !== 'PENDING' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Telah Disetujui ({approvedData.length})
              </h3>
              <div className="grid gap-4">
                {approvedData.map(renderPengajuanCard)}
              </div>
            </div>
          )}

          {rejectedData.length > 0 && statusFilter !== 'PENDING' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Telah Ditolak ({rejectedData.length})
              </h3>
              <div className="grid gap-4">
                {rejectedData.map(renderPengajuanCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
