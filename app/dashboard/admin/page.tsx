// app/dashboard/admin/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrismaClient, Role } from '@prisma/client';
import { addAdminSatker } from './actions';
import { AdminDataTable } from './data-table';
import { columns } from './columns';

const prisma = new PrismaClient();

async function getAdminData() {
  return await prisma.user.findMany({
    where: { role: Role.ADMIN_SATKER },
    include: { satker: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminManagementPage() {
  const adminData = await getAdminData();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Admin & Satker</h1>
          <p className="text-sm text-slate-600">Kelola semua akun admin dan Satuan Kerja yang mereka kelola.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Admin & Satker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Akun & Satker Baru</DialogTitle>
              <DialogDescription>Membuat akun admin baru akan sekaligus mendaftarkan unit Satker.</DialogDescription>
            </DialogHeader>
            <form action={addAdminSatker}>
              <div className="grid gap-4 py-4">
                <p className="font-semibold text-sm">Detail Satuan Kerja</p>
                <div className="space-y-2">
                  <Label htmlFor="kodeSatker">Kode Satker</Label>
                  <Input id="kodeSatker" name="kodeSatker" placeholder="Contoh: DITLANTAS" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaSatker">Nama Lengkap Satker</Label>
                  <Input id="namaSatker" name="namaSatker" placeholder="Contoh: Direktorat Lalu Lintas" required />
                </div>
                
                <p className="font-semibold text-sm pt-4 border-t mt-4">Detail Akun Admin</p>
                <div className="space-y-2">
                  <Label htmlFor="namaAdmin">Nama Lengkap Admin</Label>
                  <Input id="namaAdmin" name="namaAdmin" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Admin</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password Awal</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan & Buat Akun</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <AdminDataTable columns={columns} data={adminData} />
      </div>
    </div>
  );
}