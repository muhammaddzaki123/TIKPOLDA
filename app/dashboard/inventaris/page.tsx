import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HTDataTable } from '@/components/ht-data-table';
import { htData, HT } from '@/data/mock-ht-data'; 

import { columns } from './columns';

export default function InventarisPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventaris Handy Talky (HT)</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah HT Baru
        </Button>
      </div>
      <p className="text-sm text-slate-600">
        Kelola dan pantau semua perangkat HT yang terdaftar di semua Satuan Kerja.
      </p>

      {/* Render komponen tabel data */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={htData} />
      </div>
    </div>
  );
}