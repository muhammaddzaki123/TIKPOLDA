import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTDataTable } from '@/components/ht-data-table'; // Kita bisa pakai ulang komponen tabel dari inventaris
import { adminData } from '@/data/mock-admin-data';
import { columns } from './columns';

export default function AdminManagementPage() {
  // Daftar Satker untuk dropdown, bisa diambil dari database nanti
  const satkerOptions = ['DITLANTAS', 'DITSAMAPTA', 'SATBRIMOB', 'DITRESKRIMUM', 'POLRES MATARAM'];
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Akun Admin</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Admin Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Admin Satker Baru</DialogTitle>
              <DialogDescription>
                Buat akun baru untuk Admin Satuan Kerja. Password akan dibuat otomatis dan dikirimkan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">
                  Nama
                </Label>
                <Input id="nama" placeholder="Nama Lengkap" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="email@polda.ntb" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="satker" className="text-right">
                  Satker
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Satuan Kerja" />
                  </SelectTrigger>
                  <SelectContent>
                    {satkerOptions.map(satker => (
                      <SelectItem key={satker} value={satker}>{satker}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-600">
        Daftar semua akun yang memiliki hak akses sebagai Admin Satuan Kerja.
      </p>

      {/* Render komponen tabel data */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <HTDataTable columns={columns} data={adminData} />
      </div>
    </div>
  );
}