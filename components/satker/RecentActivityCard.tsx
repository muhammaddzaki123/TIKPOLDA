// components/satker/RecentActivityCard.tsx
'use client';

import { Clock, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';

interface Activity {
  id: string;
  type: 'PEMINJAMAN' | 'PENGEMBALIAN' | 'MUTASI';
  description: string;
  timestamp: Date;
  status?: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
}

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PEMINJAMAN':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'PENGEMBALIAN':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'MUTASI':
        return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (activities.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md bg-slate-50 text-slate-400">
        Belum ada aktivitas terbaru
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
        >
          <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">{activity.description}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDate(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
