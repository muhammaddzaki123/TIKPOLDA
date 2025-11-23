// components/satker/StatusPengajuanCard.tsx
'use client';

import { FileText, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import Link from 'next/link';

type PengajuanType = 'PEMINJAMAN' | 'MUTASI' | 'PENGEMBALIAN';
type PengajuanStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Pengajuan {
  id: string;
  type: PengajuanType;
  description: string;
  status: PengajuanStatus;
  createdAt: Date;
}

interface StatusPengajuanCardProps {
  pengajuanList: Pengajuan[];
}

export default function StatusPengajuanCard({ pengajuanList }: StatusPengajuanCardProps) {
  const getStatusBadge = (status: PengajuanStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <Clock className="h-3 w-3" />
            Menunggu
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" />
            Disetujui
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            <XCircle className="h-3 w-3" />
            Ditolak
          </span>
        );
    }
  };

  const getTypeIcon = (type: PengajuanType) => {
    switch (type) {
      case 'PEMINJAMAN':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'MUTASI':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'PENGEMBALIAN':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (pengajuanList.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md bg-slate-50 text-slate-400">
        Belum ada pengajuan yang dibuat
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pengajuanList.map((pengajuan) => (
        <div
          key={pengajuan.id}
          className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getTypeIcon(pengajuan.type)}</div>
            <div>
              <p className="text-sm font-medium text-slate-800">{pengajuan.description}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(pengajuan.createdAt)}</p>
            </div>
          </div>
          {getStatusBadge(pengajuan.status)}
        </div>
      ))}
      <div className="pt-2">
        <Link
          href="/satker-admin/pengajuan"
          className="block w-full rounded-md bg-cyan-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-cyan-600"
        >
          Lihat Semua Pengajuan
        </Link>
      </div>
    </div>
  );
}
