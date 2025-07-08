import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTDataTable } from '@/components/ht-data-table';
import { columns } from './columns';
import { addHT } from './actions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi untuk mengambil data inventaris dan menggabungkannya dengan info pemegang saat ini
async function getInventarisDisplayData() {
  const satkerId = 'clsrxzaf0000108l9bv4peclp'; // ID Satker sementara

  // 1. Ambil semua HT di Satker ini
  const allHT = await prisma.hT.findMany({
    where: { satkerId },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Ambil semua peminjaman aktif (belum dikembalikan) untuk HT di atas
  const activePeminjaman = await prisma.peminjaman.findMany({
    where: {
      htId: { in: allHT.map(ht => ht.id) },
      tanggalKembali: null, // Kunci: cari yang belum dikembalikan
    },
    include: {
      personil: true, // Sertakan data personil
    },
  });

  // 3. Buat peta (map) untuk memudahkan pencarian: htId -> data personil
  const pemegangMap = new Map();
  activePeminjaman.forEach(p => {
    pemegangMap.set(p.htId, p.personil);
  });

  // 4. Gabungkan data HT dengan data pemegangnya
  const displayData = allHT.map(ht => ({
    ...ht,
    pemegangSaatIni: pemegangMap.get(ht.id) || null,
  }));

  return displayData;
}

// Fungsi untuk mengambil data personil untuk dropdown form
async function getPersonil() {
  const data = await prisma.personil.findMany({
    where: { satkerId: 'clsrxzaf0000108l9bv4peclp' },
  });
  return data;
}

export default async function InventarisSatkerPage() {
  // Panggil fungsi untuk mendapatkan data asli dari database
  const inventarisData = await getInventarisDisplayData();
  const personilData = await getPersonil();

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
            <form action={addHT}>
              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">1. Serial Number</Label>
                  <Input id="serialNumber" name="serialNumber" placeholder="SN-ABC-123" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kodeHT">2. Kode HT</Label>
                  <Input id="kodeHT" name="kodeHT" placeholder="HT-LTS-015" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merkHT">3. Merk HT</Label>
                  <Input id="merkHT" name="merkHT" placeholder="Motorola" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenisHT">4. Jenis HT</Label>
                  <Input id="jenisHT" name="jenisHT" placeholder="APX 2000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunBuat">5. Tahun Buat</Label>
                  <Input id="tahunBuat" name="tahunBuat" type="number" placeholder="2023" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunPeroleh">6. Tahun Peroleh</Label>
                  <Input id="tahunPeroleh" name="tahunPeroleh" type="number" placeholder="2024" required />
                </div>
                <div className="col-span-1 space-y-2 md:col-span-2">
                  <Label htmlFor="pemegang">7. Pemegang Awal (Opsional)</Label>
                  <Select name="pemegangId" defaultValue="gudang">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Personil atau simpan di gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gudang">Simpan di Gudang (Tersedia)</SelectItem>
                      {personilData.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nama} - {p.nrp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Jika tidak ada pemegang, status HT akan menjadi TERSEDIA.</p>
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
        <HTDataTable columns={columns} data={inventarisData} />
      </div>
    </div>
  );
}