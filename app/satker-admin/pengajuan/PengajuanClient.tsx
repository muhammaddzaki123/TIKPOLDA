// app/satker-admin/pengajuan/PengajuanClient.tsx

'use client';

import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';
import { ReturnPackageForm, ApprovedLoanPackage } from '@/components/peminjaman/ReturnPackageForm';
import { EnhancedRiwayatTable } from './EnhancedRiwayatTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Radio, Undo2 } from 'lucide-react';
import { createPackagePengembalian } from './actions';
import { toast } from 'sonner';

interface PengajuanClientProps {
  personilList: any[];
  satkerList: any[];
  riwayatGabungan: any[];
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
    } catch (error: any) {
      console.error('Error creating return request:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Pengajuan</h1>
        <p className="text-sm text-slate-600">
          Gunakan formulir di bawah ini untuk mengirimkan permintaan resmi kepada Super Admin.
        </p>
      </div>

      <Tabs defaultValue="peminjaman" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="peminjaman"><Radio className="mr-2 h-4 w-4" />Peminjaman HT</TabsTrigger>
          <TabsTrigger value="mutasi"><ArrowRightLeft className="mr-2 h-4 w-4" />Mutasi Personil</TabsTrigger>
          <TabsTrigger value="pengembalian"><Undo2 className="mr-2 h-4 w-4" />Pengembalian HT</TabsTrigger>
        </TabsList>

        <TabsContent value="peminjaman" className="space-y-6">
          <div className="space-y-6">
            <FormPeminjaman />
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengajuan Peminjaman HT</CardTitle>
                <CardDescription>
                  Pantau status pengajuan Anda dengan sistem tracking yang detail seperti paket pengiriman.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRiwayatTable 
                  data={riwayatGabungan.filter(r => r.tipe === 'Peminjaman HT')} 
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
        
        <TabsContent value="pengembalian" className="space-y-6">
          <div className="space-y-6">
            <ReturnPackageForm approvedLoans={approvedLoans} />
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengajuan Pengembalian HT</CardTitle>
                <CardDescription>Jejak audit untuk semua permintaan pengembalian aset HT Anda ke pusat.</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRiwayatTable 
                  data={riwayatGabungan.filter(r => r.tipe === 'Pengembalian HT')} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
