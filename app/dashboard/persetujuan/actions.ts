'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
        where: { 
          personilId: pengajuan.personilId, 
          tanggalKembali: null 
        }
      });
      
      if (peminjamanAktif > 0) {
        throw new Error(`Persetujuan gagal: Personil ${pengajuan.personil.nama} masih memiliki tanggungan HT yang belum dikembalikan.`);
      }

      await tx.personil.update({
        where: { id: pengajuan.personilId },
        data: { satkerId: pengajuan.satkerTujuanId },
      });

      await tx.pengajuanMutasi.update({
        where: { id: pengajuanId },
        data: { status: 'APPROVED' },
      });
    });

    revalidatePath('/dashboard/persetujuan');
    revalidatePath('/dashboard/personil');
    revalidatePath('/dashboard/satker');
    revalidatePath('/satker-admin/pengajuan');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan yang tidak diketahui saat menyetujui mutasi.');
  }
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

    const currentTime = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.pengajuanPeminjaman.update({
        where: { id: pengajuanId },
        data: { 
          status: 'APPROVED',
          trackingStatus: 'DISETUJUI',
          tanggalDisetujui: currentTime
        }
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

    revalidatePath('/dashboard/persetujuan');
    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
    revalidatePath('/satker-admin/pengajuan');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error approving peminjaman:', error.message);
      throw error;
    }
    console.error('An unknown error occurred while approving peminjaman');
    throw new Error('Terjadi kesalahan yang tidak diketahui.');
  }
}

export async function approvePengembalian(pengajuanId: string) {
  await getSuperAdminIdOrThrow();

  try {
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

    const currentTime = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.pengajuanPengembalian.update({
        where: { id: pengajuanId },
        data: { 
          status: 'APPROVED',
          updatedAt: currentTime
        },
      });

      for (const detail of pengajuan.pengembalianDetails) {
        const peminjamanAktif = await tx.peminjamanSatker.findFirst({
          where: { 
            htId: detail.htId, 
            tanggalKembali: null,
            satkerId: pengajuan.satkerId
          },
        });

        if (peminjamanAktif) {
          await tx.peminjamanSatker.update({
            where: { id: peminjamanAktif.id },
            data: { tanggalKembali: currentTime },
          });
        }

        await tx.hT.update({
          where: { id: detail.htId },
          data: { satkerId: null },
        });
      }
    });

    console.log(`Package return approved: ${pengajuan.pengembalianDetails.length} HT units returned to warehouse from ${pengajuan.satkerPengaju.nama}`);

    revalidatePath('/dashboard/persetujuan');
    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
    revalidatePath('/satker-admin/pengajuan');
  } catch (error: unknown) {
    console.error('Error approving return request:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan saat menyetujui pengembalian.');
  }
}

export async function rejectPengajuan(formData: FormData) {
  await getSuperAdminIdOrThrow();
  
  const pengajuanId = formData.get('pengajuanId') as string;
  const tipe = formData.get('tipe') as 'mutasi' | 'peminjaman' | 'pengembalian';
  const catatanAdmin = formData.get('catatanAdmin') as string;

  if (!pengajuanId || !tipe || !catatanAdmin) {
    throw new Error('Alasan penolakan wajib diisi.');
  }

  try {
    if (tipe === 'pengembalian') {
      const pengajuanPengembalian = await prisma.pengajuanPengembalian.findUnique({
        where: { id: pengajuanId },
      });
      
      if (!pengajuanPengembalian) {
        throw new Error('Pengajuan pengembalian tidak ditemukan.');
      }

      if (!pengajuanPengembalian.pengajuanPeminjamanId) {
        throw new Error('Pengajuan peminjaman terkait tidak ditemukan.');
      }

      await prisma.$transaction([
        prisma.pengajuanPengembalian.update({
          where: { id: pengajuanId },
          data: {
            status: 'REJECTED',
            catatanAdmin: catatanAdmin,
          },
        }),
        prisma.pengajuanPeminjaman.update({
          where: { id: pengajuanPengembalian.pengajuanPeminjamanId },
          data: {
            trackingStatus: 'SEDANG_DIGUNAKAN',
            catatanAdmin: `Pengajuan pengembalian ditolak: ${catatanAdmin}`,
          },
        })
      ]);
    } else if (tipe === 'mutasi') {
      await prisma.pengajuanMutasi.update({
        where: { id: pengajuanId },
        data: {
          status: 'REJECTED',
          catatanAdmin: catatanAdmin,
        },
      });
    } else if (tipe === 'peminjaman') {
      await prisma.pengajuanPeminjaman.update({
        where: { id: pengajuanId },
        data: {
          status: 'REJECTED',
          catatanAdmin: catatanAdmin,
        },
      });
    } else {
      throw new Error('Tipe pengajuan tidak valid.');
    }

    revalidatePath('/dashboard/persetujuan');
    revalidatePath('/satker-admin/pengajuan');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan saat menolak pengajuan.');
  }
}

