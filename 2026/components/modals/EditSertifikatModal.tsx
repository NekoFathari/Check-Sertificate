'use client';

import { useState, useEffect } from 'react';
import { Sertifikat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { getAuthHeader } from '@/lib/auth';

interface EditSertifikatModalProps {
  item: Sertifikat | null;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultForm = {
  nama: '',
  nama_acara: '',
  nomor_sertif: '',
  asal: '',
  kab_kot: '',
  provinsi: '',
  status: 'Aktif',
};

export function EditSertifikatModal({ item, onClose, onSuccess }: EditSertifikatModalProps) {
  const isCreate = !item;
  const [form, setForm] = useState<Partial<Sertifikat>>(() => {
    if (item) {
      return {
        nama: item.nama,
        nama_acara: item.nama_acara,
        nomor_sertif: item.nomor_sertif,
        asal: item.asal,
        kab_kot: item.kab_kot,
        provinsi: item.provinsi,
        status: item.status,
      };
    }
    return defaultForm;
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof Sertifikat, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isCreate ? '/api/sertifikat' : `/api/sertifikat/${item!.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        onSuccess();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? 'Tambah Sertifikat' : 'Edit Sertifikat'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              value={form.nama || ''}
              onChange={(e) => handleChange('nama', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nama_acara">Nama Acara</Label>
            <Input
              id="nama_acara"
              value={form.nama_acara || ''}
              onChange={(e) => handleChange('nama_acara', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomor_sertif">Nomor Sertifikat</Label>
            <Input
              id="nomor_sertif"
              value={form.nomor_sertif || ''}
              onChange={(e) => handleChange('nomor_sertif', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asal">Asal</Label>
            <Input
              id="asal"
              value={form.asal || ''}
              onChange={(e) => handleChange('asal', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kab_kot">Kab/Kot</Label>
              <Input
                id="kab_kot"
                value={form.kab_kot || ''}
                onChange={(e) => handleChange('kab_kot', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provinsi">Provinsi</Label>
              <Input
                id="provinsi"
                value={form.provinsi || ''}
                onChange={(e) => handleChange('provinsi', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status || 'Aktif'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreate ? 'Tambah' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
