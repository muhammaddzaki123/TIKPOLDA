// app/dashboard/inventaris/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrismaClient } from '@prisma/client';
import { addHT } from './actions';
import { columns, HTWithDetails } from './columns';
import { InventarisDataTable } from './data-table';

const prisma = new PrismaClient();

// Fungsi untuk mengambil semua data HT beserta relasinya
async function getInventarisData(): Promise<HTWithDetails[]> {
  const data = await prisma.hT.findMany({
    include: {
      satker: true, // Sertakan data Satker
      peminjaman: { // Sertakan data peminjaman yang aktif
        where: { tanggalKembali: null },
        include: {
          personil: true, // Sertakan data Personil yang meminjam
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return data;
}

// Fungsi untuk mengambil daftar Satker untuk dropdown
async function getSatkerList() {
  return await prisma.satker.findMany({ orderBy: { nama: 'asc' } });
}

export default async function InventarisManagementPage() {
  const inventarisData = await getInventarisData();
  const satkerList = await getSatkerList();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Inventaris HT</h1>
          <p className="text-sm text-slate-600">Kelola dan pantau semua aset HT di seluruh Satuan Kerja.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah HT Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Input Data Aset HT Baru</DialogTitle>
              <DialogDescription>Masukkan detail lengkap untuk perangkat HT baru.</DialogDescription>
            </DialogHeader>
            <form action={addHT}>
              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" name="serialNumber" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kodeHT">Kode HT</Label>
                  <Input id="kodeHT" name="kodeHT" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merk">Merk HT</Label>
                  <Input id="merk" name="merk" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenis">Jenis HT</Label>
                  <Input id="jenis" name="jenis" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunBuat">Tahun Buat</Label>
                  <Input id="tahunBuat" name="tahunBuat" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunPeroleh">Tahun Peroleh</Label>
                  <Input id="tahunPeroleh" name="tahunPeroleh" type="number" required />
                </div>
                <div className="col-span-1 space-y-2 md:col-span-2">
                  <Label htmlFor="satkerId">Penempatan di Satker</Label>
                   <Select name="satkerId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Satuan Kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {satkerList.map(satker => (
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

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <InventarisDataTable columns={columns} data={inventarisData} />
      </div>
    </div>
  );
}
