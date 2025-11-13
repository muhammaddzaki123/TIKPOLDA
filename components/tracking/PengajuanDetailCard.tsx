// components/tracking/PengajuanDetailCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrackingTimeline, TrackingStatus } from './TrackingTimeline';
import { Eye, Download, Package, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface HtDetail {
  id: string;
  merk: string;
  serialNumber: string;
}

interface PengajuanDetail {
  id: string;
  keperluan: string;
  jumlah: number;
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  trackingStatus: TrackingStatus;
  fileUrl?: string | null;
  catatanAdmin?: string | null;
  estimasiSelesai?: Date | null;
  tanggalPickup?: Date | null;
  tanggalReturn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  approvedHts?: HtDetail[];
}

interface PengajuanDetailCardProps {
  pengajuan: PengajuanDetail;
  onReturnRequest?: (pengajuanId: string) => void;
}

export function PengajuanDetailCard({ pengajuan, onReturnRequest }: PengajuanDetailCardProps) {
  const [showTracking, setShowTracking] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingStatusColor = (trackingStatus: TrackingStatus) => {
    switch (trackingStatus) {
      case 'PENGAJUAN_DIKIRIM': return 'bg-blue-100 text-blue-800';
      case 'SEDANG_DIPROSES': return 'bg-yellow-100 text-yellow-800';
      case 'DISETUJUI': return 'bg-green-100 text-green-800';
      case 'SIAP_DIAMBIL': return 'bg-purple-100 text-purple-800';
      case 'SEDANG_DIGUNAKAN': return 'bg-green-100 text-green-800';
      case 'PERMINTAAN_PENGEMBALIAN': return 'bg-orange-100 text-orange-800';
      case 'SUDAH_DIKEMBALIKAN': return 'bg-gray-100 text-gray-800';
      case 'DITOLAK': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingStatusLabel = (trackingStatus: TrackingStatus) => {
    const labels = {
      'PENGAJUAN_DIKIRIM': 'Pengajuan Dikirim',
      'SEDANG_DIPROSES': 'Sedang Diproses',
      'DISETUJUI': 'Disetujui',
      'SIAP_DIAMBIL': 'Siap Diambil',
      'SEDANG_DIGUNAKAN': 'Sedang Digunakan',
      'PERMINTAAN_PENGEMBALIAN': 'Permintaan Pengembalian',
      'SUDAH_DIKEMBALIKAN': 'Sudah Dikembalikan',
      'DITOLAK': 'Ditolak'
    };
    return labels[trackingStatus] || trackingStatus;
  };

  const canRequestReturn = pengajuan.trackingStatus === 'SEDANG_DIGUNAKAN' && pengajuan.approvedHts && pengajuan.approvedHts.length > 0;

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col gap-3">
          <div className="space-y-2">
            <CardTitle className="text-base sm:text-lg font-semibold">
              Pengajuan #{pengajuan.id.substring(0, 8).toUpperCase()}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Badge className={`${getStatusColor(pengajuan.status)} text-[10px] sm:text-xs px-2 py-0.5 sm:py-1`}>
                {pengajuan.status}
              </Badge>
              <Badge className={`${getTrackingStatusColor(pengajuan.trackingStatus)} text-[10px] sm:text-xs px-2 py-0.5 sm:py-1`}>
                {getTrackingStatusLabel(pengajuan.trackingStatus)}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={showTracking} onOpenChange={setShowTracking}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Lihat Tracking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Detail Tracking Pengajuan #{pengajuan.id.substring(0, 8).toUpperCase()}</span>
                    <span className="sm:hidden">Tracking #{pengajuan.id.substring(0, 8).toUpperCase()}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <TrackingTimeline
                    currentStatus={pengajuan.trackingStatus}
                    createdAt={pengajuan.createdAt}
                    estimasiSelesai={pengajuan.estimasiSelesai}
                    tanggalPickup={pengajuan.tanggalPickup}
                    tanggalReturn={pengajuan.tanggalReturn}
                    catatanAdmin={pengajuan.catatanAdmin}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            {pengajuan.fileUrl && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                <a href={pengajuan.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Download Surat
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-1">Keperluan</h4>
              <p className="text-xs sm:text-sm leading-relaxed">{pengajuan.keperluan}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-1">Jumlah HT</h4>
              <p className="text-xs sm:text-sm font-medium">{pengajuan.jumlah} unit</p>
            </div>
            
            {pengajuan.tanggalMulai && pengajuan.tanggalSelesai && (
              <div>
                <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-1">Periode Penggunaan</h4>
                <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="break-words">
                    {format(pengajuan.tanggalMulai, 'd MMM yyyy', { locale: id })} - {format(pengajuan.tanggalSelesai, 'd MMM yyyy', { locale: id })}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <div>
              <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-1">Tanggal Pengajuan</h4>
              <p className="text-xs sm:text-sm">{format(pengajuan.createdAt, 'd MMMM yyyy, HH:mm', { locale: id })}</p>
            </div>
            
            {pengajuan.estimasiSelesai && (
              <div>
                <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-1">Estimasi Selesai</h4>
                <p className="text-xs sm:text-sm">{format(pengajuan.estimasiSelesai, 'd MMMM yyyy', { locale: id })}</p>
              </div>
            )}
            
            {pengajuan.catatanAdmin && (
              <div>
                <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-1">Catatan Admin</h4>
                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 rounded leading-relaxed">{pengajuan.catatanAdmin}</p>
              </div>
            )}
          </div>
        </div>

        {pengajuan.approvedHts && pengajuan.approvedHts.length > 0 && (
          <div className="border-t pt-3 sm:pt-4">
            <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">HT yang Disetujui ({pengajuan.approvedHts.length} unit)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pengajuan.approvedHts.map((ht) => (
                <div key={ht.id} className="flex items-center gap-1.5 sm:gap-2 p-2 bg-gray-50 rounded text-xs sm:text-sm">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <span className="font-medium truncate">{ht.serialNumber}</span>
                  <span className="text-gray-500 truncate">({ht.merk})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canRequestReturn && onReturnRequest && (
          <div className="border-t pt-3 sm:pt-4">
            <Button 
              onClick={() => onReturnRequest(pengajuan.id)}
              variant="outline"
              className="w-full text-xs sm:text-sm py-2 sm:py-2.5 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Ajukan Pengembalian HT
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
