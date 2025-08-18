// components/approval/PengajuanApprovalCard.tsx

'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TrackingTimeline, TrackingStatus } from '@/components/tracking/TrackingTimeline';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  FileText, 
  Calendar,
  User,
  Building,
  Eye,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

interface HtOption {
  id: string;
  merk: string;
  serialNumber: string;
}

interface PengajuanData {
  id: string;
  tipe: 'peminjaman' | 'mutasi' | 'pengembalian';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  trackingStatus?: TrackingStatus;
  createdAt: Date;
  updatedAt: Date;
  catatanAdmin?: string | null;
  
  // Peminjaman specific
  keperluan?: string;
  jumlah?: number;
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
  fileUrl?: string | null;
  satkerPengaju?: { nama: string };
  
  // Mutasi specific
  alasan?: string;
  personil?: { nama: string; nrp: string };
  satkerAsal?: { nama: string };
  satkerTujuan?: { nama: string };
  
  // Pengembalian specific
  ht?: { merk: string; serialNumber: string };
  pengembalianDetails?: {
    ht: { merk: string; serialNumber: string };
  }[];
}

interface PengajuanApprovalCardProps {
  pengajuan: PengajuanData;
  htOptions?: HtOption[];
  onApprove: (pengajuanId: string, selectedHtIds?: string[], trackingStatus?: TrackingStatus) => Promise<void>;
  onReject: (pengajuanId: string, reason: string) => Promise<void>;
  onUpdateTracking?: (pengajuanId: string, trackingStatus: TrackingStatus, notes?: string) => Promise<void>;
}

