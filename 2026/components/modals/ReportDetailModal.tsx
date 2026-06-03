'use client';

import { useState } from 'react';
import { ReportItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock3, Mail, Hash, MessageSquare, AlertTriangle, CheckCircle2, RefreshCw, ImageUp } from 'lucide-react';
import { toast } from 'sonner';

interface ReportDetailModalProps {
  report: ReportItem;
  onClose: () => void;
  onStatusChange: (id: string, status: ReportItem['status']) => void;
}

const statusLabels: Record<ReportItem['status'], string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
};

function getBadgeVariant(status: ReportItem['status']) {
  if (status === 'resolved') return 'secondary';
  if (status === 'in-progress') return 'default';
  return 'destructive';
}

export function ReportDetailModal({ report, onClose, onStatusChange }: ReportDetailModalProps) {
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [showImage, setShowImage] = useState(false);

  const nextStatus = (): ReportItem['status'] => {
    if (currentStatus === 'open') return 'in-progress';
    if (currentStatus === 'in-progress') return 'resolved';
    return 'open';
  };

  const handleAdvance = () => {
    const next = nextStatus();
    setCurrentStatus(next);
    onStatusChange(report.id, next);
    toast.success(`Status laporan diubah ke ${statusLabels[next]}`);
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-vibrant-warning" />
              Detail Laporan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{report.name}</span>
              <Badge variant={getBadgeVariant(currentStatus) as any}>{statusLabels[currentStatus]}</Badge>
            </div>
            {report.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {report.email}
              </div>
            )}
            {report.nomor_sertif && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4 text-muted-foreground" />
                {report.nomor_sertif}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="w-4 h-4 text-muted-foreground" />
              {new Date(report.createdAt).toLocaleString('id-ID')}
            </div>
            <div className="rounded-xl bg-muted p-4 border border-border">
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-foreground">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Pesan
              </div>
              <p className="text-sm text-muted-foreground">{report.message}</p>
            </div>

            {/* Image Evidence */}
            {report.imageData && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border">
                  <ImageUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Bukti Gambar</span>
                </div>
                <img
                  src={report.imageData}
                  alt="Bukti laporan"
                  className="w-full max-h-64 object-contain bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowImage(true)}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
            <Button onClick={handleAdvance} className="gap-2">
              {currentStatus === 'open' ? (
                <><RefreshCw className="w-4 h-4" />Tandai Diproses</>
              ) : currentStatus === 'in-progress' ? (
                <><CheckCircle2 className="w-4 h-4" />Tandai Selesai</>
              ) : (
                <><RefreshCw className="w-4 h-4" />Buka Kembali</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {showImage && report.imageData && (
        <Dialog open={showImage} onOpenChange={() => setShowImage(false)}>
          <DialogContent className="max-w-4xl p-2">
            <img
              src={report.imageData}
              alt="Bukti laporan"
              className="w-full max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
