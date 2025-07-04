export type AdminUser = {
  id: string;
  nama: string;
  email: string;
  role: 'Super Admin' | 'Admin Satker';
  satker: string; // Nama Satuan Kerja
};

export const adminData: AdminUser[] = [
  { id: '1', nama: 'Bambang P.', email: 'bambang@polda.ntb', role: 'Admin Satker', satker: 'DITLANTAS' },
  { id: '2', nama: 'Siti Aminah', email: 'siti.a@polda.ntb', role: 'Admin Satker', satker: 'DITSAMAPTA' },
  { id: '3', nama: 'Joko Susilo', email: 'joko.s@polda.ntb', role: 'Admin Satker', satker: 'SATBRIMOB' },
  { id: '4', nama: 'Dewi Lestari', email: 'dewi.l@polda.ntb', role: 'Admin Satker', satker: 'DITRESKRIMUM' },
  { id: '5', nama: 'Ahmad Yani', email: 'ahmad.y@polda.ntb', role: 'Admin Satker', satker: 'POLRES MATARAM' },
];