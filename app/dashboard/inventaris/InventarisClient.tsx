// app/dashboard/inventaris/InventarisClient.tsx

'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addHtBySuperAdmin } from './actions';
import { gudangColumns, terdistribusiColumns } from './columns';
import { InventarisDataTable } from '@/components/inventarissuperadmin/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExportButton from '@/components/ExportButton';
import { HtDetails } from './columns';
import { Satker } from '@prisma/client';

interface InventarisClientProps {
  gudangData: HtDetails[];
  terdistribusiData: HtDetails[];
  satkerList: Satker[];
}

export default function InventarisClient({ 
  gudangData, 
  terdistribusiData, 
  satkerList 
}: InventarisClientProps) {
  const [activeTab, setActiveTab] = useState<'gudang' | 'terdistribusi'>('gudang');

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Inventaris HT (Pusat)</h1>
          <p className="text-sm text-slate-600">Kelola aset di gudang pusat dan pantau aset yang terdistribusi.</p>
        </div>
        
        <div className="flex gap-3">
          <ExportButton currentTab={activeTab} />
          
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
              <form action={addHtBySuperAdmin}>
                <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input id="serialNumber" name="serialNumber" required />
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
      </div>

      <Tabs 
        defaultValue="gudang" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as 'gudang' | 'terdistribusi')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gudang">Inventaris Gudang Pusat ({gudangData.length})</TabsTrigger>
          <TabsTrigger value="terdistribusi">Inventaris Terdistribusi ({terdistribusiData.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gudang" className="rounded-lg border bg-white p-4 shadow-sm">
          <InventarisDataTable
            columns={gudangColumns}
            data={gudangData}
            filterColumn="serialNumber"
            filterPlaceholder="Cari Serial Number di Gudang..."
            satkerList={satkerList}
          />
        </TabsContent>
        
        <TabsContent value="terdistribusi" className="rounded-lg border bg-white p-4 shadow-sm">
          <InventarisDataTable
            columns={terdistribusiColumns}
            data={terdistribusiData}
            filterColumn="serialNumber"
            filterPlaceholder="Cari Serial Number Terdistribusi..."
            satkerList={satkerList}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
