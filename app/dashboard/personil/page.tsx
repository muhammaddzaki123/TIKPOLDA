import { prisma } from '@/lib/prisma';
import { columns } from './columns';
import { PersonilDataTable } from './data-table';
import { PersonilWithSatker } from '@/types/custom';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  return data.filter(p => p.satker) as PersonilWithSatker[];
}

async function getSatkerList() {
    return await prisma.satker.findMany({
        orderBy: { nama: 'asc' }
    });
}

async function getPenempatanList() {
    const personilList = await prisma.personil.findMany({
        select: {
            subSatker: true,
            satker: {
                select: {
                    nama: true,
                },
            },
        },
    });

    const penempatanSet = new Set<string>();
    personilList.forEach(p => {
        if (p.subSatker) {
            penempatanSet.add(p.subSatker);
        } else if (p.satker) {
            penempatanSet.add(p.satker.nama);
        }
    });

    return Array.from(penempatanSet).sort();
}

export default async function PersonilManagementPage() {
  const personilData = await getPersonilData();
  const satkerList = await getSatkerList();
  const penempatanList = await getPenempatanList();

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold dark:text-slate-100">Manajemen Personil</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Lihat seluruh personil dan kelola pemindahan tugas (mutasi) antar Satuan Kerja.
        </p>
      </div>

      <div className="rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <PersonilDataTable 
            columns={columns} 
            data={personilData} 
            satkerList={satkerList}
            penempatanList={penempatanList}
        />
      </div>
    </div>
  );
}