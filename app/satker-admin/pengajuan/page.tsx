// app/satker-admin/pengajuan/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { FormPeminjaman } from '@/components/peminjaman/FormPeminjaman';
import { FormMutasi } from '@/components/peminjaman/FormMutasi';

const prisma = new PrismaClient();

async function getData(satkerId: string) {
  // Ambil daftar personil dari satker yang sedang login
  const personilList = await prisma.personil.findMany({
    where: { satkerId },
    orderBy: { nama: 'asc' },
  });

  // Ambil daftar semua satker lain sebagai tujuan mutasi
  const satkerList = await prisma.satker.findMany({
    where: {
      id: { not: satkerId }, // Kecualikan satker saat ini
    },
    orderBy: { nama: 'asc' },
  });

  return { personilList, satkerList };
}

export default async function PengajuanPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;

  if (!satkerId) {
    redirect('/login');
  }

  const { personilList, satkerList } = await getData(satkerId);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pusat Pengajuan</h1>
        <p className="text-sm text-slate-600">
          Gunakan formulir di bawah ini untuk mengirimkan permintaan resmi kepada Super Admin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormPeminjaman />
        <FormMutasi personilList={personilList} satkerList={satkerList} />
      </div>

       {/* Di sini nanti kita bisa tambahkan tabel untuk melihat riwayat pengajuan */}
       <div className="mt-8 rounded-lg border bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-semibold">Riwayat Pengajuan Anda</h3>
          <div className="flex h-40 items-center justify-center rounded-md bg-slate-50 text-slate-400">
            Area untuk tabel riwayat pengajuan mendatang
          </div>
        </div>
    </div>
  );
}