export async function updateTrackingStatus(pengajuanId: string, trackingStatus: string, notes?: string) {
  console.log('updateTrackingStatus called with:', { pengajuanId, trackingStatus, notes });
  
  try {
    await getSuperAdminIdOrThrow();
    console.log('Super admin authentication passed');

    const currentTime = new Date();
    
    const updateData: Record<string, string | Date> = {
      trackingStatus: trackingStatus,
      catatanAdmin: notes ? `[${trackingStatus}] ${notes}` : `Status: ${trackingStatus}`,
      updatedAt: currentTime
    };

    switch (trackingStatus) {
      case 'PENGAJUAN_DIKIRIM':
        updateData.tanggalDikirim = currentTime;
        break;
      case 'SEDANG_DIPROSES':
        updateData.tanggalSedangProses = currentTime;
        break;
      case 'DISETUJUI':
        updateData.tanggalDisetujui = currentTime;
        break;
      case 'SIAP_DIAMBIL':
        updateData.tanggalSiapDiambil = currentTime;
        break;
      case 'SEDANG_DIGUNAKAN':
        updateData.tanggalSedangDigunakan = currentTime;
        break;
      case 'PERMINTAAN_PENGEMBALIAN':
        updateData.tanggalPermintaanKembali = currentTime;
        break;
      case 'SUDAH_DIKEMBALIKAN':
        updateData.tanggalSudahDikembalikan = currentTime;
        break;
    }

    console.log('Updating pengajuan with data:', updateData);

    const updatedPengajuan = await prisma.pengajuanPeminjaman.update({
      where: { id: pengajuanId },
      data: updateData
    });

    console.log('Pengajuan updated successfully:', updatedPengajuan.id);

    if (trackingStatus === 'SUDAH_DIKEMBALIKAN') {
      console.log('Processing HT return to warehouse...');
      
      const pengajuan = await prisma.pengajuanPeminjaman.findUnique({
        where: { id: pengajuanId }
      });

      if (pengajuan) {
        console.log('Found pengajuan for HT return:', pengajuan.id);
        
        const updatedLoans = await prisma.peminjamanSatker.updateMany({
          where: {
            satkerId: pengajuan.satkerId,
            catatan: { contains: pengajuan.id.substring(0, 8) },
            tanggalKembali: null
          },
          data: { tanggalKembali: currentTime }
        });

        console.log('Updated loan records:', updatedLoans.count);

        const peminjamanSatker = await prisma.peminjamanSatker.findMany({
          where: {
            satkerId: pengajuan.satkerId,
            catatan: { contains: pengajuan.id.substring(0, 8) }
          }
        });

        console.log('Found peminjaman satker records:', peminjamanSatker.length);

        for (const peminjaman of peminjamanSatker) {
          await prisma.hT.update({
            where: { id: peminjaman.htId },
            data: { satkerId: null }
          });
          console.log('Returned HT to warehouse:', peminjaman.htId);
        }
      }
    }

    console.log('updateTrackingStatus completed successfully');

    revalidatePath('/dashboard/persetujuan');
    revalidatePath('/satker-admin/pengajuan');
    revalidatePath('/dashboard/inventaris');
    revalidatePath('/dashboard/satker');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating tracking status:', error.message);
      throw new Error(`Gagal mengupdate status tracking: ${error.message}`);
    }
    console.error('An unknown error occurred while updating tracking status');
    throw new Error('Terjadi kesalahan yang tidak diketahui saat mengupdate status tracking.');
  }
}
