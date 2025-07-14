// app/dashboard/inventaris/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrismaClient } from '@prisma/client';
import { addHtBySuperAdmin } from './actions';
import { gudangColumns, terdistribusiColumns, HtDetails } from './columns';
import { InventarisDataTable } from '@/components/inventarissuperadmin/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const prisma = new PrismaClient();

/**
 * Fungsi ini dieksekusi di server untuk mengambil semua data inventaris
 * yang dibutuhkan oleh halaman ini sebelum di-render.
 */
async function getInventarisData() {
  // Mengambil semua data HT beserta relasi-relasinya
  const allHt = await prisma.hT.findMany({
    include: {
      satker: true, // Data Satker penempatan
      peminjaman: { where: { tanggalKembali: null }, include: { personil: true } }, // Peminjaman aktif oleh personil
      peminjamanOlehSatker: true, // Riwayat peminjaman dari pusat ke Satker
    },
    orderBy: { createdAt: 'desc' },
  });

  // Memisahkan data HT berdasarkan apakah sudah ditempatkan di Satker atau belum
  const gudangData = allHt.filter((ht) => !ht.satkerId); // HT yang masih di Gudang Pusat
  const terdistribusiData = allHt.filter((ht) => ht.satkerId); // HT yang sudah di Satker

  // Mengambil daftar semua Satker untuk digunakan di form dan filter
  const satkerList = await prisma.satker.findMany({ orderBy: { nama: 'asc' } });

  return { gudangData, terdistribusiData, satkerList };
}

export default async function InventarisManagementPage() {
  // Memanggil fungsi untuk mendapatkan data
  const { gudangData, terdistribusiData, satkerList } = await getInventarisData();

  return (
    <div className="w-full space-y-6">
      {/* Header Halaman */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Inventaris HT (Pusat)</h1>
          <p className="text-sm text-slate-600">Kelola aset di gudang pusat dan pantau aset yang terdistribusi.</p>
        </div>
        
        {/* Tombol dan Dialog untuk Menambah HT Baru */}
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
              <DialogDescription>Masukkan detail HT. Pilih Satker jika ingin langsung didistribusikan.</DialogDescription>
            </DialogHeader>
            {/* Form ini menggunakan Server Action untuk menambah data */}
            <form action={addHtBySuperAdmin}>
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
                  <Label htmlFor="satkerId">Penempatan (Opsional)</Label>
                  <Select name="satkerId" defaultValue="gudang">
                    <SelectTrigger>
                      <SelectValue placeholder="Simpan di Gudang Pusat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gudang">Simpan di Gudang Pusat</SelectItem>
                      {satkerList.map((satker) => (
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

      {/* Sistem Tab untuk memisahkan tampilan data */}
      <Tabs defaultValue="terdistribusi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="terdistribusi">Inventaris Terdistribusi ({terdistribusiData.length})</TabsTrigger>
          <TabsTrigger value="gudang">Inventaris Gudang Pusat ({gudangData.length})</TabsTrigger>
        </TabsList>
        
        {/* Konten Tab untuk Inventaris Terdistribusi */}
        <TabsContent value="terdistribusi" className="rounded-lg border bg-white p-4 shadow-sm">
          <InventarisDataTable
            columns={terdistribusiColumns}
            data={terdistribusiData as HtDetails[]}
            filterColumn="kodeHT"
            filterPlaceholder="Cari Kode HT Terdistribusi..."
            satkerList={satkerList}
          />
        </TabsContent>
        
        {/* Konten Tab untuk Inventaris Gudang Pusat */}
        <TabsContent value="gudang" className="rounded-lg border bg-white p-4 shadow-sm">
          <InventarisDataTable
            columns={gudangColumns}
            data={gudangData as HtDetails[]}
            filterColumn="kodeHT"
            filterPlaceholder="Cari Kode HT di Gudang..."
            satkerList={satkerList}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}