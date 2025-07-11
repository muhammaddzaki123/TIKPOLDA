// app/satker-admin/personil/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { addPersonil } from './actions';
import { columns } from './columns';
import { PersonilDataTable } from './data-table';

const prisma = new PrismaClient();

async function getPersonilSatker(satkerId: string) {
  return await prisma.personil.findMany({
    where: { satkerId },
    orderBy: { nama: 'asc' },
  });
}

export default async function PersonilSatkerPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const personilData = await getPersonilSatker(satkerId);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Personil</h1>
          <p className="text-sm text-slate-600">Kelola semua data anggota di unit kerja Anda.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Tambah Personil</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Personil Baru</DialogTitle>
              <DialogDescription>Masukkan data lengkap untuk anggota baru di unit Anda.</DialogDescription>
            </DialogHeader>
            <form action={addPersonil}>
              <div className="py-4 space-y-4">
                <div className="space-y-2"><Label htmlFor="nama">Nama Lengkap</Label><Input id="nama" name="nama" required /></div>
                <div className="space-y-2"><Label htmlFor="nrp">NRP</Label><Input id="nrp" name="nrp" required /></div>
                <div className="space-y-2"><Label htmlFor="jabatan">Jabatan / Pangkat</Label><Input id="jabatan" name="jabatan" required /></div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan Data</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <PersonilDataTable columns={columns} data={personilData} />
      </div>
    </div>
  );
}
