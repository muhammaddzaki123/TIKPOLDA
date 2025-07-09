// app/dashboard/inventaris/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HTDataTable } from '@/components/ht-data-table';
import { columns } from './columns';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrismaClient } from '@prisma/client';
import { addHT } from './actions'; // Import Server Action yang baru dibuat

const prisma = new PrismaClient();

// 1. Fungsi untuk mengambil data HT dari database
async function getInventarisData() {
  const data = await prisma.hT.findMany({
    include: {
      satker: true, // Sertakan data relasi 'satker' untuk menampilkan nama satker
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return data;
}

// 2. Fungsi untuk mengambil daftar Satker untuk dropdown
async function getSatkerOptions() {
  const satkers = await prisma.satker.findMany();
  return satkers;
}

export default async function InventarisPage() {
  // 3. Panggil fungsi untuk mendapatkan data asli
  const inventarisData = await getInventarisData();
  const satkerOptions = await getSatkerOptions();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventaris Handy Talky (HT)</h1>
        
        {/* Dialog untuk Tambah HT Baru */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah HT Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Input Data Aset HT Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail lengkap untuk perangkat HT baru.
              </DialogDescription>
            </DialogHeader>
            
            {/* 4. Formulir menggunakan Server Action */}
            <form action={addHT}>
              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" name="serialNumber" placeholder="SN-xxx-xxx" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kodeHT">Kode HT</Label>
                  <Input id="kodeHT" name="kodeHT" placeholder="HT-xxx-xxx" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merk">Merk HT</Label>
                  <Input id="merk" name="merk" placeholder="Contoh: Motorola" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenis">Jenis HT</Label>
                  <Input id="jenis" name="jenis" placeholder="Contoh: APX 2000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunBuat">Tahun Buat</Label>
                  <Input id="tahunBuat" name="tahunBuat" type="number" placeholder="2023" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunPeroleh">Tahun Peroleh</Label>
                  <Input id="tahunPeroleh" name="tahunPeroleh" type="number" placeholder="2024" required />
                </div>
                <div className="col-span-1 space-y-2 md:col-span-2">
                  <Label htmlFor="satkerId">Penempatan Satker</Label>
                   <Select name="satkerId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Satuan Kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {satkerOptions.map(satker => (
                        <SelectItem key={satker.id} value={satker.id}>
                          {satker.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan Data HT</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-600">
        Kelola dan pantau semua perangkat HT yang terdaftar di semua Satuan Kerja.
      </p>

      {/* 5. Tabel sekarang menampilkan data dari database */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={inventarisData} />
      </div>
    </div>
  );
}