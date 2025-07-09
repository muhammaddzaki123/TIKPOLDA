// app/dashboard/admin/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminDataTable } from './data-table';
import { columns } from './columns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrismaClient, Role } from '@prisma/client';
import { addAdminSatker } from './actions';
const prisma = new PrismaClient();

// Fungsi untuk mengambil data Admin Satker dari database
async function getAdminData() {
  const data = await prisma.user.findMany({
    where: {
      role: Role.ADMIN_SATKER, // Hanya ambil pengguna dengan role ADMIN_SATKER
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return data;
}

export default async function AdminManagementPage() {
  const adminData = await getAdminData();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Admin Satker</h1>
        
        {/* Dialog untuk Tambah Admin Baru */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Admin Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Akun Admin Satker</DialogTitle>
              <DialogDescription>
                Akun ini akan digunakan oleh admin di tingkat Satuan Kerja.
              </DialogDescription>
            </DialogHeader>
            
            {/* Formulir menggunakan Server Action */}
            <form action={addAdminSatker}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input id="nama" name="nama" placeholder="Masukkan nama admin" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="email@polda.ntb" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password Awal</Label>
                  <Input id="password" name="password" type="password" placeholder="Buat password sementara" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Buat Akun</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-600">
        Kelola akun untuk semua Admin di tingkat Satuan Kerja (Satker).
      </p>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {/* Menggunakan komponen data-table yang sudah dimodifikasi */}
        <AdminDataTable columns={columns} data={adminData} />
      </div>
    </div>
  );
}