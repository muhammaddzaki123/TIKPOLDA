import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HTDataTable } from '@/components/ht-data-table';
// 1. Pastikan import ini benar
import { personilDitlantas } from '@/data/mock-personil-data'; 
import { columns } from './columns';

export default function PersonilManagementPage() {
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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nrp">NRP</Label>
                <Input id="nrp" placeholder="Contoh: 85011234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" placeholder="Masukkan nama lengkap" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan / Pangkat</Label>
                <Input id="jabatan" placeholder="Contoh: BRIPKA" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-600">
        Kelola semua data personil yang terdaftar di unit kerja Anda.
      </p>

      {/* Render komponen tabel data */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {/* 2. Pastikan Anda menggunakan variabel yang benar di sini */}
        <HTDataTable columns={columns} data={personilDitlantas} />
      </div>
    </div>
  );
}