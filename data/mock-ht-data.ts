export type HT = {
  id: string;
  kodeHT: string;
  serialNumber: string;
  merk: string;
  jenis: string;
  tahunPeroleh: number;
  status: 'Tersedia' | 'Dipinjam' | 'Perbaikan';
  satker: string;
};

export const htData: HT[] = [
  { id: '1', kodeHT: 'HT-LTS-001', serialNumber: 'SN-ABC-111', merk: 'Motorola', jenis: 'APX 2000', tahunPeroleh: 2022, status: 'Dipinjam', satker: 'DITLANTAS' },
  { id: '2', kodeHT: 'HT-SMP-001', serialNumber: 'SN-ABC-222', merk: 'Motorola', jenis: 'APX 2000', tahunPeroleh: 2022, status: 'Tersedia', satker: 'DITSAMAPTA' },
  { id: '3', kodeHT: 'HT-RES-001', serialNumber: 'SN-DEF-333', merk: 'Hytera', jenis: 'PD788G', tahunPeroleh: 2021, status: 'Tersedia', satker: 'DITRESKRIMUM' },
  { id: '4', kodeHT: 'HT-LTS-002', serialNumber: 'SN-ABC-444', merk: 'Motorola', jenis: 'APX 2000', tahunPeroleh: 2022, status: 'Tersedia', satker: 'DITLANTAS' },
  { id: '5', kodeHT: 'HT-BRM-001', serialNumber: 'SN-GHI-555', merk: 'Aselsan', jenis: 'Cobra MT-975', tahunPeroleh: 2023, status: 'Perbaikan', satker: 'SATBRIMOB' },
  { id: '6', kodeHT: 'HT-BRM-002', serialNumber: 'SN-GHI-666', merk: 'Aselsan', jenis: 'Cobra MT-975', tahunPeroleh: 2023, status: 'Dipinjam', satker: 'SATBRIMOB' },
  { id: '7', kodeHT: 'HT-LTS-003', serialNumber: 'SN-JKL-777', merk: 'Motorola', jenis: 'XIR P8668i', tahunPeroleh: 2020, status: 'Tersedia', satker: 'DITLANTAS' },
];