'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, RadioTower, Search, BarChart3, Tag, ShieldCheck, ShieldAlert, Package, PackageOpen } from 'lucide-react';
import { Prisma, HTStatus } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
const StatBox = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="flex items-center p-3 bg-slate-50 rounded-lg">
        <Icon className="h-6 w-6 text-slate-500 mr-4" />
        <div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-xs text-slate-500 font-medium">{title}</div>
        </div>
    </div>
);


export function SatkerMonitoringCard({ satker }: SatkerCardProps) {
  const [merkFilter, setMerkFilter] = useState<string>('');
  const [kondisiFilter, setKondisiFilter] = useState<string>('');
  const [statusPinjamFilter, setStatusPinjamFilter] = useState<string>('');
  const [openMerk, setOpenMerk] = useState(false);
  const [openKondisi, setOpenKondisi] = useState(false);
  const [openStatusPinjam, setOpenStatusPinjam] = useState(false);

  // --- KALKULASI STATISTIK ---
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


  const uniqueMerks = useMemo(() => Object.keys(statsByMerk).map(m => ({ value: m, label: m })), [statsByMerk]);
  const kondisiOptions = useMemo(() => Object.values(HTStatus).map(s => ({ value: s, label: s.replace('_', ' ') })), []);
  const statusPinjamOptions = [{ value: 'tersedia', label: 'Tersedia' }, { value: 'dipinjam', label: 'Dipinjam' }];

  const filteredHts = useMemo(() => {
    return satker.ht.filter(ht => {
      const isDipinjam = ht.peminjaman.length > 0;
      const merkMatch = !merkFilter || ht.merk === merkFilter;
      const kondisiMatch = !kondisiFilter || ht.status === kondisiFilter;
      const statusPinjamMatch = !statusPinjamFilter || (statusPinjamFilter === 'dipinjam' ? isDipinjam : !isDipinjam);
      return merkMatch && kondisiMatch && statusPinjamMatch;
    });
  }, [satker.ht, merkFilter, kondisiFilter, statusPinjamFilter]);

  return (
    <Dialog>
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

      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Dashboard Satuan Kerja: {satker.nama}</DialogTitle>
        </DialogHeader>
        
        {/* --- BAGIAN STATISTIK --- */}
        <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center"><BarChart3 className="mr-2 h-5 w-5"/> Ringkasan Aset HT</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <TabsTrigger value="personil">Daftar Personil ({satker.personil.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="aset" className="flex-grow flex flex-col h-[calc(100%-40px)] mt-2">
                    <div className="flex flex-wrap items-center gap-2 py-2">
                        <Combobox aptions={uniqueMerks} value={merkFilter} setValue={setMerkFilter} open={openMerk} setOpen={setOpenMerk} placeholder="Filter Merek..." />
                        <Combobox aptions={kondisiOptions} value={kondisiFilter} setValue={setKondisiFilter} open={openKondisi} setOpen={setOpenKondisi} placeholder="Filter Kondisi..." />
                        <Combobox aptions={statusPinjamOptions} value={statusPinjamFilter} setValue={setStatusPinjamFilter} open={openStatusPinjam} setOpen={setOpenStatusPinjam} placeholder="Filter Status Pinjam..." />
                    </div>
                    <div className="flex-grow overflow-y-auto pt-2 space-y-2 pr-2">
                        {filteredHts.map((h) => {
                            const pemegang = h.peminjaman[0]?.personil;
                            return (
                            <div key={h.id} className="grid grid-cols-4 gap-4 items-center text-sm p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="col-span-2">
                                    <p className="font-semibold">{h.kodeHT} <span className="font-normal text-slate-600">({h.merk})</span></p>
                                    <p className="text-xs text-slate-500">SN: {h.serialNumber}</p>
                                </div>
                                <div className="col-span-2 flex justify-end items-center gap-2">
                                    <Badge variant={h.status !== 'BAIK' ? 'secondary' : 'outline'}>{h.status.replace('_', ' ')}</Badge>
                                    <Badge variant={pemegang ? 'destructive' : 'default'}>{pemegang ? `Dipinjam: ${pemegang.nama}` : 'Tersedia'}</Badge>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="personil" className="flex-grow overflow-y-auto mt-2 pr-2">
                     <div className="space-y-2">
                        {satker.personil.map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-sm p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div><p className="font-semibold">{p.nama}</p><p className="text-xs text-slate-500">NRP: {p.nrp}</p></div>
                            <Badge variant="outline">{p.jabatan}</Badge>
                        </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
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