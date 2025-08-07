'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateHtBySuperAdmin } from '@/app/dashboard/inventaris/actions';
import { toast } from 'sonner';
import { HTStatus } from '@prisma/client';

interface EditHtFormProps {
  isOpen: boolean;
  onClose: () => void;
  htData: {
    id: string;
    serialNumber: string;
    kodeHT: string;
    merk: string;
    jenis: string;
    tahunBuat: number;
    tahunPeroleh: number;
    status: HTStatus;
    catatanKondisi?: string | null;
    satkerId?: string | null;
  };
  satkerOptions: Array<{ id: string; nama: string }>;
}

export default function EditHtForm({ isOpen, onClose, htData, satkerOptions }: EditHtFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    serialNumber: htData.serialNumber,
    kodeHT: htData.kodeHT,
    merk: htData.merk,
    jenis: htData.jenis,
    tahunBuat: htData.tahunBuat.toString(),
    tahunPeroleh: htData.tahunPeroleh.toString(),
    status: htData.status,
    catatanKondisi: htData.catatanKondisi || '',
    satkerId: htData.satkerId || 'gudang',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('htId', htData.id);
    form.append('serialNumber', formData.serialNumber);
    form.append('kodeHT', formData.kodeHT);
    form.append('merk', formData.merk);
    form.append('jenis', formData.jenis);
    form.append('tahunBuat', formData.tahunBuat);
    form.append('tahunPeroleh', formData.tahunPeroleh);
    form.append('status', formData.status);
    form.append('catatanKondisi', formData.catatanKondisi);
    form.append('satkerId', formData.satkerId);

    startTransition(async () => {
      try {
        await updateHtBySuperAdmin(form);
        toast.success('Data HT berhasil diperbarui!');
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Gagal memperbarui data HT');
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data HT</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="Masukkan serial number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kodeHT">Kode HT *</Label>
              <Input
                id="kodeHT"
                value={formData.kodeHT}
                onChange={(e) => handleInputChange('kodeHT', e.target.value)}
                placeholder="Masukkan kode HT"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="merk">Merk *</Label>
              <Input
                id="merk"
                value={formData.merk}
                onChange={(e) => handleInputChange('merk', e.target.value)}
                placeholder="Masukkan merk HT"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis *</Label>
              <Input
                id="jenis"
                value={formData.jenis}
                onChange={(e) => handleInputChange('jenis', e.target.value)}
                placeholder="Masukkan jenis HT"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tahunBuat">Tahun Buat *</Label>
              <Input
                id="tahunBuat"
                type="number"
                value={formData.tahunBuat}
                onChange={(e) => handleInputChange('tahunBuat', e.target.value)}
                placeholder="2020"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tahunPeroleh">Tahun Peroleh *</Label>
              <Input
                id="tahunPeroleh"
                type="number"
                value={formData.tahunPeroleh}
                onChange={(e) => handleInputChange('tahunPeroleh', e.target.value)}
                placeholder="2020"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status Kondisi *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIK">Baik</SelectItem>
                  <SelectItem value="RUSAK_RINGAN">Rusak Ringan</SelectItem>
                  <SelectItem value="RUSAK_BERAT">Rusak Berat</SelectItem>
                  <SelectItem value="HILANG">Hilang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="satkerId">Penempatan</Label>
              <Select value={formData.satkerId} onValueChange={(value) => handleInputChange('satkerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih penempatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gudang">Gudang Pusat</SelectItem>
                  {satkerOptions.map((satker) => (
                    <SelectItem key={satker.id} value={satker.id}>
                      {satker.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="catatanKondisi">Catatan Kondisi</Label>
            <Textarea
              id="catatanKondisi"
              value={formData.catatanKondisi}
              onChange={(e) => handleInputChange('catatanKondisi', e.target.value)}
              placeholder="Masukkan catatan kondisi HT (opsional)"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
