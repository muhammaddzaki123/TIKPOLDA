// app/satker-admin/personil/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { columns, PersonilWithSatkerName } from './columns';
import { PersonilDataTable } from './data-table';

import { prisma } from '@/lib/prisma';

// Force dynamic rendering to avoid Prisma prepared statement conflicts during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const satkerName = session?.user?.satker?.nama; // Ambil nama Satker utama

  if (!satkerId || !satkerName) {
    redirect('/login');
  }

  const personilData = await getPersonilSatker(satkerId);
  const subSatkerList = await getSubSatkerList(satkerId);

  // Tambahkan properti satkerName ke setiap objek personil agar bisa diakses di kolom
  const personilDataWithSatkerName: PersonilWithSatkerName[] = personilData.map(p => ({
    ...p,
    satkerName: satkerName,
  }));

  return (
    <div className="w-full space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manajemen Personil</h1>
          <p className="text-sm text-slate-600 mt-1">Kelola semua data anggota di unit kerja Anda.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-2 md:p-4 shadow-sm">
        <PersonilDataTable 
            columns={columns} 
            data={personilDataWithSatkerName} 
            initialSubSatkers={subSatkerList} 
            satkerName={satkerName} // Kirim nama Satker utama ke komponen tabel
        />
      </div>
    </div>
  );
}