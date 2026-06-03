'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { parseCSV } from '@/lib/utils';
import { Loader2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewModalProps {
  file: File;
  onClose: () => void;
  onConfirm: () => void;
}

export function PreviewModal({ file, onClose, onConfirm }: PreviewModalProps) {
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true);
        const data = await parseCSV(file);
        setPreviewData(data.slice(0, 5));
        setError('');
      } catch (err) {
        setError('Gagal membaca file. Pastikan format CSV/XLSX benar.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [file]);

  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col border-border/80 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-vibrant-primary to-vibrant-info p-6 text-white">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-white text-xl font-bold">
                  Preview Data
                </DialogTitle>
                <p className="text-white/80 text-sm">
                  {Math.min(5, previewData.length)} baris pertama dari {file.name}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <Loader2 className="w-8 h-8 animate-spin text-vibrant-primary mb-3" />
                <span className="text-muted-foreground font-medium">Memuat preview...</span>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <p className="text-destructive font-medium mb-1">{error}</p>
                <p className="text-sm text-muted-foreground">Pastikan file memiliki format yang benar</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Valid
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {previewData.length} baris siap diimport
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {columns.map((col) => (
                          <TableHead key={col} className="text-foreground font-semibold whitespace-nowrap">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, idx) => (
                        <TableRow key={idx} className="border-b border-border/50 hover:bg-muted/30">
                          {columns.map((col) => (
                            <TableCell key={`${idx}-${col}`} className="text-muted-foreground whitespace-nowrap">
                              {String(row[col] || '-')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-muted/50 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} className="border-border hover:bg-muted">
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !!error}
            className="bg-gradient-to-r from-vibrant-primary to-vibrant-info text-white hover:opacity-90 border-0 shadow-vibrant"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Konfirmasi Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
