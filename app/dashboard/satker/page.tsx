// app/dashboard/satker/page.tsx

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
import { HTDataTable } from '@/components/ht-data-table';
import { columns } from './columns';
import { PrismaClient } from '@prisma/client';
import { addSatker } from './actions'; // Import Server Action

const prisma = new PrismaClient();

// Fungsi untuk mengambil data Satker dari database
async function getSatkerData() {
  const data = await prisma.satker.findMany({
    orderBy: {
      nama: 'asc',
    },
  });
  return data;
}

export default async function SatkerManagementPage() {
  const satkerData = await getSatkerData();

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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Satker Baru</DialogTitle>
              <DialogDescription>
                Buat data Satuan Kerja baru. Pastikan data yang dimasukkan sudah benar.
              </DialogDescription>
            </DialogHeader>
            <form action={addSatker}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode Satker</Label>
                  <Input id="kode" name="kode" placeholder="Contoh: DITLANTAS" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap Satker</Label>
                  <Input id="nama" name="nama" placeholder="Contoh: Direktorat Lalu Lintas" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-600">
        Master data untuk semua Satuan Kerja yang terdaftar dalam sistem.
      </p>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={satkerData} />
      </div>
    </div>
  );
}