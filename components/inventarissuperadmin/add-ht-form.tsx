// app/dashboard/inventaris/add-ht-form.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addHtBySuperAdmin } from '@/app/dashboard/inventaris/actions';
import type { Satker } from '@prisma/client';

interface AddHtFormProps {
  satkerList: Satker[];
}

export function AddHtForm({ satkerList }: AddHtFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Data Aset HT Baru</CardTitle>
        <CardDescription>
          Masukkan detail HT. Pilih Satker jika ingin langsung didistribusikan ke unit kerja.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addHtBySuperAdmin} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input id="serialNumber" name="serialNumber" required placeholder="Contoh: SN-ABC-123" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merk">Merk HT</Label>
            <Input id="merk" name="merk" required placeholder="Contoh: Motorola" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis HT</Label>
            <Input id="jenis" name="jenis" required placeholder="Contoh: APX 2000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahunBuat">Tahun Buat</Label>
            <Input id="tahunBuat" name="tahunBuat" type="number" required placeholder="Contoh: 2022" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahunPeroleh">Tahun Peroleh</Label>
            <Input id="tahunPeroleh" name="tahunPeroleh" type="number" required placeholder="Contoh: 2023" />
          </div>
          <div className="col-span-1 space-y-2 md:col-span-2">
            <Label htmlFor="satkerId">Penempatan (Opsional)</Label>
            <Select name="satkerId" defaultValue="gudang">
              <SelectTrigger>
                <SelectValue placeholder="Simpan di Gudang Pusat" />
              </SelectTrigger>
              <SelectContent>
                {/* FIX: Use a non-empty string for the default value */}
                <SelectItem value="gudang">Simpan di Gudang Pusat</SelectItem>
                {satkerList.map((satker) => (
                  <SelectItem key={satker.id} value={satker.id}>
                    {satker.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Simpan Data HT</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
