'use client';

import { useState, useCallback } from 'react';
import { CertificateLayout } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Type, FileText, Hash, Calendar, Pen, Stamp, Square, Palette } from 'lucide-react';

interface CertificateDesignerProps {
  layout: CertificateLayout;
  onChange: (layout: CertificateLayout) => void;
}

type ElementKey = 'title' | 'name' | 'number' | 'date' | 'signature';

interface ElementDef {
  key: ElementKey;
  label: string;
  icon: React.ElementType;
  color: string;
}

const ELEMENTS: ElementDef[] = [
  { key: 'title', label: 'Judul', icon: Type, color: '#4f46e5' },
  { key: 'name', label: 'Nama', icon: FileText, color: '#0ea5e9' },
  { key: 'number', label: 'Nomor', icon: Hash, color: '#10b981' },
  { key: 'date', label: 'Tanggal', icon: Calendar, color: '#f59e0b' },
  { key: 'signature', label: 'TTD', icon: Pen, color: '#f43f5e' },
];

const ZONE_LABELS: Record<string, string> = {
  'top-left': 'Atas Kiri', 'top-center': 'Atas Tengah', 'top-right': 'Atas Kanan',
  'left': 'Kiri', 'center': 'Tengah', 'right': 'Kanan',
  'bottom-left': 'Bawah Kiri', 'bottom-center': 'Bawah Tengah', 'bottom-right': 'Bawah Kanan',
};

const ROWS: string[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['left', 'center', 'right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

function getValidZones(key: ElementKey): string[] {
  switch (key) {
    case 'title': return ['top-left', 'top-center', 'top-right', 'center', 'left', 'right', 'bottom-left', 'bottom-center', 'bottom-right'];
    case 'name': return ['center', 'left', 'right'];
    case 'number': return ['bottom-left', 'bottom-center', 'bottom-right'];
    case 'date': return ['bottom-left', 'bottom-center', 'bottom-right'];
    case 'signature': return ['bottom-left', 'bottom-center', 'bottom-right'];
  }
}

function getElementPosition(layout: CertificateLayout, key: ElementKey): string {
  switch (key) {
    case 'title': return layout.titlePosition;
    case 'name': return layout.namePosition;
    case 'number': return layout.numberPosition;
    case 'date': return layout.datePosition;
    case 'signature': return layout.signaturePosition;
  }
}

function setElementPosition(layout: CertificateLayout, key: ElementKey, zone: string): CertificateLayout {
  switch (key) {
    case 'title': return { ...layout, titlePosition: zone as CertificateLayout['titlePosition'] };
    case 'name': return { ...layout, namePosition: zone as CertificateLayout['namePosition'] };
    case 'number': return { ...layout, numberPosition: zone as CertificateLayout['numberPosition'] };
    case 'date': return { ...layout, datePosition: zone as CertificateLayout['datePosition'] };
    case 'signature': return { ...layout, signaturePosition: zone as CertificateLayout['signaturePosition'] };
  }
}

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
  { value: 'a4', label: 'A4 (210x297mm)' },
  { value: 'f4', label: 'F4 (210x330mm)' },
];

export function CertificateDesigner({ layout, onChange }: CertificateDesignerProps) {
  const [dragElement, setDragElement] = useState<ElementKey | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  const handleDragStart = (key: ElementKey) => (e: React.DragEvent) => {
    setDragElement(key);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (zone: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragElement && getValidZones(dragElement).includes(zone)) {
      setDragOverZone(zone);
    }
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (zone: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverZone(null);
    const key = e.dataTransfer.getData('text/plain') as ElementKey;
    if (key && getValidZones(key).includes(zone)) {
      const currentPos = getElementPosition(layout, key);
      if (currentPos !== zone) {
        onChange(setElementPosition(layout, key, zone));
      }
    }
    setDragElement(null);
  };

  const handleDragEnd = () => {
    setDragElement(null);
    setDragOverZone(null);
  };

  const getElementsInZone = (zone: string): ElementDef[] => {
    return ELEMENTS.filter(el => getElementPosition(layout, el.key) === zone);
  };

  const isZoneValidForDrag = (zone: string): boolean => {
    if (!dragElement) return false;
    return getValidZones(dragElement).includes(zone);
  };

  return (
    <Card className="border-border bg-muted/30">
      <CardContent className="p-5 space-y-5">
        {/* Canvas Zone Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-vibrant-primary/10 flex items-center justify-center">
              <Pen className="w-3 h-3 text-vibrant-primary" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Drag & Drop Layout</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Seret elemen ke posisi yang diinginkan pada grid di bawah</p>

          <div className="grid grid-cols-3 gap-2">
            {ROWS.map((row, ri) =>
              row.map((zone) => {
                const elements = getElementsInZone(zone);
                const isValid = isZoneValidForDrag(zone);
                const isOver = dragOverZone === zone;

                return (
                  <div
                    key={zone}
                    onDragOver={handleDragOver(zone)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop(zone)}
                    className={cn(
                      'min-h-[80px] rounded-xl border-2 p-2 transition-all duration-150',
                      isOver && isValid
                        ? 'border-vibrant-primary bg-vibrant-primary/10 scale-[1.02]'
                        : isValid && dragElement
                          ? 'border-vibrant-primary/40 bg-vibrant-primary/5 cursor-copy'
                          : 'border-border bg-card',
                      'flex flex-col gap-1.5'
                    )}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {ZONE_LABELS[zone]}
                    </span>
                    {elements.map((el) => {
                      const isDragging = dragElement === el.key;
                      return (
                        <div
                          key={el.key}
                          draggable
                          onDragStart={handleDragStart(el.key)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing select-none transition-all',
                            isDragging ? 'opacity-40 scale-95' : 'opacity-100',
                            'hover:shadow-sm'
                          )}
                          style={{
                            backgroundColor: `${el.color}15`,
                            color: el.color,
                            border: `1px solid ${el.color}30`,
                          }}
                        >
                          <el.icon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{el.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Property Panel — bottom section */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                Warna Utama
              </Label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onChange({ ...layout, primaryColor: color.value })}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all',
                      layout.primaryColor === color.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Type className="w-3 h-3" />
                Font
              </Label>
              <select
                value={layout.fontFamily}
                onChange={(e) => onChange({ ...layout, fontFamily: e.target.value as CertificateLayout['fontFamily'] })}
                className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Paper Size */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Ukuran
              </Label>
              <select
                value={layout.paperSize}
                onChange={(e) => onChange({ ...layout, paperSize: e.target.value as CertificateLayout['paperSize'] })}
                className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20"
              >
                {paperOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Toggle</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => onChange({ ...layout, showBorder: !layout.showBorder })}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    layout.showBorder
                      ? 'bg-vibrant-primary/10 text-vibrant-primary border-vibrant-primary/30'
                      : 'bg-card text-muted-foreground border-border'
                  )}
                >
                  <Square className="w-3 h-3" />
                  Border
                </button>
                <button
                  onClick={() => onChange({ ...layout, showSeal: !layout.showSeal })}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    layout.showSeal
                      ? 'bg-vibrant-primary/10 text-vibrant-primary border-vibrant-primary/30'
                      : 'bg-card text-muted-foreground border-border'
                  )}
                >
                  <Stamp className="w-3 h-3" />
                  Segel
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
