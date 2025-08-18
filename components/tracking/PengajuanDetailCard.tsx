// components/tracking/PengajuanDetailCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrackingTimeline, TrackingStatus } from './TrackingTimeline';
import { Eye, Download, Package, Calendar, FileText, ArrowLeft } from 'lucide-react';
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
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-indigo-100 text-indigo-800';
      case 'READY_PICKUP': return 'bg-purple-100 text-purple-800';
      case 'IN_USE': return 'bg-green-100 text-green-800';
      case 'RETURN_REQUESTED': return 'bg-orange-100 text-orange-800';
      case 'RETURNED': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingStatusLabel = (trackingStatus: TrackingStatus) => {
    const labels = {
      'SUBMITTED': 'Pengajuan Dikirim',
      'UNDER_REVIEW': 'Sedang Ditinjau',
      'APPROVED': 'Disetujui',
      'PROCESSING': 'Sedang Diproses',
      'READY_PICKUP': 'Siap Diambil',
      'IN_USE': 'Sedang Digunakan',
      'RETURN_REQUESTED': 'Permintaan Pengembalian',
      'RETURNED': 'Sudah Dikembalikan',
      'REJECTED': 'Ditolak'
    };
    return labels[trackingStatus] || trackingStatus;
  };

  const canRequestReturn = pengajuan.trackingStatus === 'IN_USE' && pengajuan.approvedHts && pengajuan.approvedHts.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">
              Pengajuan #{pengajuan.id.substring(0, 8).toUpperCase()}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getStatusColor(pengajuan.status)}>
                {pengajuan.status}
              </Badge>
              <Badge className={getTrackingStatusColor(pengajuan.trackingStatus)}>
                {getTrackingStatusLabel(pengajuan.trackingStatus)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showTracking} onOpenChange={setShowTracking}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Tracking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Detail Tracking Pengajuan #{pengajuan.id.substring(0, 8).toUpperCase()}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
              <Button variant="outline" size="sm" asChild>
                <a href={pengajuan.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Surat
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Keperluan</h4>
              <p className="text-sm">{pengajuan.keperluan}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Jumlah HT</h4>
              <p className="text-sm font-medium">{pengajuan.jumlah} unit</p>
            </div>
            
            {pengajuan.tanggalMulai && pengajuan.tanggalSelesai && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-1">Periode Penggunaan</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {format(pengajuan.tanggalMulai, 'd MMM yyyy', { locale: id })} - {format(pengajuan.tanggalSelesai, 'd MMM yyyy', { locale: id })}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Tanggal Pengajuan</h4>
              <p className="text-sm">{format(pengajuan.createdAt, 'd MMMM yyyy, HH:mm', { locale: id })}</p>
            </div>
            
            {pengajuan.estimasiSelesai && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-1">Estimasi Selesai</h4>
                <p className="text-sm">{format(pengajuan.estimasiSelesai, 'd MMMM yyyy', { locale: id })}</p>
              </div>
            )}
            
            {pengajuan.catatanAdmin && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-1">Catatan Admin</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{pengajuan.catatanAdmin}</p>
              </div>
            )}
          </div>
        </div>

        {pengajuan.approvedHts && pengajuan.approvedHts.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-gray-600 mb-3">HT yang Disetujui ({pengajuan.approvedHts.length} unit)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pengajuan.approvedHts.map((ht) => (
                <div key={ht.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{ht.serialNumber}</span>
                  <span className="text-gray-500">({ht.merk})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canRequestReturn && onReturnRequest && (
          <div className="border-t pt-4">
            <Button 
              onClick={() => onReturnRequest(pengajuan.id)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ajukan Pengembalian HT
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
