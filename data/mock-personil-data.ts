export type Personil = {
  id: string;
  nrp: string;
  nama: string;
  jabatan: string;
};

// Contoh data personil untuk DITLANTAS
export const personilDitlantas: Personil[] = [
  { id: '1', nrp: '85011234', nama: 'Asep Sunandar', jabatan: 'BRIPKA' },
  { id: '2', nrp: '89021122', nama: 'Agus Harimurti', jabatan: 'AIPTU' },
  { id: '3', nrp: '86054321', nama: 'Budi Waseso', jabatan: 'BRIPDA' },
];