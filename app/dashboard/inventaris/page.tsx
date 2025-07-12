// app/dashboard/inventaris/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrismaClient, HTStatus } from '@prisma/client';
import { addHtBySuperAdmin } from './actions';
import { gudangColumns, terdistribusiColumns } from './columns';
import { InventarisDataTable } from '@/components/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HtDetails } from '@/types/custom';

const prisma = new PrismaClient();

async function getPageData() {
  const allHt = await prisma.hT.findMany({
    include: {
      satker: true,
      peminjaman: { where: { tanggalKembali: null }, include: { personil: true } },
      peminjamanOlehSatker: { where: { tanggalKembali: null } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const gudangData = allHt.filter(ht => !ht.satkerId);
  const terdistribusiData = allHt.filter(ht => !!ht.satkerId);
  
  const satkerList = await prisma.satker.findMany({ orderBy: { nama: 'asc' } });
  const merkList = await prisma.hT.groupBy({ by: ['merk'], orderBy: { merk: 'asc' } });
  const statusEnumValues = Object.values(HTStatus).map(s => ({ value: s, label: s.replace('_', ' ') }));

  return { 
    gudangData: gudangData as HtDetails[],
    terdistribusiData: terdistribusiData as HtDetails[],
    satkerList,
    merkOptions: merkList.map(item => ({ value: item.merk, label: item.merk })),
    statusOptions: statusEnumValues
  };
}

export default async function InventarisManagementPage() {
  const { gudangData, terdistribusiData, satkerList, merkOptions, statusOptions } = await getPageData();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Inventaris HT (Pusat)</h1>
          <p className="text-sm text-slate-600">Kelola aset di gudang pusat dan pantau aset yang terdistribusi.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Tambah HT Baru</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Input Data Aset HT Baru</DialogTitle>
              <DialogDescription>Masukkan detail HT. Pilih Satker jika ingin langsung didistribusikan.</DialogDescription>
            </DialogHeader>
            <form action={addHtBySuperAdmin}>
              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="serialNumber">Serial Number</Label><Input id="serialNumber" name="serialNumber" required /></div>
                <div className="space-y-2"><Label htmlFor="kodeHT">Kode HT</Label><Input id="kodeHT" name="kodeHT" required /></div>
                <div className="space-y-2"><Label htmlFor="merk">Merk HT</Label><Input id="merk" name="merk" required /></div>
                <div className="space-y-2"><Label htmlFor="jenis">Jenis HT</Label><Input id="jenis" name="jenis" required /></div>
                <div className="space-y-2"><Label htmlFor="tahunBuat">Tahun Buat</Label><Input id="tahunBuat" name="tahunBuat" type="number" required /></div>
                <div className="space-y-2"><Label htmlFor="tahunPeroleh">Tahun Peroleh</Label><Input id="tahunPeroleh" name="tahunPeroleh" type="number" required /></div>
                <div className="col-span-1 space-y-2 md:col-span-2">
                  <Label htmlFor="satkerId">Penempatan (Opsional)</Label>
                   <Select name="satkerId"><SelectTrigger><SelectValue placeholder="Simpan di Gudang Pusat" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Simpan di Gudang Pusat</SelectItem>
                      {satkerList.map(satker => (<SelectItem key={satker.id} value={satker.id}>{satker.nama}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button type="submit">Simpan Data HT</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="terdistribusi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="terdistribusi">Inventaris Terdistribusi ({terdistribusiData.length})</TabsTrigger>
          <TabsTrigger value="gudang">Inventaris Gudang Pusat ({gudangData.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="terdistribusi" className="rounded-lg border bg-white p-4 shadow-sm">
          <InventarisDataTable columns={terdistribusiColumns} data={terdistribusiData} satkerList={satkerList} merkOptions={merkOptions} statusOptions={statusOptions} />
        </TabsContent>
        <TabsContent value="gudang" className="rounded-lg border bg-white p-4 shadow-sm">
          <InventarisDataTable columns={gudangColumns} data={gudangData} satkerList={satkerList} merkOptions={merkOptions} statusOptions={statusOptions} isGudang={true}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
