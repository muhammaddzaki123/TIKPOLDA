// app/satker-admin/inventaris/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { addHtBySatker } from './actions';
import { columns } from './columns';
import { InventarisDataTable } from './data-table';
import { HtWithPeminjaman } from '@/types/custom';

const prisma = new PrismaClient();

async function getInventarisSatker(satkerId: string): Promise<HtWithPeminjaman[]> {
  const data = await prisma.hT.findMany({
    where: { satkerId },
    include: {
      peminjaman: {
        where: { tanggalKembali: null },
        include: { personil: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return data;
}

export default async function InventarisSatkerPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const inventarisData = await getInventarisSatker(satkerId);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Inventaris HT</h1>
          <p className="text-sm text-slate-600">Kelola semua aset HT di unit kerja Anda.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Tambah HT Baru</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Input Data Aset HT Baru</DialogTitle>
              <DialogDescription>Masukkan detail lengkap untuk perangkat HT baru di unit Anda.</DialogDescription>
            </DialogHeader>
            <form action={addHtBySatker}>
              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="serialNumber">Serial Number</Label><Input id="serialNumber" name="serialNumber" required /></div>
                <div className="space-y-2"><Label htmlFor="merk">Merk HT</Label><Input id="merk" name="merk" required /></div>
                <div className="space-y-2"><Label htmlFor="jenis">Jenis HT</Label><Input id="jenis" name="jenis" required /></div>
                <div className="space-y-2"><Label htmlFor="tahunBuat">Tahun Buat</Label><Input id="tahunBuat" name="tahunBuat" type="number" required /></div>
                <div className="space-y-2"><Label htmlFor="tahunPeroleh">Tahun Peroleh</Label><Input id="tahunPeroleh" name="tahunPeroleh" type="number" required /></div>
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
