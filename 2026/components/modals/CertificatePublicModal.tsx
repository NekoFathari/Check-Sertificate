'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sertifikat, CertificateOverlayConfig, CertificateLayout } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CertificateOverlay } from '@/components/certificate/CertificateOverlay';
import { CertificateTemplateDefault } from '@/components/certificate/CertificateTemplateDefault';
import { Printer, Shield, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CertificatePublicModalProps {
  certificate: Sertifikat | null;
  open: boolean;
  onClose: () => void;
}

const defaultLayout: CertificateLayout = {
  titlePosition: 'top-center',
  namePosition: 'center',
  numberPosition: 'bottom-center',
  datePosition: 'bottom-right',
  signaturePosition: 'bottom-left',
  showBorder: true,
  showSeal: true,
  primaryColor: '#4f46e5',
  fontFamily: 'serif',
  paperSize: 'a4',
};

export function CertificatePublicModal({ certificate, open, onClose }: CertificatePublicModalProps) {
  const [overlayConfig, setOverlayConfig] = useState<CertificateOverlayConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificate || !open) {
      setOverlayConfig(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const saved = localStorage.getItem(`overlay-config-${certificate.nama_acara}`);
      if (saved) {
        const parsed = JSON.parse(saved) as CertificateOverlayConfig;
        setOverlayConfig(parsed);
      } else {
        setOverlayConfig(null);
      }
    } catch {
      setOverlayConfig(null);
    }
    setLoading(false);
  }, [certificate, open]);

  const useOverlay = overlayConfig && overlayConfig.backgroundImage && overlayConfig.fields.length > 0;

  const handlePrint = () => {
    const paperSize = overlayConfig?.pageSize === 'f4' ? 'F4 landscape' : 'A4 landscape';
    const style = document.createElement('style');
    style.id = 'print-cert-style';
    style.textContent = `
      @media print {
        @page { size: ${paperSize}; margin: 0; }
        html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
        body * { visibility: hidden; }
        #cert-print-area, #cert-print-area * { visibility: visible; }
        #cert-print-area {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
          transform: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
        }
        #cert-print-area > * { background: white !important; }
        [data-slot="dialog-overlay"], [data-slot="dialog-header"], [data-slot="dialog-footer"] { display: none !important; }
        [data-slot="dialog-content"] {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          max-height: none !important;
          transform: none !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: white !important;
        }
        #cert-template-fallback { transform: scale(1.2) !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => { const s = document.getElementById('print-cert-style'); if (s) s.remove(); }, 800);
  };

  if (!certificate) return null;

  const isActive = certificate.status === 'Aktif';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col" data-cert-public-modal="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-vibrant-primary" />
            Sertifikat — {certificate.nama}
          </DialogTitle>
        </DialogHeader>

        <div
          id="cert-print-area"
          className="flex-1 min-h-0 rounded-xl bg-muted/30 flex items-center justify-center overflow-auto p-4"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-vibrant-primary/30 border-t-vibrant-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Memuat sertifikat...</p>
            </div>
          ) : useOverlay ? (
            <div className="overflow-auto">
              <CertificateOverlay certificate={certificate} config={overlayConfig!} scale={0.7} />
            </div>
          ) : (
            <div id="cert-template-fallback" className="w-full max-w-[800px] mx-auto">
              <CertificateTemplateDefault certificate={certificate} layout={defaultLayout} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button onClick={handlePrint} className="bg-vibrant-primary text-white hover:opacity-90 border-0">
            <Printer className="w-4 h-4 mr-2" />
            Cetak / Save PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
