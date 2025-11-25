'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'peminjaman' | 'pengembalian' | 'pengajuan' | 'persetujuan' | 'penolakan';
  description: string;
  user?: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityConfig = {
  peminjaman: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  pengembalian: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  pengajuan: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  persetujuan: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  penolakan: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terkini</h3>
        <Clock className="h-5 w-5 text-slate-400" />
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">
            Belum ada aktivitas terkini
          </p>
        ) : (
          activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div
                key={activity.id}
                className="relative flex gap-4 pb-4"
              >
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-5 top-10 h-full w-0.5 bg-slate-200" />
                )}
                
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.borderColor} border-2`}
                >
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.description}
                    </p>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                  {activity.user && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3 w-3" />
                      <span>{activity.user}</span>
                    </div>
                  )}
                  {activity.status && (
                    <Badge
                      variant={
                        activity.status === 'success'
                          ? 'default'
                          : activity.status === 'warning'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="mt-1"
                    >
                      {activity.status === 'success' && 'Berhasil'}
                      {activity.status === 'warning' && 'Perlu Perhatian'}
                      {activity.status === 'error' && 'Gagal'}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
