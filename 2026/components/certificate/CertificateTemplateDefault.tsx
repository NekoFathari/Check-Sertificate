'use client';

import { Sertifikat, CertificateLayout } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Award, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CertificateTemplateDefaultProps {
  certificate: Sertifikat;
  layout: CertificateLayout;
}

export function CertificateTemplateDefault({ certificate, layout }: CertificateTemplateDefaultProps) {
  const isActive = certificate.status === 'Aktif';
  
  return (
    <div 
      className={cn(
        'relative bg-white dark:bg-white mx-auto overflow-hidden',
        'w-full max-w-[800px]'
      )}
      data-certificate-canvas="true"
      data-paper={layout.paperSize || 'a4'}
      style={{
        fontFamily: layout.fontFamily === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
        border: layout.showBorder ? `8px solid ${layout.primaryColor}` : 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${layout.primaryColor} 2px, transparent 2px),
                           radial-gradient(circle at 80% 50%, ${layout.primaryColor} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Corner Decorations */}
      {layout.showBorder && (
        <>
          <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4" style={{ borderColor: layout.primaryColor }} />
          <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4" style={{ borderColor: layout.primaryColor }} />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4" style={{ borderColor: layout.primaryColor }} />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4" style={{ borderColor: layout.primaryColor }} />
        </>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-12 py-8 text-center">
        
        {/* Header / Logo Area */}
        <div className={cn(
          'flex items-center gap-3 mb-6',
          layout.titlePosition.includes('center') ? 'justify-center' : 
          layout.titlePosition.includes('left') ? 'justify-start' : 'justify-end'
        )}>
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${layout.primaryColor}15` }}
          >
            <Shield className="w-7 h-7" style={{ color: layout.primaryColor }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: layout.primaryColor }}>
              IGI JATIM
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">Ikatan Guru Indonesia Jawa Timur</p>
          </div>
        </div>

        {/* Title */}
        <div className={cn(
          'mb-8',
          layout.titlePosition.includes('center') ? 'text-center' : 
          layout.titlePosition.includes('left') ? 'text-left w-full' : 'text-right w-full'
        )}>
          <h1 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-slate-900 mb-2">
            SERTIFIKAT
          </h1>
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ 
              backgroundColor: layout.primaryColor,
              marginLeft: layout.titlePosition.includes('left') ? 0 : 
                         layout.titlePosition.includes('right') ? 'auto' : undefined,
              marginRight: layout.titlePosition.includes('right') ? 0 : undefined,
            }}
          />
          <p className="text-sm text-slate-600 dark:text-slate-600 mt-2">Penghargaan Keprofesian</p>
        </div>

        {/* Recipient Name */}
        <div className={cn(
          'mb-4 w-full',
          layout.namePosition === 'center' ? 'text-center' :
          layout.namePosition === 'left' ? 'text-left' : 'text-right'
        )}>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">Diberikan kepada:</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-900" style={{ color: layout.primaryColor }}>
            {certificate.nama}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-600 mt-1 font-medium">{certificate.nama_acara}</p>
        </div>

        {/* Certificate Text */}
        <div className="max-w-lg mx-auto mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-600 leading-relaxed">
            Atas partisipasi dan kontribusi dalam kegiatan pengembangan kompetensi 
            yang diselenggarakan oleh IGI JATIM. Sertifikat ini diberikan sebagai 
            pengakuan atas dedikasi dan komitmen dalam meningkatkan kualitas 
            pendidikan di wilayah Jawa Timur.
          </p>
        </div>

        {/* Details Grid */}
        <div className={cn(
          'grid grid-cols-2 gap-8 w-full max-w-md mb-8',
          layout.numberPosition.includes('center') ? 'mx-auto' :
          layout.numberPosition.includes('left') ? 'mr-auto' : 'ml-auto'
        )}>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Nomor Sertifikat</p>
            <p className="text-lg font-mono font-bold text-slate-900 dark:text-slate-900">{certificate.nomor_sertif}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Status</p>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className={cn('w-4 h-4', isActive ? 'text-emerald-500' : 'text-rose-500')} />
              <span className={cn('text-sm font-semibold', isActive ? 'text-emerald-600' : 'text-rose-600')}>
                {certificate.status}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className={cn(
          'flex items-end justify-between w-full mt-auto pt-6 border-t border-slate-100',
          layout.datePosition.includes('right') ? '' : 
          layout.datePosition.includes('center') ? 'justify-center' : 'justify-start'
        )}>
          <div className={cn(
            'text-center',
            layout.signaturePosition.includes('left') ? 'order-1' :
            layout.signaturePosition.includes('center') ? 'order-2 mx-auto' : 'order-3'
          )}>
            <div className="w-32 h-16 border-b border-slate-300 dark:border-slate-300 mb-2 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-700">Ketua IGI JATIM</p>
          </div>

          <div className={cn(
            'text-center',
            layout.datePosition.includes('right') ? 'order-3' :
            layout.datePosition.includes('center') ? 'order-2 mx-auto' : 'order-1'
          )}>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Diterbitkan</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-700">
              {formatDate(certificate.createdAt)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{certificate.kab_kot}, {certificate.provinsi}</p>
          </div>
        </div>

        {/* Seal */}
        {layout.showSeal && (
          <div 
            className="absolute bottom-8 right-8 w-20 h-20 rounded-full border-4 flex items-center justify-center opacity-20"
            style={{ borderColor: layout.primaryColor }}
          >
            <Award className="w-8 h-8" style={{ color: layout.primaryColor }} />
          </div>
        )}
      </div>
    </div>
  );
}
