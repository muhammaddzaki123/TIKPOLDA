import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTDataTable } from '@/components/ht-data-table';
import { columns } from './columns';
import { addPersonil } from './actions'; // Import Server Action
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi untuk mengambil data asli dari database
async function getPersonil() {
  const data = await prisma.personil.findMany({
    // where: { satkerId: 'clsrxxxxxxxxx' } // Nanti difilter berdasarkan satker admin
  });
  return data;
}

export default async function PersonilManagementPage() {
  // Ganti mock data dengan data asli
  const personilData = await getPersonil();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Personil - DITLANTAS</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Personil Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Personil Baru</DialogTitle>
              <DialogDescription>
                Masukkan data personil baru untuk unit kerja Anda.
              </DialogDescription>
            </DialogHeader>
            {/* Form sekarang menggunakan Server Action */}
            <form action={addPersonil}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nrp">NRP</Label>
                  <Input id="nrp" name="nrp" placeholder="Contoh: 85011234" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input id="nama" name="nama" placeholder="Masukkan nama lengkap" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan / Pangkat</Label>
                  <Input id="jabatan" name="jabatan" placeholder="Contoh: BRIPKA" required />
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
        Kelola semua data personil yang terdaftar di unit kerja Anda.
      </p>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={personilData} />
      </div>
    </div>
  );
}