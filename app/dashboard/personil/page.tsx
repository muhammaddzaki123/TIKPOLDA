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
  return data.filter(p => p.satker) as PersonilWithSatker[];
}

async function getSatkerList() {
    return await prisma.satker.findMany({
        orderBy: { nama: 'asc' }
    });
}

// --- FUNGSI BARU UNTUK MENGAMBIL DAFTAR PENEMPATAN ---
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
// --- AKHIR FUNGSI BARU ---

export default async function PersonilManagementPage() {
  const personilData = await getPersonilData();
  const satkerList = await getSatkerList();
  const penempatanList = await getPenempatanList(); // <-- Panggil fungsi baru

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Personil</h1>
        <p className="text-sm text-slate-600">
          Lihat seluruh personil dan kelola pemindahan tugas (mutasi) antar Satuan Kerja.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <PersonilDataTable 
            columns={columns} 
            data={personilData} 
            satkerList={satkerList}
            penempatanList={penempatanList} // <-- Kirim daftar penempatan ke komponen
        />
      </div>
    </div>
  );
}