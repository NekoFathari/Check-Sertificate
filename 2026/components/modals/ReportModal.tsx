'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FlagTriangleRight, Loader2, X, ImageUp } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  nomorSertif: string;
  found: boolean;
}

export function ReportModal({ open, onClose, nomorSertif, found }: ReportModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) {
      toast.error('Nama dan pesan harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          nomor_sertif: nomorSertif,
          message,
          category: found ? 'mismatch' : 'not-found',
          imageData: imagePreview,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Laporan berhasil dikirim');
        onClose();
        setName('');
        setEmail('');
        setMessage('');
        removeImage();
      } else {
        toast.error(json.message || 'Gagal mengirim laporan');
      }
    } catch {
      toast.error('Gagal mengirim laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlagTriangleRight className="w-5 h-5 text-vibrant-warning" />
            Kirim Laporan
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nama</label>
            <Input
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email (opsional)</label>
            <Input
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {nomorSertif && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nomor Sertifikat</label>
              <Input value={nomorSertif} disabled className="opacity-70" />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Pesan</label>
            <textarea
              placeholder={
                found
                  ? 'Jelaskan ketidaksesuaian data yang ditemukan...'
                  : 'Deskripsikan masalah yang Anda alami...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Upload Gambar (opsional)</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-contain bg-muted"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground hover:bg-background border border-border"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-vibrant-primary bg-vibrant-primary/5'
                    : 'border-border hover:border-vibrant-primary/50 hover:bg-muted/50'
                }`}
              >
                <ImageUp className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-medium">
                  Seret gambar ke sini atau klik untuk memilih
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  PNG, JPG, GIF maksimal 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
              ) : (
                <><FlagTriangleRight className="w-4 h-4 mr-2" />Kirim Laporan</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
