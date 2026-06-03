'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { formatFileSize, isValidFileType } from '@/lib/utils';
import { getAuthHeader } from '@/lib/auth';
import { toast } from 'sonner';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  onFileSelect?: (file: File) => void;
  onUploadSuccess?: () => void;
}

export function UploadArea({ onFileSelect, onUploadSuccess }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!isValidFileType(file.name)) {
      toast.error('Format file tidak didukung. Gunakan CSV atau XLSX.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Ukuran file terlalu besar. Maksimal ${formatFileSize(maxSize)}.`);
      return;
    }

    setSelectedFile(file);
    setShowPreview(true);
    onFileSelect?.(file);
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', 'upload');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message || 'Data berhasil diunggah');
        setShowSuccess(true);
        onUploadSuccess?.();
      } else {
        toast.error(json.message || 'Gagal mengunggah data');
        if (json.validationErrors?.length) {
          toast.error(`${json.validationErrors.length} baris error validasi`);
        }
      }
    } catch {
      toast.error('Gagal mengunggah data. Periksa koneksi.');
    } finally {
      setIsUploading(false);
      setShowPreview(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setShowSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Unggah Data Sertifikat</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              whileHover={{ scale: 1.005 }}
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer',
                isDragging
                  ? 'border-vibrant-primary bg-vibrant-primary/5 scale-[1.02]'
                  : 'border-border bg-muted/30 hover:border-vibrant-primary/50 hover:bg-vibrant-primary/[0.02]'
              )}
            >
              <motion.div
                animate={isDragging ? { y: [0, -8, 0] } : {}}
                transition={{ repeat: isDragging ? Infinity : 0, duration: 1.2 }}
              >
                <div className={cn(
                  'w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-colors',
                  isDragging ? 'bg-vibrant-primary/10' : 'bg-muted'
                )}>
                  <Upload className={cn(
                    'w-8 h-8 transition-colors',
                    isDragging ? 'text-vibrant-primary' : 'text-muted-foreground'
                  )} />
                </div>
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isDragging ? 'Lepaskan file di sini' : 'Seret file ke sini'}
              </h3>
              <p className="text-muted-foreground mb-5">atau</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-2 border-border hover:border-vibrant-primary/50 hover:bg-vibrant-primary/5"
              >
                Pilih File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground/70 mt-4">
                Format: CSV, XLSX | Maksimal 5 MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-border rounded-xl p-5 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-vibrant-primary/10 flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 text-vibrant-primary animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5 text-vibrant-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Import Berhasil
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    disabled={isUploading}
                    className="text-muted-foreground hover:text-vibrant-rose hover:bg-vibrant-rose/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {showPreview && selectedFile && (
        <PreviewModal
          file={selectedFile}
          onClose={() => setShowPreview(false)}
          onConfirm={handleUploadConfirm}
        />
      )}
    </>
  );
}
