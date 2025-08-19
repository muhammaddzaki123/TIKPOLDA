// app/dashboard/persetujuan/PersetujuanClient.tsx

'use client';

import { EnhancedPersetujuanTable } from './EnhancedPersetujuanTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackingStatus } from '@/components/tracking/TrackingTimeline';
import { approvePeminjaman, approveMutasi, rejectPengajuan, updateTrackingStatus } from './actions';
import { toast } from 'sonner';

interface HtOption {
  id: string;
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
  trackingStatus?: TrackingStatus;
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
    ht: { merk: string; serialNumber: string };
  }[];
}

interface PeminjamanSatker {
  id: string;
  tanggalPinjam: Date;
  tanggalKembali?: Date | null;
  catatan?: string | null;
  ht: { id: string; merk: string; serialNumber: string };
  satker: { nama: string };
}

interface PersetujuanClientProps {
  pengajuanPeminjaman: PengajuanPeminjaman[];
  pengajuanMutasi: PengajuanMutasi[];
  peminjamanSatker: PeminjamanSatker[];
  htDiGudang: HtOption[];
}

export default function PersetujuanClient({
  pengajuanPeminjaman,
  pengajuanMutasi,
  peminjamanSatker,
  htDiGudang
}: PersetujuanClientProps) {

  // Transform data untuk peminjaman dengan tracking status yang lebih detail
  const peminjamanData = pengajuanPeminjaman.map(p => {
    // Gunakan trackingStatus dari database atau tentukan berdasarkan kondisi
    let trackingStatus: TrackingStatus = p.trackingStatus || 'PENGAJUAN_DIKIRIM';
    
    // Jika belum ada trackingStatus di database, tentukan berdasarkan kondisi
    if (!p.trackingStatus) {
      if (p.status === 'APPROVED') {
        // Cek apakah HT sudah diambil (ada di peminjamanSatker)
        const htDipinjam = peminjamanSatker.filter(ps => 
          ps.catatan?.includes(p.id.substring(0, 8)) && ps.tanggalKembali === null
        );
        
        if (htDipinjam.length > 0) {
          trackingStatus = 'SEDANG_DIGUNAKAN';
        } else {
          trackingStatus = 'SIAP_DIAMBIL';
        }
      } else if (p.status === 'REJECTED') {
        trackingStatus = 'DITOLAK';
      }
    }

    return {
      ...p,
      tipe: 'peminjaman' as const,
      trackingStatus,
      htDipinjam: peminjamanSatker.filter(ps => 
        ps.catatan?.includes(p.id.substring(0, 8)) && ps.tanggalKembali === null
      )
    };
  });

  // Transform data untuk mutasi
  const mutasiData = pengajuanMutasi.map(m => ({
    ...m,
    tipe: 'mutasi' as const,
    trackingStatus: m.status === 'APPROVED' ? 'DISETUJUI' as TrackingStatus : 
                   m.status === 'REJECTED' ? 'DITOLAK' as TrackingStatus : 'PENGAJUAN_DIKIRIM' as TrackingStatus
  }));

  const handleApprovePeminjaman = async (pengajuanId: string, selectedHtIds: string[]) => {
    try {
      if (!selectedHtIds || selectedHtIds.length === 0) {
        throw new Error('Pilih HT yang akan dipinjamkan.');
      }
      console.log('Approving peminjaman:', { pengajuanId, selectedHtIds });
      await approvePeminjaman(pengajuanId, selectedHtIds);
      toast.success('Pengajuan peminjaman berhasil disetujui.');
    } catch (error: any) {
      console.error('Error in handleApprovePeminjaman:', error);
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

  const handleApprove = async (pengajuanId: string, selectedHtIds?: string[], trackingStatus?: TrackingStatus) => {
    try {
      console.log('handleApprove called with:', { pengajuanId, selectedHtIds, trackingStatus });
      
      // Tentukan tipe pengajuan berdasarkan ID
      const isPeminjaman = peminjamanData.find(p => p.id === pengajuanId);
      const isMutasi = mutasiData.find(m => m.id === pengajuanId);

      console.log('Found pengajuan:', { isPeminjaman: !!isPeminjaman, isMutasi: !!isMutasi });
      
      if (isPeminjaman) {
        console.log('Peminjaman trackingStatus:', isPeminjaman.trackingStatus);
      }

      // Cek apakah ini adalah permintaan pengembalian
      if (isPeminjaman && isPeminjaman.trackingStatus === 'PERMINTAAN_PENGEMBALIAN') {
        console.log('Processing return request for:', pengajuanId);
        // Handle pengembalian - update status ke SUDAH_DIKEMBALIKAN
        await handleUpdateTracking(pengajuanId, 'SUDAH_DIKEMBALIKAN', 'Pengembalian HT diterima oleh Super Admin');
        toast.success('Pengembalian HT berhasil diterima.');
      } else if (isPeminjaman) {
        console.log('Processing normal peminjaman approval for:', pengajuanId);
        await handleApprovePeminjaman(pengajuanId, selectedHtIds || []);
      } else if (isMutasi) {
        console.log('Processing mutasi approval for:', pengajuanId);
        await handleApproveMutasi(pengajuanId);
      } else {
        console.error('No matching pengajuan found for ID:', pengajuanId);
        throw new Error('Pengajuan tidak ditemukan.');
      }
    } catch (error: any) {
      console.error('Error in handleApprove:', error);
      toast.error(`Error: ${error.message}`);
      throw error;
    }
  };

  const handleReturnHT = async (pengajuanId: string) => {
    try {
      // Update tracking status ke SUDAH_DIKEMBALIKAN dan kembalikan HT ke gudang
      await handleUpdateTracking(pengajuanId, 'SUDAH_DIKEMBALIKAN', 'HT dikembalikan ke gudang pusat');
      toast.success('HT berhasil dikembalikan ke gudang pusat.');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleReject = async (pengajuanId: string, reason: string) => {
    try {
      // Tentukan apakah ini penolakan pengembalian
      const isPeminjaman = peminjamanData.find(p => p.id === pengajuanId);
      
      if (isPeminjaman && isPeminjaman.trackingStatus === 'PERMINTAAN_PENGEMBALIAN') {
        // Handle penolakan pengembalian - kembalikan status ke SEDANG_DIGUNAKAN
        await handleUpdateTracking(pengajuanId, 'SEDANG_DIGUNAKAN', `Pengembalian ditolak: ${reason}`);
        toast.success('Pengembalian HT berhasil ditolak.');
      } else {
        // Handle penolakan pengajuan normal
        const formData = new FormData();
        formData.append('pengajuanId', pengajuanId);
        formData.append('catatanAdmin', reason);
        
        // Tentukan tipe pengajuan
        let tipe = '';
        if (peminjamanData.find(p => p.id === pengajuanId)) tipe = 'peminjaman';
        else if (mutasiData.find(m => m.id === pengajuanId)) tipe = 'mutasi';
        
        formData.append('tipe', tipe);
        
        await rejectPengajuan(formData);
        toast.success('Pengajuan berhasil ditolak.');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateTracking = async (pengajuanId: string, trackingStatus: TrackingStatus, notes?: string) => {
    try {
      console.log('handleUpdateTracking called with:', { pengajuanId, trackingStatus, notes });
      await updateTrackingStatus(pengajuanId, trackingStatus, notes);
      console.log('updateTrackingStatus completed successfully');
      toast.success('Status tracking berhasil diperbarui.');
    } catch (error: any) {
      console.error('Error in handleUpdateTracking:', error);
      toast.error(`Error: ${error.message}`);
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="peminjaman">
            Peminjaman HT ({pengajuanPeminjaman.filter(p => p.status === 'PENDING').length}/{pengajuanPeminjaman.length})
          </TabsTrigger>
          <TabsTrigger value="mutasi">
            Mutasi Personil ({pengajuanMutasi.filter(m => m.status === 'PENDING').length}/{pengajuanMutasi.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peminjaman" className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Peminjaman & Pengembalian HT</h3>
              <p className="text-sm text-gray-600">
                Kelola pengajuan peminjaman dan pengembalian HT dari berbagai satker dengan sistem tracking yang terintegrasi.
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
