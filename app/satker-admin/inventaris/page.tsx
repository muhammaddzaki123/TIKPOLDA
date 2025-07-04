import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTDataTable } from '@/components/ht-data-table';
import { columns, InventarisHT } from './columns';
import { personilDitlantas } from '@/data/mock-personil-data'; 

// Data inventaris khusus untuk Satker ini
const inventarisSatker: InventarisHT[] = [
    { id: '1', kodeHT: 'HT-LTS-001', merk: 'Motorola', pemegang: 'Asep Sunandar', nrp: '85011234', status: 'Digunakan' },
    { id: '2', kodeHT: 'HT-LTS-002', merk: 'Motorola', pemegang: 'Di Gudang', nrp: '-', status: 'Di Gudang' },
    { id: '3', kodeHT: 'HT-LTS-003', merk: 'Hytera', pemegang: 'Agus Harimurti', nrp: '89021122', status: 'Digunakan' },
];

export default function InventarisSatkerPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventaris HT - DITLANTAS</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Input HT Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Input Data Aset HT Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail lengkap untuk perangkat HT baru yang terdaftar di unit Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">1. Serial Number</Label>
                <Input id="serialNumber" placeholder="SN-ABC-123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kodeHT">2. Kode HT</Label>
                <Input id="kodeHT" placeholder="HT-LTS-015" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="merkHT">3. Merk HT</Label>
                <Input id="merkHT" placeholder="Motorola" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenisHT">4. Jenis HT</Label>
                <Input id="jenisHT" placeholder="APX 2000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahunBuat">5. Tahun Buat</Label>
                <Input id="tahunBuat" type="number" placeholder="2023" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahunPeroleh">6. Tahun Peroleh</Label>
                <Input id="tahunPeroleh" type="number" placeholder="2024" />
              </div>
              <div className="col-span-1 space-y-2 md:col-span-2">
                <Label htmlFor="pemegang">7. Pemegang HT (Opsional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Personil atau simpan di gudang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gudang">Simpan di Gudang</SelectItem>
                    {personilDitlantas.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama} - {p.nrp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-xs text-slate-500">Jika pemegang tidak diisi, status HT akan menjadi "Di Gudang".</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Simpan Data HT</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={inventarisSatker} />
      </div>
    </div>
  );
}