'use client';

import { Sertifikat, CertificateLayout } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Award, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CertificateTemplateCustomProps {
  certificate: Sertifikat;
  layout: CertificateLayout;
}

export function CertificateTemplateCustom({ certificate, layout }: CertificateTemplateCustomProps) {
  const isActive = certificate.status === 'Aktif';
  
  return (
    <div 
      className={cn(
        'relative mx-auto overflow-hidden',
        'w-full max-w-[800px]'
      )}
      data-certificate-canvas="true"
      data-paper={layout.paperSize || 'a4'}
      style={{
        fontFamily: layout.fontFamily === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
        background: `linear-gradient(135deg, ${layout.primaryColor}08 0%, #ffffff 50%, ${layout.primaryColor}05 100%)`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Vibrant Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: `linear-gradient(90deg, ${layout.primaryColor}, #10b981, #0ea5e9)` }}
      />

      {/* Decorative Circles */}
      <div 
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10"
        style={{ backgroundColor: layout.primaryColor }}
      />
      <div 
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
        style={{ backgroundColor: layout.primaryColor }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-12 py-10 text-center">
        
        {/* Header Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{ backgroundColor: `${layout.primaryColor}10` }}
        >
          <Sparkles className="w-4 h-4" style={{ color: layout.primaryColor }} />
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: layout.primaryColor }}>
            IGI JATIM
          </span>
        </div>

        {/* Title */}
        <div className={cn(
          'mb-6',
          layout.titlePosition.includes('center') ? 'text-center' : 
          layout.titlePosition.includes('left') ? 'text-left w-full' : 'text-right w-full'
        )}>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-900 mb-2">
            Sertifikat <span style={{ color: layout.primaryColor }}>Keprofesian</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Penghargaan atas dedikasi dalam dunia pendidikan</p>
        </div>

        {/* Star Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-slate-200" />
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Recipient */}
        <div className={cn(
          'mb-4 w-full',
          layout.namePosition === 'center' ? 'text-center' :
          layout.namePosition === 'left' ? 'text-left' : 'text-right'
        )}>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">Diberikan kepada:</p>
          <h2 
            className="text-5xl font-bold"
            style={{ 
              color: layout.primaryColor,
              textShadow: '0 2px 10px rgba(79, 70, 229, 0.15)'
            }}
          >
            {certificate.nama}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-600 mt-1 font-medium">{certificate.nama_acara}</p>
        </div>

        {/* Description */}
        <div className="max-w-md mx-auto mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-600 leading-relaxed">
            Telah berpartisipasi aktif dalam program pengembangan guru dan 
            tenaga kependidikan yang diselenggarakan oleh IGI JATIM 
            di wilayah {certificate.provinsi}.
          </p>
        </div>

        {/* Info Cards */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div 
            className="px-4 py-2.5 rounded-xl text-center"
            style={{ backgroundColor: `${layout.primaryColor}08` }}
          >
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Nomor</p>
            <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-900">{certificate.nomor_sertif}</p>
          </div>
          <div 
            className="px-4 py-2.5 rounded-xl text-center"
            style={{ backgroundColor: isActive ? '#10b98108' : '#f43f5e08' }}
          >
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className={cn('w-3.5 h-3.5', isActive ? 'text-emerald-500' : 'text-rose-500')} />
              <span className={cn('text-sm font-semibold', isActive ? 'text-emerald-600' : 'text-rose-600')}>
                {certificate.status}
              </span>
            </div>
          </div>
          <div 
            className="px-4 py-2.5 rounded-xl text-center"
            style={{ backgroundColor: '#0ea5e908' }}
          >
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">Wilayah</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-900">{certificate.kab_kot}</p>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          'flex items-end justify-between w-full mt-auto pt-4',
          layout.datePosition.includes('right') ? '' : 
          layout.datePosition.includes('center') ? 'justify-center gap-8' : 'justify-start'
        )}>
          <div className={cn(
            'text-center',
            layout.signaturePosition.includes('left') ? 'order-1' :
            layout.signaturePosition.includes('center') ? 'order-2' : 'order-3'
          )}>
            <div 
              className="w-28 h-12 border-b-2 mb-2 mx-auto"
              style={{ borderColor: layout.primaryColor }}
            />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-700">Ketua IGI JATIM</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">Tanda Tangan & Stempel</p>
          </div>

          {layout.showSeal && (
            <div className="order-2 flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                style={{ 
                  background: `linear-gradient(135deg, ${layout.primaryColor}, #0ea5e9)`,
                  boxShadow: `0 8px 20px -4px ${layout.primaryColor}40`
                }}
              >
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          )}

          <div className={cn(
            'text-center',
            layout.datePosition.includes('right') ? 'order-3' :
            layout.datePosition.includes('center') ? 'order-2' : 'order-1'
          )}>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Diterbitkan</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-700">
              {formatDate(certificate.createdAt)}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">{certificate.provinsi}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
