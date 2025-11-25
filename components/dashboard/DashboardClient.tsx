'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Prisma } from '@prisma/client';
import { 
  Building, 
  Users, 
  RadioTower, 
  CheckCircle, 
  Wrench, 
  XCircle,
  TrendingUp,
  Package,
} from 'lucide-react';
import { PremiumStatCard } from './PremiumStatCard';
import { ActivityTimeline } from './ActivityTimeline';
import { ChartCard, MultiLineChart, BarChartComponent, PieChartComponent } from './Charts';

// Tipe untuk data yang akan kita terima
type HtWithDetails = Prisma.HTGetPayload<{
  include: {
    satker: true;
    peminjaman: { where: { tanggalKembali: null }, include: { personil: true } };
  }
}>;

type Stats = {
  satkerCount: number;
  personilCount: number;
  htCount: number;
  dipinjamCount: number;
  tersediaCount: number;
  rusakCount: number;
  hilangCount: number;
};

type HtData = {
  allHt: HtWithDetails[];
  htRusak: HtWithDetails[];
  htHilang: HtWithDetails[];
  htDipinjam: HtWithDetails[];
  htTersedia: HtWithDetails[];
};

type Trends = {
  peminjaman: {
    current: number;
    previous: number;
    percentage: number;
  };
  pengembalian: {
    current: number;
    previous: number;
    percentage: number;
  };
};

type ChartData = {
  date: string;
  peminjaman: number;
  pengembalian: number;
};

type Activity = {
  id: string;
  type: 'peminjaman' | 'pengembalian' | 'pengajuan' | 'persetujuan' | 'penolakan';
  description: string;
  user?: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
};

type SatkerDistribution = {
  name: string;
  value: number;
};

interface DashboardClientProps {
  stats: Stats;
  htData: HtData;
  trends: Trends;
  chartData: ChartData[];
  activities: Activity[];
  satkerDistribution: SatkerDistribution[];
}

// Komponen utama untuk dashboard interaktif profesional
export function DashboardClient({ 
  stats, 
  htData, 
  trends, 
  chartData, 
  activities,
  satkerDistribution 
}: DashboardClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogData, setDialogData] = useState<HtWithDetails[]>([]);

  const handleCardClick = (title: string, data: HtWithDetails[]) => {
    setDialogTitle(title);
    setDialogData(data);
    setIsDialogOpen(true);
  };

  // Kalkulasi statistik berdasarkan status untuk pie chart
  const statusDistribution = [
    { name: 'Tersedia', value: stats.tersediaCount, color: '#10b981' },
    { name: 'Dipinjam', value: stats.dipinjamCount, color: '#f59e0b' },
    { name: 'Rusak', value: stats.rusakCount, color: '#ef4444' },
    { name: 'Hilang', value: stats.hilangCount, color: '#6b7280' },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Key Metrics - Cards profesional dengan trend */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PremiumStatCard
            title="Total Satuan Kerja"
            value={stats.satkerCount}
            icon={Building}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            accentColor="bg-blue-400"
            subtitle="Unit organisasi"
          />
          <PremiumStatCard
            title="Total Personil"
            value={stats.personilCount}
            icon={Users}
            gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
            accentColor="bg-cyan-400"
            subtitle="Pengguna aktif"
          />
          <PremiumStatCard
            title="Total Unit HT"
            value={stats.htCount}
            icon={RadioTower}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            accentColor="bg-indigo-400"
            subtitle="Aset Handy Talky"
            onClick={() => handleCardClick('Total Unit HT', htData.allHt)}
          />
          <PremiumStatCard
            title="Peminjaman Bulan Ini"
            value={trends.peminjaman.current}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            accentColor="bg-purple-400"
            trend={{
              value: trends.peminjaman.percentage,
              isPositive: trends.peminjaman.percentage >= 0,
            }}
            subtitle={`vs ${trends.peminjaman.previous} bulan lalu`}
          />
        </div>

        {/* Status HT Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PremiumStatCard
            title="HT Tersedia"
            value={stats.tersediaCount}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            accentColor="bg-green-400"
            subtitle="Siap dipinjam"
            onClick={() => handleCardClick('Daftar HT Tersedia', htData.htTersedia)}
          />
          <PremiumStatCard
            title="HT Dipinjam"
            value={stats.dipinjamCount}
            icon={Package}
            gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
            accentColor="bg-yellow-400"
            subtitle="Sedang digunakan"
            onClick={() => handleCardClick('Daftar HT Dipinjam', htData.htDipinjam)}
          />
          <PremiumStatCard
            title="HT Rusak"
            value={stats.rusakCount}
            icon={Wrench}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
            accentColor="bg-orange-400"
            subtitle="Perlu perbaikan"
            onClick={() => handleCardClick('Daftar HT Rusak', htData.htRusak)}
          />
          <PremiumStatCard
            title="HT Hilang"
            value={stats.hilangCount}
            icon={XCircle}
            gradient="bg-gradient-to-br from-red-500 to-red-600"
            accentColor="bg-red-400"
            subtitle="Tidak ditemukan"
            onClick={() => handleCardClick('Daftar HT Hilang', htData.htHilang)}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trend Peminjaman & Pengembalian */}
          <ChartCard
            title="Trend Peminjaman & Pengembalian"
            subtitle="6 bulan terakhir"
          >
            <MultiLineChart
              data={chartData}
              lines={[
                { dataKey: 'peminjaman', name: 'Peminjaman', color: '#3b82f6' },
                { dataKey: 'pengembalian', name: 'Pengembalian', color: '#10b981' },
              ]}
            />
          </ChartCard>

          {/* Distribusi Status HT */}
          <ChartCard
            title="Distribusi Status HT"
            subtitle="Status aset saat ini"
          >
            <PieChartComponent data={statusDistribution} />
          </ChartCard>
        </div>

        {/* Distribusi HT per Satker & Activity Timeline */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Distribusi per Satker */}
          <ChartCard
            title="Distribusi HT per Satker"
            subtitle="Top 10 satuan kerja"
          >
            <BarChartComponent 
              data={satkerDistribution} 
              barColor="#6366f1"
            />
          </ChartCard>

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Dialog untuk menampilkan detail */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto">
            <div className="rounded-lg border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold">Serial Number</TableHead>
                    <TableHead className="font-semibold">Merek</TableHead>
                    <TableHead className="font-semibold">Jenis</TableHead>
                    <TableHead className="font-semibold">Penempatan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Pemegang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dialogData.length > 0 ? (
                    dialogData.map((ht) => (
                      <TableRow key={ht.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-sm">{ht.serialNumber}</TableCell>
                        <TableCell className="font-medium">{ht.merk}</TableCell>
                        <TableCell>{ht.jenis}</TableCell>
                        <TableCell>{ht.satker?.nama || 'Gudang Pusat'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={ht.status === 'BAIK' ? 'default' : 'destructive'}
                            className={
                              ht.status === 'BAIK'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : ''
                            }
                          >
                            {ht.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ht.peminjaman[0]?.personil.nama || (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-slate-500"
                      >
                        Tidak ada data untuk ditampilkan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
