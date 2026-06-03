'use client';

import { useState, useEffect } from 'react';
import { Sertifikat, CertificateTemplate, CertificateLayout, CertificateOverlayConfig } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CertificateTemplateDefault } from './CertificateTemplateDefault';
import { CertificateTemplateCustom } from './CertificateTemplateCustom';
import { CertificateLayoutSelector } from './CertificateLayoutSelector';
import { CertificateDesigner } from './CertificateDesigner';
import { CertificateOverlay } from './CertificateOverlay';
import { OverlayEditor } from './OverlayEditor';
import { Layout, Palette, Eye, Pen, ImageUp, Maximize2, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const DEFAULT_TEMPLATE: CertificateTemplate = {
  id: 'default',
  name: 'Bawaan IGI',
  type: 'default',
  layout: {
    titlePosition: 'top-center',
    namePosition: 'center',
    numberPosition: 'bottom-center',
    datePosition: 'bottom-right',
    signaturePosition: 'bottom-left',
    showBorder: true,
    showSeal: true,
    primaryColor: '#1e3a5f',
    fontFamily: 'serif',
    paperSize: 'a4',
  },
};

interface CertificatePreviewProps {
  certificate: Sertifikat;
  samples?: Sertifikat[];
  onSampleChange?: (cert: Sertifikat) => void;
}

type PreviewMode = 'template' | 'overlay';
type TemplateType = 'default' | 'custom';

export function CertificatePreview({ certificate, samples, onSampleChange }: CertificatePreviewProps) {
  if (!certificate) return null;

  const [previewMode, setPreviewMode] = useState<PreviewMode>('template');
  const [templateType, setTemplateType] = useState<TemplateType>('default');
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(DEFAULT_TEMPLATE);
  const [layout, setLayout] = useState<CertificateLayout>({
    titlePosition: 'top-center',
    namePosition: 'center',
    numberPosition: 'bottom-center',
    datePosition: 'bottom-right',
    signaturePosition: 'bottom-left',
    showBorder: true,
    showSeal: true,
    primaryColor: '#1e3a5f',
    fontFamily: 'serif',
    paperSize: 'a4',
  });
  const [showLayoutControls, setShowLayoutControls] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editMode, setEditMode] = useState<'visual' | 'classic'>('classic');
  const [overlayConfig, setOverlayConfig] = useState<CertificateOverlayConfig>(() => {
    if (typeof localStorage === 'undefined') {
      return { id: String(Date.now()), name: certificate.nama_acara, eventName: certificate.nama_acara, backgroundImage: null, fields: [], pageSize: 'a4' };
    }
    const saved = localStorage.getItem(`overlay-config-${certificate.nama_acara}`);
    if (saved) return JSON.parse(saved) as CertificateOverlayConfig;
    return {
      id: String(Date.now()),
      name: certificate.nama_acara,
      eventName: certificate.nama_acara,
      backgroundImage: null,
      fields: [],
      pageSize: 'a4',
    } as CertificateOverlayConfig;
  });

  useEffect(() => {
    try { localStorage.setItem(`overlay-config-${overlayConfig.eventName || certificate.nama_acara}`, JSON.stringify(overlayConfig)); } catch {}
  }, [overlayConfig, certificate.nama_acara]);

  const handlePrint = () => {
    window.print();
  };

  const renderCertificateContent = () => {
    if (previewMode === 'template') {
      return templateType === 'default' ? (
        <CertificateTemplateDefault certificate={certificate} layout={layout} />
      ) : (
        <CertificateTemplateCustom certificate={certificate} layout={layout} />
      );
    }
    if (overlayConfig.backgroundImage) {
      return <CertificateOverlay certificate={certificate} config={overlayConfig} />;
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-vibrant-primary/10 flex items-center justify-center mx-auto mb-4">
          <ImageUp className="w-10 h-10 text-vibrant-primary" />
        </div>
        <h4 className="text-lg font-semibold text-foreground mb-2">Upload Background Sertifikat</h4>
        <p className="text-sm text-muted-foreground max-w-md">
          Upload gambar background melalui panel editor, lalu drag field ke posisi yang diinginkan
        </p>
      </div>
    );
  };

  const certContent = renderCertificateContent();

  return (
    <>
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-vibrant-primary" />
                Pratinjau Sertifikat
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {samples && samples.length > 1 ? (
                  <select
                    className="bg-transparent border-none text-sm text-muted-foreground focus:outline-none cursor-pointer hover:text-foreground transition-colors"
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      if (samples[idx] && onSampleChange) onSampleChange(samples[idx]);
                    }}
                    value={samples.findIndex((s) => s.id === certificate.id)}
                  >
                    {samples.map((s, i) => (
                      <option key={s.id} value={i}>{s.nama} — {s.nomor_sertif}</option>
                    ))}
                  </select>
                ) : (
                  <>{certificate.nama} — {certificate.nomor_sertif}</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(true)}
                className="border-border"
              >
                <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                Full Screen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-border"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print
              </Button>
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                <button
                  onClick={() => setPreviewMode('template')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    previewMode === 'template'
                      ? 'bg-card text-vibrant-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Template
                </button>
                <button
                  onClick={() => { setPreviewMode('overlay'); setShowLayoutControls(true); }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    previewMode === 'overlay'
                      ? 'bg-card text-vibrant-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {previewMode === 'template' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground font-medium">Desain:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTemplateType('default')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        templateType === 'default'
                          ? 'border-vibrant-primary text-vibrant-primary bg-vibrant-primary/5'
                          : 'border-border text-muted-foreground hover:border-border/80'
                      )}
                    >
                      Bawaan
                    </button>
                    <button
                      onClick={() => setTemplateType('custom')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        templateType === 'custom'
                          ? 'border-vibrant-primary text-vibrant-primary bg-vibrant-primary/5'
                          : 'border-border text-muted-foreground hover:border-border/80'
                      )}
                    >
                      Custom
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLayoutControls(!showLayoutControls)}
                      className="border-border"
                    >
                      <Layout className="w-3.5 h-3.5 mr-1.5" />
                      {showLayoutControls ? 'Sembunyikan' : 'Atur Layout'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence>
            {showLayoutControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {previewMode === 'overlay' ? (
                  <OverlayEditor certificate={certificate} config={overlayConfig} onChange={setOverlayConfig} />
                ) : (
                  <CertificateLayoutSelector layout={layout} onChange={setLayout} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-muted/30 rounded-xl p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${previewMode}-${templateType}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[900px]"
              >
                {certContent}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 print:bg-white print:static">
            <div className="absolute top-4 right-4 z-10 flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="bg-white hover:bg-gray-100"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(false)}
                className="bg-white hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-[95vw] max-w-[1100px] max-h-[95vh] overflow-auto rounded-xl bg-transparent flex items-center justify-center"
            >
              {certContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
