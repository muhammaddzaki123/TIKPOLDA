export type Peminjaman = {
  id: string;
  kodeHT: string;
  namaPeminjam: string;
  nrpPeminjam: string;
  satker: string;
  tanggalPinjam: string;
  tanggalKembali: string | null; // null jika belum dikembalikan
  status: 'Dikembalikan' | 'Masih Dipinjam';
};

export const peminjamanData: Peminjaman[] = [
  { id: '1', kodeHT: 'HT-LTS-001', namaPeminjam: 'Asep Sunandar', nrpPeminjam: '85011234', satker: 'DITLANTAS', tanggalPinjam: '2024-06-01', tanggalKembali: '2024-06-03', status: 'Dikembalikan' },
  { id: '2', kodeHT: 'HT-BRM-002', namaPeminjam: 'Joko Widodo', nrpPeminjam: '88115678', satker: 'SATBRIMOB', tanggalPinjam: '2024-06-10', tanggalKembali: null, status: 'Masih Dipinjam' },
  { id: '3', kodeHT: 'HT-SMP-005', namaPeminjam: 'Budi Waseso', nrpPeminjam: '86054321', satker: 'DITSAMAPTA', tanggalPinjam: '2024-06-15', tanggalKembali: '2024-06-20', status: 'Dikembalikan' },
  { id: '4', kodeHT: 'HT-RES-002', namaPeminjam: 'Siti Nurbaya', nrpPeminjam: '90038765', satker: 'DITRESKRIMUM', tanggalPinjam: '2024-06-25', tanggalKembali: null, status: 'Masih Dipinjam' },
  { id: '5', kodeHT: 'HT-LTS-008', namaPeminjam: 'Agus Harimurti', nrpPeminjam: '89021122', satker: 'DITLANTAS', tanggalPinjam: '2024-07-01', tanggalKembali: null, status: 'Masih Dipinjam' },
  { id: '6', kodeHT: 'HT-PM-010', namaPeminjam: 'Dewi Sartika', nrpPeminjam: '87045544', satker: 'POLRES MATARAM', tanggalPinjam: '2024-07-02', tanggalKembali: '2024-07-03', status: 'Dikembalikan' },
];