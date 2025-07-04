export type Satker = {
  id: string;
  kode: string;
  nama: string;
  jumlahPersonil: number;
  jumlahHT: number;
};

export const satkerData: Satker[] = [
  { id: '1', kode: 'DITLANTAS', nama: 'Direktorat Lalu Lintas', jumlahPersonil: 150, jumlahHT: 75 },
  { id: '2', kode: 'DITSAMAPTA', nama: 'Direktorat Samapta', jumlahPersonil: 200, jumlahHT: 90 },
  { id: '3', kode: 'SATBRIMOB', nama: 'Satuan Brigade Mobile', jumlahPersonil: 250, jumlahHT: 120 },
  { id: '4', kode: 'DITRESKRIMUM', nama: 'Direktorat Reserse Kriminal Umum', jumlahPersonil: 120, jumlahHT: 60 },
  { id: '5', kode: 'POLRES MATARAM', nama: 'Kepolisian Resor Mataram', jumlahPersonil: 300, jumlahHT: 150 },
  { id: '6', kode: 'POLRES LOBAR', nama: 'Kepolisian Resor Lombok Barat', jumlahPersonil: 280, jumlahHT: 135 },
];