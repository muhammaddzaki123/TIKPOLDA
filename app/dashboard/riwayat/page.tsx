import { HTDataTable } from '@/components/ht-data-table';
import { peminjamanData } from '@/data/mock-history-data';
import { columns } from './columns';
import { DateRangePicker } from '@/components/date-range-picker'; // Komponen baru yang akan kita buat

export default function LoanHistoryPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Riwayat Peminjaman</h1>
        <div className="mt-4 sm:mt-0">
          <DateRangePicker />
        </div>
      </div>
      <p className="text-sm text-slate-600">
        Jejak audit untuk seluruh aktivitas peminjaman dan pengembalian perangkat HT.
      </p>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={peminjamanData} />
      </div>
    </div>
  );
}