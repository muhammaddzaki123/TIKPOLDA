// app/satker-admin/pengajuan/PengajuanClient.tsx

'use client';

import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';
import { ReturnPackageForm, ApprovedLoanPackage } from '@/components/peminjaman/ReturnPackageForm';
import { EnhancedRiwayatTable } from './EnhancedRiwayatTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Radio } from 'lucide-react';
import { createPackagePengembalian } from './actions';
import { toast } from 'sonner';
import { Personil, Satker } from '@prisma/client';
import { TrackingStatus } from '@/components/tracking/TrackingTimeline';

interface HtDetail {
  id: string;
  merk: string;
  serialNumber: string;
}

interface RiwayatGabunganItem {
    id: string;
    tipe: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    trackingStatus: TrackingStatus | null;
    createdAt: Date;
    updatedAt: Date;
    alasan?: string;
    catatanAdmin?: string | null;
    approvedHts?: HtDetail[];
    keperluan?: string;
    jumlah?: number;
    tanggalMulai?: Date | null;
    tanggalSelesai?: Date | null;
    fileUrl?: string | null;
    personil?: { nama: string };
    satkerTujuan?: { nama: string };
  }

interface PengajuanClientProps {
  personilList: Personil[];
  satkerList: Satker[];
  riwayatGabungan: RiwayatGabunganItem[];
  approvedLoans: ApprovedLoanPackage[];
}

export default function PengajuanClient({ 
  personilList, 
  satkerList, 
  riwayatGabungan, 
  approvedLoans 
}: PengajuanClientProps) {
  
  const handleReturnRequest = async (pengajuanId: string) => {
    try {
      // Cari pengajuan yang sesuai untuk mendapatkan detail HT
      const pengajuan = riwayatGabungan.find(r => r.id === pengajuanId);
      if (!pengajuan || !pengajuan.approvedHts || pengajuan.approvedHts.length === 0) {
        throw new Error('Tidak ada HT yang dapat dikembalikan untuk pengajuan ini atau HT sudah dalam proses pengembalian.');
      }

      // Confirm with user before proceeding
      const confirmed = confirm(
        `Anda akan mengajukan pengembalian untuk ${pengajuan.approvedHts.length} unit HT dengan keperluan "${pengajuan.keperluan}". Lanjutkan?`
      );
      
      if (!confirmed) return;

      const formData = new FormData();
      formData.append('pengajuanPeminjamanId', pengajuanId);
      formData.append('alasan', 'Permintaan pengembalian dari tracking pengajuan - kegiatan telah selesai');
      
      await createPackagePengembalian(formData);
      toast.success('Permintaan pengembalian berhasil dikirim dan sedang menunggu persetujuan.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating return request:', error.message);
        toast.error(`Error: ${error.message}`);
      } else {
        console.error('An unknown error occurred:', error);
        toast.error('Terjadi kesalahan yang tidak diketahui.');
      }
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Pusat Pengajuan</h1>
        <p className="text-sm text-slate-600 mt-1">
          Gunakan formulir di bawah ini untuk mengirimkan permintaan resmi kepada Super Admin.
        </p>
      </div>

      <Tabs defaultValue="peminjaman" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-10">
          <TabsTrigger value="peminjaman" className="text-xs sm:text-sm">
            <Radio className="mr-2 h-4 w-4" />
            Peminjaman & Pengembalian HT
          </TabsTrigger>
          <TabsTrigger value="mutasi" className="text-xs sm:text-sm">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Mutasi Personil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peminjaman" className="space-y-6 mt-6">
          <div className="space-y-6">
            <FormPeminjaman />
            
            {/* Paket Peminjaman Aktif untuk Pengembalian */}
            {approvedLoans.length > 0 && (
              <ReturnPackageForm approvedLoans={approvedLoans} />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengajuan Peminjaman & Pengembalian HT</CardTitle>
                <CardDescription>
                  Pantau status pengajuan Anda dengan sistem tracking yang detail. Ajukan pengembalian langsung dari tracking atau gunakan form paket di atas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRiwayatTable 
                  data={riwayatGabungan.filter(r => r.tipe === 'Peminjaman HT' || r.tipe === 'Pengembalian HT')} 
                  onReturnRequest={handleReturnRequest}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mutasi" className="space-y-6">
          <div className="space-y-6">
            <FormMutasi personilList={personilList} satkerList={satkerList} />
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengajuan Mutasi Personil</CardTitle>
                <CardDescription>Jejak audit untuk semua permintaan mutasi anggota Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRiwayatTable 
                  data={riwayatGabungan.filter(r => r.tipe === 'Mutasi Personil')} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
