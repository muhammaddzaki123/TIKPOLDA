-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_SATKER');

-- CreateEnum
CREATE TYPE "HTStatus" AS ENUM ('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'HILANG');

-- CreateEnum
CREATE TYPE "PengajuanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('PENGAJUAN_DIKIRIM', 'SEDANG_DIPROSES', 'DISETUJUI', 'SIAP_DIAMBIL', 'SEDANG_DIGUNAKAN', 'PERMINTAAN_PENGEMBALIAN', 'SUDAH_DIKEMBALIKAN', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satkerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Satker" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Satker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personil" (
    "id" TEXT NOT NULL,
    "nrp" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "pangkat" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "subSatker" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satkerId" TEXT NOT NULL,

    CONSTRAINT "Personil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HT" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "merk" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "tahunBuat" INTEGER NOT NULL,
    "tahunPeroleh" INTEGER NOT NULL,
    "status" "HTStatus" NOT NULL DEFAULT 'BAIK',
    "catatanKondisi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satkerId" TEXT,

    CONSTRAINT "HT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peminjaman" (
    "id" TEXT NOT NULL,
    "tanggalPinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimasiKembali" TIMESTAMP(3),
    "tanggalKembali" TIMESTAMP(3),
    "kondisiSaatPinjam" TEXT NOT NULL,
    "kondisiSaatKembali" TEXT,
    "catatan" TEXT,
    "fileUrl" TEXT,
    "adminPencatatId" TEXT NOT NULL,
    "htId" TEXT NOT NULL,
    "personilId" TEXT NOT NULL,

    CONSTRAINT "Peminjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatPerpanjangan" (
    "id" TEXT NOT NULL,
    "peminjamanId" TEXT NOT NULL,
    "estimasiKembaliLama" TIMESTAMP(3),
    "estimasiKembaliBaru" TIMESTAMP(3) NOT NULL,
    "fileUrlLama" TEXT,
    "fileUrlBaru" TEXT,
    "catatan" TEXT,
    "adminPencatatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatPerpanjangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeminjamanSatker" (
    "id" TEXT NOT NULL,
    "tanggalPinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalKembali" TIMESTAMP(3),
    "catatan" TEXT,
    "htId" TEXT NOT NULL,
    "satkerId" TEXT NOT NULL,

    CONSTRAINT "PeminjamanSatker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengajuanPeminjaman" (
    "id" TEXT NOT NULL,
    "keperluan" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "jumlah" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "status" "PengajuanStatus" NOT NULL DEFAULT 'PENDING',
    "trackingStatus" "TrackingStatus" NOT NULL DEFAULT 'PENGAJUAN_DIKIRIM',
    "catatanAdmin" TEXT,
    "estimasiSelesai" TIMESTAMP(3),
    "tanggalPickup" TIMESTAMP(3),
    "tanggalReturn" TIMESTAMP(3),
    "tanggalDikirim" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "tanggalSedangProses" TIMESTAMP(3),
    "tanggalDisetujui" TIMESTAMP(3),
    "tanggalSiapDiambil" TIMESTAMP(3),
    "tanggalSedangDigunakan" TIMESTAMP(3),
    "tanggalPermintaanKembali" TIMESTAMP(3),
    "tanggalSudahDikembalikan" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satkerId" TEXT NOT NULL,

    CONSTRAINT "PengajuanPeminjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengajuanMutasi" (
    "id" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" "PengajuanStatus" NOT NULL DEFAULT 'PENDING',
    "catatanAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personilId" TEXT NOT NULL,
    "satkerAsalId" TEXT NOT NULL,
    "satkerTujuanId" TEXT NOT NULL,

    CONSTRAINT "PengajuanMutasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengajuanPengembalian" (
    "id" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "status" "PengajuanStatus" NOT NULL DEFAULT 'PENDING',
    "catatanAdmin" TEXT,
    "pengajuanPeminjamanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satkerId" TEXT NOT NULL,

    CONSTRAINT "PengajuanPengembalian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengembalianDetail" (
    "id" TEXT NOT NULL,
    "pengajuanPengembalianId" TEXT NOT NULL,
    "htId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PengembalianDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedId" TEXT,
    "satkerName" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_satkerId_key" ON "User"("satkerId");

-- CreateIndex
CREATE UNIQUE INDEX "Satker_kode_key" ON "Satker"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Personil_nrp_key" ON "Personil"("nrp");

-- CreateIndex
CREATE UNIQUE INDEX "HT_serialNumber_key" ON "HT"("serialNumber");

-- CreateIndex
CREATE INDEX "RiwayatPerpanjangan_peminjamanId_idx" ON "RiwayatPerpanjangan"("peminjamanId");

-- CreateIndex
CREATE INDEX "RiwayatPerpanjangan_createdAt_idx" ON "RiwayatPerpanjangan"("createdAt");

-- CreateIndex
CREATE INDEX "PengajuanPengembalian_satkerId_idx" ON "PengajuanPengembalian"("satkerId");

-- CreateIndex
CREATE INDEX "PengajuanPengembalian_pengajuanPeminjamanId_idx" ON "PengajuanPengembalian"("pengajuanPeminjamanId");

-- CreateIndex
CREATE INDEX "PengembalianDetail_pengajuanPengembalianId_idx" ON "PengembalianDetail"("pengajuanPengembalianId");

-- CreateIndex
CREATE INDEX "PengembalianDetail_htId_idx" ON "PengembalianDetail"("htId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_satkerId_fkey" FOREIGN KEY ("satkerId") REFERENCES "Satker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personil" ADD CONSTRAINT "Personil_satkerId_fkey" FOREIGN KEY ("satkerId") REFERENCES "Satker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HT" ADD CONSTRAINT "HT_satkerId_fkey" FOREIGN KEY ("satkerId") REFERENCES "Satker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Peminjaman" ADD CONSTRAINT "Peminjaman_htId_fkey" FOREIGN KEY ("htId") REFERENCES "HT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Peminjaman" ADD CONSTRAINT "Peminjaman_personilId_fkey" FOREIGN KEY ("personilId") REFERENCES "Personil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatPerpanjangan" ADD CONSTRAINT "RiwayatPerpanjangan_peminjamanId_fkey" FOREIGN KEY ("peminjamanId") REFERENCES "Peminjaman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeminjamanSatker" ADD CONSTRAINT "PeminjamanSatker_htId_fkey" FOREIGN KEY ("htId") REFERENCES "HT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeminjamanSatker" ADD CONSTRAINT "PeminjamanSatker_satkerId_fkey" FOREIGN KEY ("satkerId") REFERENCES "Satker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanPeminjaman" ADD CONSTRAINT "PengajuanPeminjaman_satkerId_fkey" FOREIGN KEY ("satkerId") REFERENCES "Satker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanMutasi" ADD CONSTRAINT "PengajuanMutasi_personilId_fkey" FOREIGN KEY ("personilId") REFERENCES "Personil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanMutasi" ADD CONSTRAINT "PengajuanMutasi_satkerAsalId_fkey" FOREIGN KEY ("satkerAsalId") REFERENCES "Satker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanMutasi" ADD CONSTRAINT "PengajuanMutasi_satkerTujuanId_fkey" FOREIGN KEY ("satkerTujuanId") REFERENCES "Satker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanPengembalian" ADD CONSTRAINT "PengajuanPengembalian_satkerId_fkey" FOREIGN KEY ("satkerId") REFERENCES "Satker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembalianDetail" ADD CONSTRAINT "PengembalianDetail_pengajuanPengembalianId_fkey" FOREIGN KEY ("pengajuanPengembalianId") REFERENCES "PengajuanPengembalian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembalianDetail" ADD CONSTRAINT "PengembalianDetail_htId_fkey" FOREIGN KEY ("htId") REFERENCES "HT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
