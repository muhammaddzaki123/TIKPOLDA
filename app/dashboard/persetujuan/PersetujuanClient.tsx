// app/dashboard/persetujuan/PersetujuanClient.tsx

'use client';

import { EnhancedPersetujuanTable } from './EnhancedPersetujuanTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackingStatus } from '@/components/tracking/TrackingTimeline';
import { approvePeminjaman, approveMutasi, approvePengembalian, rejectPengajuan, updateTrackingStatus } from './actions';
import { toast } from 'sonner';

interface HtOption {
  id: string;
  kodeHT: string;
  merk: string;
  serialNumber: string;
}

interface PengajuanPeminjaman {
  id: string;
  keperluan: string;
  jumlah: number;
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
  fileUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatanAdmin?: string | null;
  createdAt: Date;
  updatedAt: Date;
  satkerPengaju: { nama: string };
}

interface PengajuanMutasi {
  id: string;
  alasan: string;
  fileUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatanAdmin?: string | null;
  createdAt: Date;
  updatedAt: Date;
  personil: { nama: string; nrp: string };
  satkerAsal: { nama: string };
  satkerTujuan: { nama: string };
}

interface PengajuanPengembalian {
  id: string;
  alasan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatanAdmin?: string | null;
  createdAt: Date;
  updatedAt: Date;
  satkerPengaju: { nama: string };
  pengembalianDetails: {
    ht: { kodeHT: string; merk: string; serialNumber: string };
  }[];
}

interface PersetujuanClientProps {
  pengajuanPeminjaman: PengajuanPeminjaman[];
  pengajuanMutasi: PengajuanMutasi[];
  pengajuanPengembalian: PengajuanPengembalian[];
  htDiGudang: HtOption[];
}

export default function PersetujuanClient({
  pengajuanPeminjaman,
  pengajuanMutasi,
  pengajuanPengembalian,
  htDiGudang
}: PersetujuanClientProps) {

  // Transform data untuk peminjaman
  const peminjamanData = pengajuanPeminjaman.map(p => ({
    ...p,
    tipe: 'peminjaman' as const,
    trackingStatus: p.status === 'APPROVED' ? 'APPROVED' as TrackingStatus : 'SUBMITTED' as TrackingStatus
  }));

  // Transform data untuk mutasi
  const mutasiData = pengajuanMutasi.map(m => ({
    ...m,
    tipe: 'mutasi' as const,
    trackingStatus: 'SUBMITTED' as TrackingStatus
  }));

  // Transform data untuk pengembalian
  const pengembalianData = pengajuanPengembalian.map(p => ({
    ...p,
    tipe: 'pengembalian' as const,
    trackingStatus: 'SUBMITTED' as TrackingStatus
  }));

  const handleApprovePeminjaman = async (pengajuanId: string, selectedHtIds?: string[], trackingStatus?: TrackingStatus) => {
    try {
      if (!selectedHtIds || selectedHtIds.length === 0) {
        throw new Error('Pilih HT yang akan dipinjamkan.');
      }
      await approvePeminjaman(pengajuanId, selectedHtIds);
      toast.success('Pengajuan peminjaman berhasil disetujui.');
    } catch (error: any) {
      throw error;
    }
  };

  const handleApproveMutasi = async (pengajuanId: string) => {
    try {
      await approveMutasi(pengajuanId);
      toast.success('Pengajuan mutasi berhasil disetujui.');
    } catch (error: any) {
      throw error;
    }
  };

  const handleApprovePengembalian = async (pengajuanId: string) => {
    try {
      await approvePengembalian(pengajuanId);
      toast.success('Pengajuan pengembalian berhasil disetujui.');
    } catch (error: any) {
      throw error;
    }
  };

  const handleApprove = async (pengajuanId: string, selectedHtIds?: string[], trackingStatus?: TrackingStatus) => {
    // Tentukan tipe pengajuan berdasarkan ID
    const isPeminjaman = peminjamanData.find(p => p.id === pengajuanId);
    const isMutasi = mutasiData.find(m => m.id === pengajuanId);
    const isPengembalian = pengembalianData.find(p => p.id === pengajuanId);

    if (isPeminjaman) {
      await handleApprovePeminjaman(pengajuanId, selectedHtIds, trackingStatus);
    } else if (isMutasi) {
      await handleApproveMutasi(pengajuanId);
    } else if (isPengembalian) {
      await handleApprovePengembalian(pengajuanId);
    }
  };

  const handleReject = async (pengajuanId: string, reason: string) => {
    try {
      const formData = new FormData();
      formData.append('pengajuanId', pengajuanId);
      formData.append('catatanAdmin', reason);
      
      // Tentukan tipe pengajuan
      let tipe = '';
      if (peminjamanData.find(p => p.id === pengajuanId)) tipe = 'peminjaman';
      else if (mutasiData.find(m => m.id === pengajuanId)) tipe = 'mutasi';
      else if (pengembalianData.find(p => p.id === pengajuanId)) tipe = 'pengembalian';
      
      formData.append('tipe', tipe);
      
      await rejectPengajuan(formData);
      toast.success('Pengajuan berhasil ditolak.');
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateTracking = async (pengajuanId: string, trackingStatus: TrackingStatus, notes?: string) => {
    try {
      await updateTrackingStatus(pengajuanId, trackingStatus, notes);
      toast.success('Status tracking berhasil diperbarui.');
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Persetujuan</h1>
        <p className="text-sm text-slate-600">
          Proses semua pengajuan dari Satuan Kerja dengan sistem tracking yang terintegrasi.
        </p>
      </div>

      <Tabs defaultValue="peminjaman" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="peminjaman">
            Peminjaman HT ({pengajuanPeminjaman.length})
          </TabsTrigger>
          <TabsTrigger value="pengembalian">
            Pengembalian HT ({pengajuanPengembalian.length})
          </TabsTrigger>
          <TabsTrigger value="mutasi">
            Mutasi Personil ({pengajuanMutasi.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peminjaman" className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Pengajuan Peminjaman HT</h3>
              <p className="text-sm text-gray-600">
                Kelola pengajuan peminjaman HT dari berbagai satker dengan sistem tracking yang detail.
              </p>
            </div>
            <EnhancedPersetujuanTable
              data={peminjamanData}
              htOptions={htDiGudang}
              onApprove={handleApprove}
              onReject={handleReject}
              onUpdateTracking={handleUpdateTracking}
            />
          </div>
        </TabsContent>

        <TabsContent value="pengembalian" className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Pengajuan Pengembalian HT</h3>
              <p className="text-sm text-gray-600">
                Proses pengajuan pengembalian HT dari satker ke gudang pusat.
              </p>
            </div>
            <EnhancedPersetujuanTable
              data={pengembalianData}
              onApprove={handleApprove}
              onReject={handleReject}
              onUpdateTracking={handleUpdateTracking}
            />
          </div>
        </TabsContent>

        <TabsContent value="mutasi" className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Pengajuan Mutasi Personil</h3>
              <p className="text-sm text-gray-600">
                Kelola pengajuan mutasi personil antar satker.
              </p>
            </div>
            <EnhancedPersetujuanTable
              data={mutasiData}
              onApprove={handleApprove}
              onReject={handleReject}
              onUpdateTracking={handleUpdateTracking}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
