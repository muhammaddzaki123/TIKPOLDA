// File: components/peminjaman/FormPeminjaman.tsx

'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPengajuanPeminjaman } from '@/app/satker-admin/pengajuan/actions';
import { toast } from 'sonner';

// --- Impor untuk Date Range Picker ---
import { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export function FormPeminjaman() {
  const [isPending, startTransition] = useTransition();
  
  // State untuk menyimpan rentang tanggal
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleSubmit = (formData: FormData) => {
    // Validasi rentang tanggal sebelum mengirim
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Rentang tanggal peminjaman wajib diisi.');
      return;
    }

    // Tambahkan tanggal ke FormData
    formData.append('tanggalMulai', dateRange.from.toISOString());
    formData.append('tanggalSelesai', dateRange.to.toISOString());

    const file = formData.get('file') as File;
    if (file && file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Ukuran file tidak boleh lebih dari 2MB.');
      return;
    }

    startTransition(async () => {
      try {
        await createPengajuanPeminjaman(formData);
        toast.success('Pengajuan peminjaman HT berhasil dikirim.');
        const form = document.getElementById('form-peminjaman') as HTMLFormElement;
        form.reset();
        setDateRange(undefined); // Reset state tanggal
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengajuan Peminjaman HT</CardTitle>
        <CardDescription>
          Ajukan permintaan untuk meminjam unit HT tambahan dari gudang pusat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-peminjaman" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keperluan">Keperluan Peminjaman</Label>
            <Textarea
              id="keperluan"
              name="keperluan"
              placeholder="Contoh: Untuk pengamanan kegiatan KTT Internasional..."
              required
            />
          </div>
          
          {/* --- INPUT DATE RANGE PICKER BARU --- */}
          <div className="space-y-2">
            <Label htmlFor="tanggal">Rentang Tanggal Peminjaman</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d LLL y", { locale: id })} -{" "}
                        {format(dateRange.to, "d LLL y", { locale: id })}
                      </>
                    ) : (
                      format(dateRange.from, "d LLL y", { locale: id })
                    )
                  ) : (
                    <span>Pilih tanggal mulai dan selesai</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah HT yang Dibutuhkan</Label>
            <Input
              id="jumlah"
              name="jumlah"
              type="number"
              min="1"
              placeholder="Masukkan jumlah unit"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Unggah Surat Permohonan (PDF)</Label>
            <Input id="file" name="file" type="file" accept=".pdf" />
            <p className="text-xs text-muted-foreground">Opsional. Ukuran file maksimal 2MB.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Mengirim...' : 'Kirim Pengajuan Peminjaman'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}