import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTDataTable } from '@/components/ht-data-table'; // Pakai ulang lagi komponen tabel kita
import { satkerData } from '@/data/mock-satker-data';
import { columns } from './columns';

export default function SatkerManagementPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Satuan Kerja</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Satker Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Satker Baru</DialogTitle>
              <DialogDescription>
                Buat data Satuan Kerja baru. Pastikan data yang dimasukkan sudah benar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kode" className="text-right">
                  Kode Satker
                </Label>
                <Input id="kode" placeholder="e.g., DITLANTAS" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">
                  Nama Lengkap
                </Label>
                <Input id="nama" placeholder="e.g., Direktorat Lalu Lintas" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-600">
        Master data untuk semua Satuan Kerja yang terdaftar dalam sistem.
      </p>

      {/* Render komponen tabel data */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {/* Catatan: Untuk pencarian, komponen HTDataTable saat ini mencari 'serialNumber'.
            Untuk aplikasi nyata, ini perlu dibuat dinamis.
            Namun untuk UI, ini sudah cukup. */}
        <HTDataTable columns={columns} data={satkerData} />
      </div>
    </div>
  );
}