// app/dashboard/personil/page.tsx

import { PrismaClient } from '@prisma/client';
import { columns } from './columns';
import { PersonilDataTable } from './data-table';
import { PersonilWithSatker } from '@/types/custom';

const prisma = new PrismaClient();

async function getPersonilData(): Promise<PersonilWithSatker[]> {
  const data = await prisma.personil.findMany({
    include: {
      satker: true,
    },
    orderBy: [
      { satker: { nama: 'asc' } },
      { nama: 'asc' },
    ],
  });
  // Pastikan satker tidak null untuk type safety
  return data.filter(p => p.satker) as PersonilWithSatker[];
}

async function getSatkerList() {
    return await prisma.satker.findMany({
        orderBy: { nama: 'asc' }
    });
}

export default async function PersonilManagementPage() {
  const personilData = await getPersonilData();
  const satkerList = await getSatkerList();

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Personil</h1>
        <p className="text-sm text-slate-600">
          Lihat seluruh personil dan kelola pemindahan tugas (mutasi) antar Satuan Kerja.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <PersonilDataTable columns={columns} data={personilData} satkerList={satkerList} />
      </div>
    </div>
  );
}