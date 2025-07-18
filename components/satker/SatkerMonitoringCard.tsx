'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, RadioTower, Search, BarChart3, Tag, ShieldCheck, ShieldAlert, Package, PackageOpen } from 'lucide-react';
import { Prisma, HTStatus } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// Tipe data diperbarui untuk menyertakan subSatker pada personil
type SatkerWithDetails = Prisma.SatkerGetPayload<{
  include: {
    personil: true;
    ht: {
      include: {
        peminjaman: {
          where: { tanggalKembali: null };
          include: { personil: true };
        };
      };
    };
    _count: {
      select: { personil: true; ht: true };
    };
  };
}>;

interface SatkerCardProps {
  satker: SatkerWithDetails;
}

// Komponen Card Statistik kecil untuk di dalam dialog
const StatBox = ({ title, value, icon: Icon, onClick, className }: { title: string, value: string | number, icon: React.ElementType, onClick?: () => void, className?: string }) => (
    <div 
      className={cn("flex items-center p-3 bg-slate-50 rounded-lg", className, onClick && "cursor-pointer transition-transform hover:scale-[1.02] hover:bg-slate-100")}
      onClick={onClick}
    >
        <Icon className="h-6 w-6 text-slate-500 mr-4" />
        <div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-xs text-slate-500 font-medium">{title}</div>
        </div>
    </div>
);


