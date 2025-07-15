// app/dashboard/persetujuan/actions.ts

'use server';

import { PrismaClient, PengajuanStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getSuperAdminIdOrThrow() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Akses ditolak: Hanya Super Admin yang dapat melakukan aksi ini.');
  }
}

/**
 * Menyetujui pengajuan mutasi personil.
 */
export async function approveMutasi(pengajuanId: string) {
  await getSuperAdminIdOrThrow();

  try {
    await prisma.$transaction(async (tx) => {
      const pengajuan = await tx.pengajuanMutasi.findUnique({
        where: { id: pengajuanId },
        include: { personil: true }
      });

      if (!pengajuan || pengajuan.status !== 'PENDING') {
        throw new Error('Pengajuan tidak valid atau sudah diproses.');
      }
      
      const peminjamanAktif = await tx.peminjaman.count({
          where: { personilId: pengajuan.personilId, tanggalKembali: null }
      });
      
      if(peminjamanAktif > 0) {
          throw new Error(`Persetujuan gagal: Personil ${pengajuan.personil.nama} masih memiliki tanggungan HT yang belum dikembalikan.`);
      }

      await tx.personil.update({
        where: { id: pengajuan.personilId },
        data: { satkerId: pengajuan.satkerTujuanId },
      });

      await tx.pengajuanMutasi.update({
        where: { id: pengajuanId },
        data: { status: PengajuanStatus.APPROVED },
      });
    });
  } catch (error: any) {
    throw error;
  }

  revalidatePath('/dashboard/persetujuan');
  revalidatePath('/dashboard/personil');
  revalidatePath('/dashboard/satker');
}

/**
 * PEMBARUAN: Menyetujui pengajuan peminjaman HT dengan memilih unit spesifik.
 * @param pengajuanId ID dari pengajuan yang disetujui.
 * @param selectedHtIds Array dari string berisi ID HT yang dipilih untuk dipinjamkan.
 */
export async function approvePeminjaman(pengajuanId: string, selectedHtIds: string[]) {
    await getSuperAdminIdOrThrow();

    try {
        const pengajuan = await prisma.pengajuanPeminjaman.findUnique({
            where: { id: pengajuanId }
        });

        if (!pengajuan || pengajuan.status !== 'PENDING') {
            throw new Error('Pengajuan tidak valid atau sudah diproses.');
        }

        // Validasi baru: Pastikan jumlah HT yang dipilih sesuai dengan yang diajukan
        if (selectedHtIds.length !== pengajuan.jumlah) {
            throw new Error(`Jumlah HT yang dipilih (${selectedHtIds.length}) tidak sesuai dengan jumlah yang diajukan (${pengajuan.jumlah}).`);
        }
        
        if (selectedHtIds.length === 0) {
            throw new Error('Tidak ada HT yang dipilih untuk dipinjamkan.');
        }

        // Lakukan peminjaman dalam satu transaksi
        await prisma.$transaction(async (tx) => {
            // Update status pengajuan
            await tx.pengajuanPeminjaman.update({
                where: { id: pengajuanId },
                data: { status: PengajuanStatus.APPROVED }
            });

            // Pindahkan HT yang DIPILIH ke Satker pemohon & catat di PeminjamanSatker
            for (const htId of selectedHtIds) {
                // Pastikan HT yang dipilih memang ada dan tersedia di gudang
                const ht = await tx.hT.findFirst({
                    where: { id: htId, satkerId: null }
                });
                if (!ht) {
                    throw new Error(`HT dengan ID ${htId} tidak ditemukan atau sudah dialokasikan.`);
                }
                
                await tx.hT.update({
                    where: { id: htId },
                    data: { satkerId: pengajuan.satkerId }
                });
                await tx.peminjamanSatker.create({
                    data: {
                        htId: htId,
                        satkerId: pengajuan.satkerId,
                        catatan: `Disetujui dari pengajuan #${pengajuan.id.substring(0, 8)}`
                    }
                });
            }
        });

    } catch (error: any) {
        throw error;
    }
    
    revalidatePath('/dashboard/persetujuan');
    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
}

/**
 * Menolak pengajuan.
 */
export async function rejectPengajuan(formData: FormData) {
  await getSuperAdminIdOrThrow();
  const pengajuanId = formData.get('pengajuanId') as string;
  const tipe = formData.get('tipe') as 'mutasi' | 'peminjaman';
  const catatanAdmin = formData.get('catatanAdmin') as string;

  if (!pengajuanId || !tipe || !catatanAdmin) {
    throw new Error('Alasan penolakan wajib diisi.');
  }
  
  const model = tipe === 'mutasi' ? prisma.pengajuanMutasi : prisma.pengajuanPeminjaman;

  // @ts-ignore
  await model.update({
    where: { id: pengajuanId },
    data: {
      status: PengajuanStatus.REJECTED,
      catatanAdmin: catatanAdmin,
    },
  });

  revalidatePath('/dashboard/persetujuan');
}