export function PengajuanApprovalCard({ 
  pengajuan, 
  htOptions = [], 
  onApprove, 
  onReject,
  onUpdateTracking 
}: PengajuanApprovalCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedHtIds, setSelectedHtIds] = useState<string[]>([]);
  const [newTrackingStatus, setNewTrackingStatus] = useState<TrackingStatus>('UNDER_REVIEW');
  const [trackingNotes, setTrackingNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (pengajuan.tipe === 'peminjaman' && selectedHtIds.length !== pengajuan.jumlah) {
      toast.error(`Pilih ${pengajuan.jumlah} unit HT untuk disetujui.`);
      return;
    }

    startTransition(async () => {
      try {
        await onApprove(pengajuan.id, selectedHtIds, 'APPROVED');
        toast.success('Pengajuan berhasil disetujui.');
        setShowApproveDialog(false);
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        await onReject(pengajuan.id, rejectReason);
        toast.success('Pengajuan berhasil ditolak.');
        setShowRejectDialog(false);
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  const handleUpdateTracking = () => {
    startTransition(async () => {
      try {
        if (onUpdateTracking) {
          await onUpdateTracking(pengajuan.id, newTrackingStatus, trackingNotes);
          toast.success('Status tracking berhasil diperbarui.');
          setShowTrackingDialog(false);
        }
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipeIcon = () => {
    switch (pengajuan.tipe) {
      case 'peminjaman': return <Package className="h-5 w-5" />;
      case 'mutasi': return <User className="h-5 w-5" />;
      case 'pengembalian': return <Package className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTipeLabel = () => {
    switch (pengajuan.tipe) {
      case 'peminjaman': return 'Peminjaman HT';
      case 'mutasi': return 'Mutasi Personil';
      case 'pengembalian': return 'Pengembalian HT';
      default: return 'Pengajuan';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getTipeIcon()}
              {getTipeLabel()} #{pengajuan.id.substring(0, 8).toUpperCase()}
            </CardTitle>
            <Badge className={getStatusColor(pengajuan.status)}>
              {pengajuan.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            {pengajuan.trackingStatus && (
              <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Tracking
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Status Tracking Pengajuan</DialogTitle>
                  </DialogHeader>
                  <TrackingTimeline
                    currentStatus={pengajuan.trackingStatus}
                    createdAt={pengajuan.createdAt}
                    catatanAdmin={pengajuan.catatanAdmin}
                  />
                  {onUpdateTracking && pengajuan.status === 'APPROVED' && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">Update Status Tracking</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Status Baru</Label>
                          <Select value={newTrackingStatus} onValueChange={(value) => setNewTrackingStatus(value as TrackingStatus)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PROCESSING">Sedang Diproses</SelectItem>
                              <SelectItem value="READY_PICKUP">Siap Diambil</SelectItem>
                              <SelectItem value="IN_USE">Sedang Digunakan</SelectItem>
                              <SelectItem value="RETURNED">Sudah Dikembalikan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Catatan (Opsional)</Label>
                          <Textarea
                            value={trackingNotes}
                            onChange={(e) => setTrackingNotes(e.target.value)}
                            placeholder="Tambahkan catatan untuk update status..."
                          />
                        </div>
                        <Button onClick={handleUpdateTracking} disabled={isPending}>
                          {isPending ? 'Memperbarui...' : 'Update Status'}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
            
            {pengajuan.fileUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={pengajuan.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Dokumen
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {pengajuan.tipe === 'peminjaman' && (
              <>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Satker Pemohon</h4>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{pengajuan.satkerPengaju?.nama}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Keperluan</h4>
                  <p className="text-sm">{pengajuan.keperluan}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Jumlah HT</h4>
                  <p className="text-sm font-medium">{pengajuan.jumlah} unit</p>
                </div>
              </>
            )}
            
            {pengajuan.tipe === 'mutasi' && (
              <>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Personil</h4>
                  <p className="text-sm">{pengajuan.personil?.nama} ({pengajuan.personil?.nrp})</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Mutasi</h4>
                  <p className="text-sm">{pengajuan.satkerAsal?.nama} → {pengajuan.satkerTujuan?.nama}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Alasan</h4>
                  <p className="text-sm">{pengajuan.alasan}</p>
                </div>
              </>
            )}
            
            {pengajuan.tipe === 'pengembalian' && (
              <>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Satker Pemohon</h4>
                  <p className="text-sm">{pengajuan.satkerPengaju?.nama}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">HT yang Dikembalikan</h4>
                  {pengajuan.pengembalianDetails && pengajuan.pengembalianDetails.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{pengajuan.pengembalianDetails.length} unit HT:</p>
                      <div className="flex flex-wrap gap-1">
                        {pengajuan.pengembalianDetails.map((detail, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {detail.ht.serialNumber} ({detail.ht.merk})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : pengajuan.ht ? (
                    <p className="text-sm">{pengajuan.ht.serialNumber} ({pengajuan.ht.merk})</p>
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada data HT</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Alasan</h4>
                  <p className="text-sm">{pengajuan.alasan}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Tanggal Pengajuan</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{format(pengajuan.createdAt, 'd MMMM yyyy, HH:mm', { locale: id })}</span>
              </div>
            </div>
            
            {pengajuan.tanggalMulai && pengajuan.tanggalSelesai && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-1">Periode Penggunaan</h4>
                <p className="text-sm">
                  {format(pengajuan.tanggalMulai, 'd MMM yyyy', { locale: id })} - {format(pengajuan.tanggalSelesai, 'd MMM yyyy', { locale: id })}
                </p>
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

        {pengajuan.status === 'PENDING' && (
          <div className="border-t pt-4 flex gap-3">
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Setujui Pengajuan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {pengajuan.tipe === 'peminjaman' && htOptions.length > 0 && (
                    <div>
                      <Label>Pilih HT yang akan dipinjamkan ({selectedHtIds.length}/{pengajuan.jumlah})</Label>
                      <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                        {htOptions.map((ht) => (
                          <div key={ht.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={ht.id}
                              checked={selectedHtIds.includes(ht.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  if (selectedHtIds.length < (pengajuan.jumlah || 0)) {
                                    setSelectedHtIds([...selectedHtIds, ht.id]);
                                  }
                                } else {
                                  setSelectedHtIds(selectedHtIds.filter(id => id !== ht.id));
                                }
                              }}
                            />
                            <label htmlFor={ht.id} className="text-sm cursor-pointer">
                              {ht.serialNumber} - {ht.merk}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="flex-1">
                      Batal
                    </Button>
                    <Button onClick={handleApprove} disabled={isPending} className="flex-1">
                      {isPending ? 'Memproses...' : 'Setujui'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tolak Pengajuan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Alasan Penolakan *</Label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Jelaskan alasan penolakan..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="flex-1">
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={handleReject} disabled={isPending} className="flex-1">
                      {isPending ? 'Memproses...' : 'Tolak'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
