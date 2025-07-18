// app/satker-admin/personil/page.tsx

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { columns, PersonilWithSatkerName } from './columns'; // <-- Import tipe baru
import { PersonilDataTable } from './data-table';

const prisma = new PrismaClient();

async function getPersonilSatker(satkerId: string) {
  const personil = await prisma.personil.findMany({
    where: { satkerId },
    orderBy: { nama: 'asc' },
  });
  return personil;
}

async function getSubSatkerList(satkerId: string) {
  const personilWithSubSatker = await prisma.personil.findMany({
    where: {
      satkerId,
      subSatker: {
        not: null
      }
    },
    select: {
      subSatker: true,
    },
    distinct: ['subSatker']
  });
  
  return personilWithSubSatker
    .map(p => p.subSatker!)
    .filter(Boolean)
    .sort();
}


export default async function PersonilSatkerPage() {
  const session = await getServerSession(authOptions);
  const satkerId = session?.user?.satkerId;
  const satkerName = session?.user?.satker?.nama; // <-- Ambil nama Satker utama

  if (!satkerId || !satkerName) {
    redirect('/login');
  }

  const personilData = await getPersonilSatker(satkerId);
  const subSatkerList = await getSubSatkerList(satkerId);

  // Tambahkan properti satkerName ke setiap objek personil
  const personilDataWithSatkerName: PersonilWithSatkerName[] = personilData.map(p => ({
    ...p,
    satkerName: satkerName,
  }));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Personil</h1>
          <p className="text-sm text-slate-600">Kelola semua data anggota di unit kerja Anda.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <PersonilDataTable
            columns={columns}
            data={personilDataWithSatkerName}
            initialSubSatkers={subSatkerList}
            satkerName={satkerName} // <-- Kirim nama Satker utama ke komponen tabel
        />
      </div>
    </div>
  );
}