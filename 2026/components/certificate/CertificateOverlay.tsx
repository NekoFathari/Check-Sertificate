'use client';

import { Sertifikat, CertificateOverlayConfig } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CertificateOverlayProps {
  certificate: Sertifikat;
  config: CertificateOverlayConfig;
  scale?: number;
}

function getFieldValue(key: string, certificate: Sertifikat): string {
  switch (key) {
    case 'nama': return certificate.nama;
    case 'nomor_sertif': return certificate.nomor_sertif;
    case 'nama_acara': return certificate.nama_acara;
    case 'asal': return certificate.asal;
    case 'kab_kot': return certificate.kab_kot;
    case 'provinsi': return certificate.provinsi;
    case 'status': return certificate.status;
    case 'createdAt': return new Date(certificate.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    default: return '';
  }
}

export function CertificateOverlay({ certificate, config, scale = 1 }: CertificateOverlayProps) {
  if (!config.backgroundImage) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">Belum ada background yang diupload</p>
      </div>
    );
  }

  return (
    <div
      className={cn('relative mx-auto overflow-hidden')}
      style={{
        width: `${800 * scale}px`,
        aspectRatio: config.pageSize === 'f4' ? '1.571 / 1' : '1.414 / 1',
        transformOrigin: 'top left',
      }}
    >
      <img
        src={config.backgroundImage}
        alt="Certificate background"
        className="absolute inset-0 w-full h-full object-fill"
        draggable={false}
      />
      {config.fields.map((field) => (
        <div
          key={field.key}
          style={{
            position: 'absolute',
            left: `${field.xPercent}%`,
            top: `${field.yPercent}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${field.fontSize * scale}px`,
            color: field.color,
            textAlign: field.alignment,
            fontFamily: field.fontFamily === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
            fontWeight: 600,
            maxWidth: `${(field.maxWidth || 600) * scale}px`,
            width: `${(field.maxWidth || 600) * scale}px`,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {getFieldValue(field.key, certificate)}
        </div>
      ))}
    </div>
  );
}
