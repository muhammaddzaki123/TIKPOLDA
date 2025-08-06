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

export async function approvePeminjaman(pengajuanId: string, selectedHtIds: string[]) {
    await getSuperAdminIdOrThrow();

    try {
        const pengajuan = await prisma.pengajuanPeminjaman.findUnique({
            where: { id: pengajuanId }
        });

        if (!pengajuan || pengajuan.status !== 'PENDING') {
            throw new Error('Pengajuan tidak valid atau sudah diproses.');
        }

        if (selectedHtIds.length !== pengajuan.jumlah) {
            throw new Error(`Jumlah HT yang dipilih (${selectedHtIds.length}) tidak sesuai dengan jumlah yang diajukan (${pengajuan.jumlah}).`);
        }
        
        if (selectedHtIds.length === 0) {
            throw new Error('Tidak ada HT yang dipilih untuk dipinjamkan.');
        }

        await prisma.$transaction(async (tx) => {
            await tx.pengajuanPeminjaman.update({
                where: { id: pengajuanId },
                data: { status: PengajuanStatus.APPROVED }
            });

            for (const htId of selectedHtIds) {
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

export async function approvePengembalian(pengajuanId: string) {
  await getSuperAdminIdOrThrow();

  try {
    // Find the return request with its details
    const pengajuan = await prisma.pengajuanPengembalian.findUnique({
      where: { id: pengajuanId },
      include: {
        pengembalianDetails: {
          include: {
            ht: true
          }
        },
        satkerPengaju: true
      }
    });

    if (!pengajuan || pengajuan.status !== 'PENDING') {
      throw new Error('Pengajuan tidak valid atau sudah diproses.');
    }

    if (pengajuan.pengembalianDetails.length === 0) {
      throw new Error('Tidak ada HT yang terdaftar dalam pengajuan pengembalian ini.');
    }

    await prisma.$transaction(async (tx) => {
      // Update the main return request status to APPROVED
      await tx.pengajuanPengembalian.update({
        where: { id: pengajuanId },
        data: { 
          status: PengajuanStatus.APPROVED,
          updatedAt: new Date()
        },
      });

      // Process each HT in the return package
      for (const detail of pengajuan.pengembalianDetails) {
        // Find and update the active loan record
        const peminjamanAktif = await tx.peminjamanSatker.findFirst({
          where: { 
            htId: detail.htId, 
            tanggalKembali: null,
            satkerId: pengajuan.satkerId
          },
        });

        if (peminjamanAktif) {
          // Mark the loan as returned
          await tx.peminjamanSatker.update({
            where: { id: peminjamanAktif.id },
            data: { tanggalKembali: new Date() },
          });
        }

        // Return the HT to central warehouse
        await tx.hT.update({
          where: { id: detail.htId },
          data: { satkerId: null },
        });
      }
    });

    console.log(`Package return approved: ${pengajuan.pengembalianDetails.length} HT units returned to warehouse from ${pengajuan.satkerPengaju.nama}`);

  } catch (error: any) {
    console.error('Error approving return request:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan saat menyetujui pengajuan pengembalian.');
  }

  revalidatePath('/dashboard/persetujuan');
  revalidatePath('/dashboard/inventaris');
  revalidatePath('/dashboard/satker');
  revalidatePath('/satker-admin/pengajuan');
}

export async function rejectPengajuan(formData: FormData) {
  await getSuperAdminIdOrThrow();
  const pengajuanId = formData.get('pengajuanId') as string;
  const tipe = formData.get('tipe') as 'mutasi' | 'peminjaman' | 'pengembalian';
  const catatanAdmin = formData.get('catatanAdmin') as string;

  if (!pengajuanId || !tipe || !catatanAdmin) {
    throw new Error('Alasan penolakan wajib diisi.');
  }
  
  let model: any;
  switch (tipe) {
    case 'mutasi':
      model = prisma.pengajuanMutasi;
      break;
    case 'peminjaman':
      model = prisma.pengajuanPeminjaman;
      break;
    case 'pengembalian':
      model = prisma.pengajuanPengembalian;
      break;
    default:
      throw new Error('Tipe pengajuan tidak valid.');
  }

  await model.update({
    where: { id: pengajuanId },
    data: {
      status: PengajuanStatus.REJECTED,
      catatanAdmin: catatanAdmin,
    },
  });

  revalidatePath('/dashboard/persetujuan');
  revalidatePath('/satker-admin/pengajuan');
}

export async function updateTrackingStatus(pengajuanId: string, trackingStatus: string, notes?: string) {
  await getSuperAdminIdOrThrow();

  try {
    // Update catatan admin untuk tracking
    await prisma.pengajuanPeminjaman.update({
      where: { id: pengajuanId },
      data: {
        catatanAdmin: notes ? `[${trackingStatus}] ${notes}` : `Status: ${trackingStatus}`,
        updatedAt: new Date()
      }
    });

    // Jika status adalah RETURNED, kembalikan HT ke gudang
    if (trackingStatus === 'RETURNED') {
      const pengajuan = await prisma.pengajuanPeminjaman.findUnique({
        where: { id: pengajuanId }
      });

      if (pengajuan) {
        // Update semua peminjaman satker yang terkait
        await prisma.peminjamanSatker.updateMany({
          where: {
            satkerId: pengajuan.satkerId,
            catatan: { contains: pengajuan.id.substring(0, 8) },
            tanggalKembali: null
          },
          data: { tanggalKembali: new Date() }
        });

        // Kembalikan HT ke gudang pusat
        const peminjamanSatker = await prisma.peminjamanSatker.findMany({
          where: {
            satkerId: pengajuan.satkerId,
            catatan: { contains: pengajuan.id.substring(0, 8) }
          }
        });

        for (const peminjaman of peminjamanSatker) {
          await prisma.hT.update({
            where: { id: peminjaman.htId },
            data: { satkerId: null }
          });
        }
      }
    }

  } catch (error: any) {
    console.error('Error updating tracking status:', error);
    throw new Error('Gagal mengupdate status tracking.');
  }

  revalidatePath('/dashboard/persetujuan');
  revalidatePath('/satker-admin/pengajuan');
  revalidatePath('/dashboard/inventaris');
}
