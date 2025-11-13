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
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Manajemen Inventaris HT</h1>
          <p className="text-xs text-slate-600 sm:text-sm">Kelola aset di gudang pusat dan pantau aset yang terdistribusi</p>
        </div>
        
        {/* Action Buttons - Responsive */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <ExportButton currentTab={activeTab} />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="sm:inline">Tambah HT</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Input Data Aset HT Baru</DialogTitle>
                <DialogDescription className="text-sm">
                  Masukkan detail HT. Pilih Satker jika ingin langsung didistribusikan.
                </DialogDescription>
              </DialogHeader>
              <form action={addHtBySuperAdmin}>
                <div className="grid grid-cols-1 gap-3 py-4 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber" className="text-sm">Serial Number</Label>
                    <Input id="serialNumber" name="serialNumber" required className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merk" className="text-sm">Merk HT</Label>
                    <Input id="merk" name="merk" required className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenis" className="text-sm">Jenis HT</Label>
                    <Input id="jenis" name="jenis" required className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tahunBuat" className="text-sm">Tahun Buat</Label>
                    <Input id="tahunBuat" name="tahunBuat" type="number" required className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tahunPeroleh" className="text-sm">Tahun Peroleh</Label>
                    <Input id="tahunPeroleh" name="tahunPeroleh" type="number" required className="text-sm" />
                  </div>
                  <div className="col-span-1 space-y-2 md:col-span-2">
                    <Label htmlFor="satkerId" className="text-sm">Penempatan (Opsional)</Label>
                    <Select name="satkerId" defaultValue="gudang">
                      <SelectTrigger className="text-sm">
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
                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="w-full sm:w-auto">Simpan Data HT</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs Section - Responsive */}
      <Tabs 
        defaultValue="gudang" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as 'gudang' | 'terdistribusi')}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1">
          <TabsTrigger value="gudang" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Inventaris Gudang Pusat</span>
            <span className="sm:hidden">Gudang</span>
            <span className="ml-1">({gudangData.length})</span>
          </TabsTrigger>
          <TabsTrigger value="terdistribusi" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Inventaris Terdistribusi</span>
            <span className="sm:hidden">Terdistribusi</span>
            <span className="ml-1">({terdistribusiData.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="gudang" className="mt-4 rounded-lg border bg-white p-2 shadow-sm sm:p-4">
          <InventarisDataTable
            columns={gudangColumns}
            data={gudangData}
            filterColumn="serialNumber"
            filterPlaceholder="Cari Serial Number..."
            satkerList={satkerList}
          />
        </TabsContent>
        
        <TabsContent value="terdistribusi" className="mt-4 rounded-lg border bg-white p-2 shadow-sm sm:p-4">
          <InventarisDataTable
            columns={terdistribusiColumns}
            data={terdistribusiData}
            filterColumn="serialNumber"
            filterPlaceholder="Cari Serial Number..."
            satkerList={satkerList}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
