'use client';

import { CertificateLayout } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Layout, Type, Palette, Square, Stamp, FileText } from 'lucide-react';

interface CertificateLayoutSelectorProps {
  layout: CertificateLayout;
  onChange: (layout: CertificateLayout) => void;
}

export function CertificateLayoutSelector({ layout, onChange }: CertificateLayoutSelectorProps) {
  const updateLayout = (updates: Partial<CertificateLayout>) => {
    onChange({ ...layout, ...updates });
  };

  const positionOptions = [
    { value: 'top-left', label: 'Kiri Atas' },
    { value: 'top-center', label: 'Tengah Atas' },
    { value: 'top-right', label: 'Kanan Atas' },
    { value: 'center', label: 'Tengah' },
    { value: 'left', label: 'Kiri' },
    { value: 'right', label: 'Kanan' },
    { value: 'bottom-left', label: 'Kiri Bawah' },
    { value: 'bottom-center', label: 'Tengah Bawah' },
    { value: 'bottom-right', label: 'Kanan Bawah' },
  ];

  const colorOptions = [
    { value: '#4f46e5', label: 'Indigo' },
    { value: '#0ea5e9', label: 'Sky' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#f43f5e', label: 'Rose' },
    { value: '#8b5cf6', label: 'Violet' },
  ];

  const fontOptions = [
    { value: 'serif', label: 'Serif (Klasik)' },
    { value: 'sans-serif', label: 'Sans-serif (Modern)' },
  ];

  const paperOptions = [
    { value: 'a4', label: 'A4 (210×297mm)' },
    { value: 'f4', label: 'F4 (210×330mm)' },
  ];

  return (
    <Card className="border-slate-200/60 bg-slate-50/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-4 h-4 text-vibrant-primary" />
          <h4 className="text-sm font-semibold text-slate-900">Pengaturan Tata Letak</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Title Position */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Posisi Judul
            </Label>
            <select
              value={layout.titlePosition}
              onChange={(e) => updateLayout({ titlePosition: e.target.value as CertificateLayout['titlePosition'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >
              {positionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Name Position */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Posisi Nama
            </Label>
            <select
              value={layout.namePosition}
              onChange={(e) => updateLayout({ namePosition: e.target.value as CertificateLayout['namePosition'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >
              {['center', 'left', 'right'].map((pos) => (
                <option key={pos} value={pos}>
                  {pos === 'center' ? 'Tengah' : pos === 'left' ? 'Kiri' : 'Kanan'}
                </option>
              ))}
            </select>
          </div>

          {/* Number Position */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Posisi Nomor
            </Label>
            <select
              value={layout.numberPosition}
              onChange={(e) => updateLayout({ numberPosition: e.target.value as CertificateLayout['numberPosition'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >
              {positionOptions.filter(o => o.value.includes('bottom')).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Position */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Posisi Tanggal
            </Label>
            <select
              value={layout.datePosition}
              onChange={(e) => updateLayout({ datePosition: e.target.value as CertificateLayout['datePosition'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >
              {positionOptions.filter(o => o.value.includes('bottom')).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Signature Position */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Posisi Tanda Tangan
            </Label>
            <select
              value={layout.signaturePosition}
              onChange={(e) => updateLayout({ signaturePosition: e.target.value as CertificateLayout['signaturePosition'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >
              {positionOptions.filter(o => o.value.includes('bottom')).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Jenis Font
            </Label>
            <select
              value={layout.fontFamily}
              onChange={(e) => updateLayout({ fontFamily: e.target.value as CertificateLayout['fontFamily'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >

          {/* Paper Size */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              Ukuran Kertas
            </Label>
            <select
              value={layout.paperSize}
              onChange={(e) => updateLayout({ paperSize: e.target.value as CertificateLayout['paperSize'] })}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20 focus:border-vibrant-primary/50"
            >
              {paperOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
              {fontOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Color & Toggles */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-200">
          {/* Primary Color */}
          <div className="flex items-center gap-3">
            <Label className="text-xs text-slate-600 flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              Warna Utama:
            </Label>
            <div className="flex items-center gap-1.5">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateLayout({ primaryColor: color.value })}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-all',
                    layout.primaryColor === color.value
                      ? 'border-slate-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Show Border Toggle */}
          <button
            onClick={() => updateLayout({ showBorder: !layout.showBorder })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              layout.showBorder
                ? 'bg-vibrant-primary/10 text-vibrant-primary border-vibrant-primary/30'
                : 'bg-white text-slate-500 border-slate-200'
            )}
          >
            <Square className="w-3 h-3" />
            Border
          </button>

          {/* Show Seal Toggle */}
          <button
            onClick={() => updateLayout({ showSeal: !layout.showSeal })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              layout.showSeal
                ? 'bg-vibrant-primary/10 text-vibrant-primary border-vibrant-primary/30'
                : 'bg-white text-slate-500 border-slate-200'
            )}
          >
            <Stamp className="w-3 h-3" />
            Segel
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