export function SatkerMonitoringCard({ satker }: SatkerCardProps) {
  // State untuk dialog utama
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // State untuk dialog rincian personil
  const [isPersonilDetailOpen, setIsPersonilDetailOpen] = useState(false);

  // State untuk filter aset
  const [merkFilter, setMerkFilter] = useState<string>('');
  const [kondisiFilter, setKondisiFilter] = useState<string>('');
  const [asetPenempatanFilter, setAsetPenempatanFilter] = useState<string>('');
  const [personilPenempatanFilter, setPersonilPenempatanFilter] = useState<string>('');

  // State untuk kontrol popover
  const [openMerk, setOpenMerk] = useState(false);
  const [openKondisi, setOpenKondisi] = useState(false);
  const [openAsetPenempatan, setOpenAsetPenempatan] = useState(false);
  const [openPersonilPenempatan, setOpenPersonilPenempatan] = useState(false);

  const htDipinjamCount = satker.ht.filter(h => h.peminjaman.length > 0).length;
  const htTersediaCount = satker._count.ht - htDipinjamCount;
  
  const statsByMerk = useMemo(() => {
    return satker.ht.reduce((acc, ht) => {
        acc[ht.merk] = (acc[ht.merk] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  }, [satker.ht]);

  const statsByKondisi = useMemo(() => {
    return satker.ht.reduce((acc, ht) => {
        acc[ht.status] = (acc[ht.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  }, [satker.ht]);

  const personilByPenempatan = useMemo(() => {
    const counts: Record<string, number> = {};
    satker.personil.forEach(p => {
        const penempatan = p.subSatker || satker.nama;
        counts[penempatan] = (counts[penempatan] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [satker.personil, satker.nama]);

  const penempatanOptions = useMemo(() => {
    const penempatanSet = new Set<string>();
    penempatanSet.add(satker.nama); 
    satker.personil.forEach(p => {
        if (p.subSatker) {
            penempatanSet.add(p.subSatker);
        }
    });
    return Array.from(penempatanSet).sort().map(p => ({ value: p, label: p }));
  }, [satker.personil, satker.nama]);

  const uniqueMerks = useMemo(() => Object.keys(statsByMerk).map(m => ({ value: m, label: m })), [statsByMerk]);
  const kondisiOptions = useMemo(() => Object.values(HTStatus).map(s => ({ value: s, label: s.replace('_', ' ') })), []);

  const filteredHts = useMemo(() => {
    return satker.ht.filter(ht => {
      const pemegang = ht.peminjaman[0]?.personil;
      const penempatan = pemegang?.subSatker || satker.nama;
      const merkMatch = !merkFilter || ht.merk === merkFilter;
      const kondisiMatch = !kondisiFilter || ht.status === kondisiFilter;
      const penempatanMatch = !asetPenempatanFilter || penempatan === asetPenempatanFilter;
      return merkMatch && kondisiMatch && penempatanMatch;
    });
  }, [satker.ht, satker.nama, merkFilter, kondisiFilter, asetPenempatanFilter]);

  const filteredPersonil = useMemo(() => {
      if (!personilPenempatanFilter) {
          return satker.personil;
      }
      return satker.personil.filter(p => {
          const penempatan = p.subSatker || satker.nama;
          return penempatan === personilPenempatanFilter;
      });
  }, [satker.personil, satker.nama, personilPenempatanFilter]);

  return (
    <>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{satker.nama}</CardTitle>
                <CardDescription>Kode: {satker.kode}</CardDescription>
              </div>
              <Badge variant="secondary">ID: {satker.id.substring(0, 10)}...</Badge>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center text-sm text-slate-600"><Users className="mr-2 h-4 w-4 text-cyan-600" /><span>{satker._count.personil} Personil</span></div>
              <div className="flex items-center text-sm text-slate-600"><RadioTower className="mr-2 h-4 w-4 text-indigo-600" /><span>{satker._count.ht} Unit HT</span></div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-end mt-4">
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full"><Search className="mr-2 h-4 w-4" />Lihat Detail & Statistik</Button>
            </DialogTrigger>
          </CardContent>
        </Card>

        {/* --- PERUBAHAN DI SINI --- */}
        <DialogContent className="max-w-full xl:max-w-7xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">Dashboard Satuan Kerja: {satker.nama}</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatBox title="Total Personil" value={satker._count.personil} icon={Users} onClick={() => setIsPersonilDetailOpen(true)} />
                  <StatBox title="Total HT Tersedia" value={htTersediaCount} icon={PackageOpen} />
                  <StatBox title="Total HT Dipinjam" value={htDipinjamCount} icon={Package} />
                  <StatBox title="Kondisi Baik" value={statsByKondisi.BAIK || 0} icon={ShieldCheck} />
                  <StatBox title="Kondisi Rusak/Hilang" value={(statsByKondisi.RUSAK_BERAT || 0) + (statsByKondisi.RUSAK_RINGAN || 0) + (statsByKondisi.HILANG || 0)} icon={ShieldAlert} />
              </div>
              <div className="pt-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center"><Tag className="mr-2 h-4 w-4"/>Stok Berdasarkan Merek</h4>
                  <div className="flex flex-wrap gap-3">
                      {Object.entries(statsByMerk).map(([merk, jumlah]) => (
                          <Badge key={merk} variant="secondary" className="text-base px-3 py-1">{merk}: <strong className="ml-1.5">{jumlah}</strong></Badge>
                      ))}
                  </div>
              </div>
          </div>

          <div className="flex-grow overflow-hidden px-6 pb-6">
              <Tabs defaultValue="aset" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="aset">Detail Aset HT ({filteredHts.length})</TabsTrigger>
                      <TabsTrigger value="personil">Daftar Personil ({filteredPersonil.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="aset" className="flex-grow flex flex-col h-[calc(100%-40px)] mt-2">
                    <div className="flex flex-wrap items-center gap-2 py-2">
                        <Combobox aptions={uniqueMerks} value={merkFilter} setValue={setMerkFilter} open={openMerk} setOpen={setOpenMerk} placeholder="Filter Merek..." />
                        <Combobox aptions={kondisiOptions} value={kondisiFilter} setValue={setKondisiFilter} open={openKondisi} setOpen={setOpenKondisi} placeholder="Filter Kondisi..." />
                        <Combobox aptions={penempatanOptions} value={asetPenempatanFilter} setValue={setAsetPenempatanFilter} open={openAsetPenempatan} setOpen={setOpenAsetPenempatan} placeholder="Filter Penempatan..." />
                    </div>
                    <div className="flex-grow overflow-y-auto pt-2 space-y-2 pr-2">
                        {filteredHts.length > 0 ? filteredHts.map((h) => {
                            const pemegang = h.peminjaman[0]?.personil;
                            const penempatan = pemegang?.subSatker || satker.nama;
                            return (
                            <div key={h.id} className="grid grid-cols-4 gap-4 items-center text-sm p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="col-span-2">
                                    <p className="font-semibold">{h.kodeHT} <span className="font-normal text-slate-600">({h.merk})</span></p>
                                    <p className="text-xs text-slate-500">Penempatan: {penempatan}</p>
                                </div>
                                <div className="col-span-2 flex justify-end items-center gap-2">
                                    <Badge variant={h.status !== 'BAIK' ? 'secondary' : 'outline'}>{h.status.replace('_', ' ')}</Badge>
                                    <Badge variant={pemegang ? 'destructive' : 'default'}>{pemegang ? `Dipinjam: ${pemegang.nama}` : 'Tersedia'}</Badge>
                                </div>
                            </div>
                            );
                        }) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Tidak ada aset yang cocok dengan filter.</div>
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="personil" className="flex-grow flex flex-col h-[calc(100%-40px)] mt-2">
                     <div className="py-2">
                        <Combobox aptions={penempatanOptions} value={personilPenempatanFilter} setValue={setPersonilPenempatanFilter} open={openPersonilPenempatan} setOpen={setOpenPersonilPenempatan} placeholder="Filter Penempatan..." />
                     </div>
                     <div className="flex-grow overflow-y-auto pt-2 pr-2">
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-slate-600">Nama Personil</th>
                                    <th className="p-3 text-left font-medium text-slate-600">NRP</th>
                                    <th className="p-3 text-left font-medium text-slate-600">Penempatan</th>
                                    <th className="p-3 text-left font-medium text-slate-600">Jabatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPersonil.length > 0 ? filteredPersonil.map((p) => (
                                <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-medium text-slate-800">{p.nama}</td>
                                    <td className="p-3 text-slate-500">{p.nrp}</td>
                                    <td className="p-3 text-slate-600">{p.subSatker || satker.nama}</td>
                                    <td className="p-3"><Badge variant="outline">{p.jabatan}</Badge></td>
                                </tr>
                                )) : (
                                <tr>
                                    <td colSpan={4} className="h-24 text-center text-muted-foreground">Tidak ada personil yang cocok dengan filter.</td>
                                </tr>
                                )}
                            </tbody>
                            </table>
                        </div>
                     </div>
                  </TabsContent>
              </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPersonilDetailOpen} onOpenChange={setIsPersonilDetailOpen}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Rincian Personil di {satker.nama}</DialogTitle>
                  <DialogDescription>
                      Berikut adalah rincian jumlah personil berdasarkan unit penempatan.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <div className="rounded-md border">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Penempatan</TableHead>
                                  <TableHead className="text-right">Jumlah Personil</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {personilByPenempatan.map((item) => (
                                  <TableRow key={item.name}>
                                      <TableCell className="font-medium">{item.name}</TableCell>
                                      <TableCell className="text-right font-bold">{item.count}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
    </>
  );
}

function Combobox({ aptions, value, setValue, open, setOpen, placeholder }: any) {
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full sm:w-[200px] justify-between">
                    {value ? aptions.find((opt: any) => opt.value === value)?.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command><CommandInput placeholder={placeholder} />
                    <CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem onSelect={() => { setValue(''); setOpen(false); }}>Semua</CommandItem>
                            {aptions.map((opt: any) => (
                                <CommandItem key={opt.value} value={opt.label} onSelect={() => { setValue(opt.value); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                                    {opt.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}