// components/tracking/TrackingTimeline.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Package, Truck, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export type TrackingStatus = 
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'READY_PICKUP'
  | 'IN_USE'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REJECTED';

interface TrackingStep {
  status: TrackingStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const trackingSteps: TrackingStep[] = [
  {
    status: 'SUBMITTED',
    label: 'Pengajuan Dikirim',
    description: 'Pengajuan peminjaman telah dikirim dan menunggu review',
    icon: Package,
    color: 'bg-blue-500'
  },
  {
    status: 'UNDER_REVIEW',
    label: 'Sedang Ditinjau',
    description: 'Super Admin sedang meninjau pengajuan Anda',
    icon: Clock,
    color: 'bg-yellow-500'
  },
  {
    status: 'APPROVED',
    label: 'Disetujui',
    description: 'Pengajuan telah disetujui oleh Super Admin',
    icon: CheckCircle,
    color: 'bg-green-500'
  },
  {
    status: 'PROCESSING',
    label: 'Sedang Diproses',
    description: 'HT sedang disiapkan untuk pengiriman',
    icon: Package,
    color: 'bg-indigo-500'
  },
  {
    status: 'READY_PICKUP',
    label: 'Siap Diambil',
    description: 'HT sudah siap untuk diambil atau dikirim',
    icon: Truck,
    color: 'bg-purple-500'
  },
  {
    status: 'IN_USE',
    label: 'Sedang Digunakan',
    description: 'HT sedang digunakan oleh satker',
    icon: CheckCircle,
    color: 'bg-green-600'
  },
  {
    status: 'RETURN_REQUESTED',
    label: 'Permintaan Pengembalian',
    description: 'Permintaan pengembalian telah diajukan',
    icon: AlertCircle,
    color: 'bg-orange-500'
  },
  {
    status: 'RETURNED',
    label: 'Sudah Dikembalikan',
    description: 'HT telah dikembalikan ke gudang pusat',
    icon: CheckCircle,
    color: 'bg-gray-500'
  }
];

interface TrackingTimelineProps {
  currentStatus: TrackingStatus;
  createdAt: Date;
  estimasiSelesai?: Date | null;
  tanggalPickup?: Date | null;
  tanggalReturn?: Date | null;
  catatanAdmin?: string | null;
}

export function TrackingTimeline({ 
  currentStatus, 
  createdAt, 
  estimasiSelesai,
  tanggalPickup,
  tanggalReturn,
  catatanAdmin 
}: TrackingTimelineProps) {
  const getCurrentStepIndex = () => {
    if (currentStatus === 'REJECTED') return -1;
    return trackingSteps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isRejected = currentStatus === 'REJECTED';

  const getStepDate = (status: TrackingStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return createdAt;
      case 'READY_PICKUP':
        return tanggalPickup;
      case 'RETURNED':
        return tanggalReturn;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (isRejected) {
      return <Badge variant="destructive" className="mb-4">Ditolak</Badge>;
    }
    
    const currentStep = trackingSteps.find(step => step.status === currentStatus);
    return (
      <Badge variant="default" className="mb-4">
        {currentStep?.label || 'Status Tidak Diketahui'}
      </Badge>
    );
  };

  if (isRejected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Status Tracking Pengajuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getStatusBadge()}
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Pengajuan Ditolak</h4>
              <p className="text-sm text-red-600 mt-1">
                {catatanAdmin || 'Pengajuan Anda telah ditolak oleh Super Admin.'}
              </p>
              <p className="text-xs text-red-500 mt-2">
                Ditolak pada: {format(createdAt, 'd MMMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Status Tracking Pengajuan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getStatusBadge()}
        
        {estimasiSelesai && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Estimasi Selesai:</strong> {format(estimasiSelesai, 'd MMMM yyyy', { locale: id })}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {trackingSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepDate = getStepDate(step.status);
            
            return (
              <div key={step.status} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isCompleted 
                      ? `${step.color} text-white` 
                      : 'bg-gray-200 text-gray-400'
                    }
                    ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                  `}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  {index < trackingSteps.length - 1 && (
                    <div className={`
                      w-0.5 h-8 mt-2
                      ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </h4>
                    {stepDate && (
                      <span className="text-xs text-gray-500">
                        {format(stepDate, 'd MMM yyyy, HH:mm', { locale: id })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  
                  {isCurrent && catatanAdmin && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        <strong>Catatan Admin:</strong> {catatanAdmin}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
