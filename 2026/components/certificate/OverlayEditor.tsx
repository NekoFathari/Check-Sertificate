'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Sertifikat, CertificateOverlayConfig, OverlayTextField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ImageUp, X, Plus, Trash2, Move, AlignLeft, AlignCenter, AlignRight, Type, Palette, Save, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AVAILABLE_FIELDS = [
  { key: 'nama', label: 'Nama', defaultFontSize: 32, defaultColor: '#1a1a2e', defaultMaxWidth: 600 },
  { key: 'nomor_sertif', label: 'No. Sertifikat', defaultFontSize: 22, defaultColor: '#1a1a2e', defaultMaxWidth: 400 },
  { key: 'nama_acara', label: 'Acara', defaultFontSize: 26, defaultColor: '#1a1a2e', defaultMaxWidth: 700 },
  { key: 'asal', label: 'Asal', defaultFontSize: 20, defaultColor: '#1a1a2e', defaultMaxWidth: 400 },
  { key: 'kab_kot', label: 'Kab/Kota', defaultFontSize: 18, defaultColor: '#1a1a2e', defaultMaxWidth: 300 },
  { key: 'provinsi', label: 'Provinsi', defaultFontSize: 18, defaultColor: '#1a1a2e', defaultMaxWidth: 300 },
  { key: 'status', label: 'Status', defaultFontSize: 18, defaultColor: '#10b981', defaultMaxWidth: 200 },
  { key: 'createdAt', label: 'Tanggal', defaultFontSize: 18, defaultColor: '#1a1a2e', defaultMaxWidth: 400 },
];

const COLORS = ['#1a1a2e', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ffffff'];

function getFieldValue(key: string, certificate: Sertifikat | null): string {
  if (!certificate) return `{${key}}`;
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

interface OverlayEditorProps {
  certificate: Sertifikat | null;
  config: CertificateOverlayConfig;
  onChange: (config: CertificateOverlayConfig) => void;
}

export function OverlayEditor({ certificate, config, onChange }: OverlayEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [fieldPX, setFieldPX] = useState<Record<string, { x: number; y: number }>>({});
  const fieldPXRef = useRef<Record<string, { x: number; y: number }>>({});
  const [eventName, setEventName] = useState(config.eventName || '');
  const [dirty, setDirty] = useState(false);

  const syncPXFromConfig = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const px: Record<string, { x: number; y: number }> = {};
    config.fields.forEach((f) => {
      px[f.key] = { x: (f.xPercent / 100) * rect.width, y: (f.yPercent / 100) * rect.height };
    });
    fieldPXRef.current = px;
    setFieldPX(px);
  }, [config.fields]);

  useEffect(() => {
    syncPXFromConfig();
  }, [syncPXFromConfig]);

  useEffect(() => {
    const onResize = () => syncPXFromConfig();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [syncPXFromConfig]);

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    try {
      const key = `overlay-config-${eventName || 'default'}`;
      localStorage.setItem(key, JSON.stringify({ ...config, eventName }));
      setDirty(false);
      toast.success('Overlay config disimpan', { icon: <Save className="w-4 h-4 text-emerald-500" /> });
    } catch {
      toast.error('Gagal menyimpan');
    }
  };

  const handleChange = (newConfig: CertificateOverlayConfig) => {
    markDirty();
    onChange({ ...newConfig, eventName });
  };

  const updateField = (key: string, updates: Partial<OverlayTextField>) => {
    handleChange({
      ...config,
      fields: config.fields.map((f) => (f.key === key ? { ...f, ...updates } : f)),
    });
  };

  const updateFieldPX = (key: string, x: number, y: number, canvasRect: DOMRect) => {
    const xPct = Math.round(((x / canvasRect.width) * 100) * 10) / 10;
    const yPct = Math.round(((y / canvasRect.height) * 100) * 10) / 10;
    handleChange({
      ...config,
      fields: config.fields.map((f) =>
        f.key === key ? { ...f, xPercent: Math.max(0, Math.min(100, xPct)), yPercent: Math.max(0, Math.min(100, yPct)) } : f
      ),
    });
  };

  const addField = (fieldInfo: typeof AVAILABLE_FIELDS[0]) => {
    if (config.fields.some((f) => f.key === fieldInfo.key)) return;
    const newField: OverlayTextField = {
      key: fieldInfo.key, label: fieldInfo.label,
      xPercent: 50, yPercent: 50,
      fontSize: fieldInfo.defaultFontSize, color: fieldInfo.defaultColor,
      alignment: 'center', fontFamily: 'serif', maxWidth: fieldInfo.defaultMaxWidth,
    };
    handleChange({ ...config, fields: [...config.fields, newField] });
    setSelectedField(fieldInfo.key);
  };

  const removeField = (key: string) => {
    handleChange({ ...config, fields: config.fields.filter((f) => f.key !== key) });
    if (selectedField === key) setSelectedField(null);
  };

  const handleBackgroundUpload = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Maksimal 10MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => handleChange({ ...config, backgroundImage: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleBgDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingBg(false);
    const file = e.dataTransfer.files[0];
    if (file) handleBackgroundUpload(file);
  };

  const selectedFieldData = config.fields.find((f) => f.key === selectedField);

  return (
    <Card className="border-border bg-muted/30">
      <CardContent className="p-5 space-y-4">
        {/* Top toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={eventName}
              onChange={(e) => { setEventName(e.target.value); setDirty(true); }}
              placeholder="Nama acara/template..."
              className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-vibrant-primary/30 w-44"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-border">
            <ImageUp className="w-3.5 h-3.5 mr-1.5" /> Upload Background
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBackgroundUpload(f); }} />
          {config.backgroundImage && (
            <Button variant="ghost" size="sm" onClick={() => handleChange({ ...config, backgroundImage: null })} className="text-muted-foreground hover:text-destructive">
              <X className="w-3.5 h-3.5 mr-1.5" /> Hapus
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!eventName.trim()}
            className="bg-vibrant-primary text-white hover:opacity-90 border-0"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {dirty ? 'Simpan *' : 'Simpan'}
          </Button>
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {AVAILABLE_FIELDS.filter((af) => !config.fields.some((f) => f.key === af.key)).map((af) => (
              <Button key={af.key} variant="outline" size="sm" onClick={() => addField(af)} className="border-border text-xs h-7 px-2">
                <Plus className="w-3 h-3 mr-1" /> {af.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas */}
          <div className="lg:col-span-3">
            {config.backgroundImage ? (
              <div ref={canvasRef} className="relative mx-auto overflow-hidden rounded-xl border border-border bg-muted"
                style={{ width: '100%', aspectRatio: config.pageSize === 'f4' ? '1.571 / 1' : '1.414 / 1' }}>
                <img src={config.backgroundImage} alt="Background" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none" draggable={false} />
                {config.fields.map((field) => {
                  const px = fieldPX[field.key];
                  if (!px) return null;
                  return (
                    <div key={field.key} id={`overlay-field-${field.key}`}
                      style={{
                        position: 'absolute', left: px.x, top: px.y,
                        transform: 'translate(-50%, -50%)',
                        fontSize: field.fontSize, color: field.color,
                        textAlign: field.alignment,
                        fontFamily: field.fontFamily === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
                        fontWeight: 600, cursor: draggingField === field.key ? 'grabbing' : 'grab',
                        userSelect: 'none', padding: '2px 6px', borderRadius: 4,
                        border: selectedField === field.key ? `2px dashed ${field.color}` : '2px solid transparent',
                        backgroundColor: selectedField === field.key ? `${field.color}15` : 'transparent',
                        zIndex: selectedField === field.key ? 10 : 1,
                        maxWidth: field.maxWidth || 600,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                      onMouseDown={(e: React.MouseEvent) => {
                        if (e.button !== 0) return;
                        e.preventDefault();
                        setSelectedField(field.key);
                        setDraggingField(field.key);
                        const canvasRect = canvasRef.current?.getBoundingClientRect();
                        if (!canvasRect) return;
                        let lastX = e.clientX;
                        let lastY = e.clientY;
                        const handleMove = (ev: MouseEvent) => {
                          const dx = ev.clientX - lastX;
                          const dy = ev.clientY - lastY;
                          lastX = ev.clientX;
                          lastY = ev.clientY;
                          const cur = fieldPXRef.current[field.key];
                          if (!cur) return;
                          const newX = Math.max(0, Math.min(canvasRect.width, cur.x + dx));
                          const newY = Math.max(0, Math.min(canvasRect.height, cur.y + dy));
                          fieldPXRef.current = { ...fieldPXRef.current, [field.key]: { x: newX, y: newY } };
                          setFieldPX((prev) => ({ ...prev, [field.key]: { x: newX, y: newY } }));
                        };
                        const handleUp = () => {
                          window.removeEventListener('mousemove', handleMove);
                          window.removeEventListener('mouseup', handleUp);
                          setDraggingField(null);
                          const final = fieldPXRef.current[field.key];
                          if (final) updateFieldPX(field.key, final.x, final.y, canvasRect);
                        };
                        window.addEventListener('mousemove', handleMove);
                        window.addEventListener('mouseup', handleUp);
                      }}>
                      {getFieldValue(field.key, certificate)}
                    </div>
                  );
                })}
                {config.fields.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    Klik tombol + untuk menambahkan field, lalu drag ke posisi
                  </div>
                )}
              </div>
            ) : (
              <div onDragOver={(e) => { e.preventDefault(); setIsDraggingBg(true); }}
                onDragLeave={() => setIsDraggingBg(false)} onDrop={handleBgDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn('flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all',
                  isDraggingBg ? 'border-vibrant-primary bg-vibrant-primary/5' : 'border-border bg-muted/20 hover:border-vibrant-primary/50')}
                style={{ aspectRatio: config.pageSize === 'f4' ? '1.571 / 1' : '1.414 / 1' }}>
                <ImageUp className={cn('w-12 h-12 mb-3', isDraggingBg ? 'text-vibrant-primary' : 'text-muted-foreground')} />
                <p className="text-sm font-medium text-foreground mb-1">Upload Background Sertifikat</p>
                <p className="text-xs text-muted-foreground">Seret gambar atau klik untuk memilih</p>
              </div>
            )}
          </div>

          {/* Properties Panel */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-vibrant-primary" /> Properties
            </div>
            {selectedField && selectedFieldData ? (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-3 p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{selectedFieldData.label}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeField(selectedField)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Type className="w-3 h-3" /> Font</label>
                    <span className="text-[10px] text-muted-foreground font-mono">{selectedFieldData.fontSize}px</span>
                  </div>
                  <input type="range" min={8} max={80} value={selectedFieldData.fontSize}
                    onChange={(e) => updateField(selectedField, { fontSize: Number(e.target.value) })}
                    className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-vibrant-primary" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-muted-foreground">Max Width</label>
                    <span className="text-[10px] text-muted-foreground font-mono">{selectedFieldData.maxWidth || 600}px</span>
                  </div>
                  <input type="range" min={100} max={1200} step={50} value={selectedFieldData.maxWidth || 600}
                    onChange={(e) => updateField(selectedField, { maxWidth: Number(e.target.value) })}
                    className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-vibrant-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Palette className="w-3 h-3" /> Warna</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((color) => (
                      <button key={color} onClick={() => updateField(selectedField, { color })}
                        className={cn('w-6 h-6 rounded-full border-2 transition-all',
                          selectedFieldData.color === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105')}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground">Alignment</label>
                  <div className="flex gap-1">
                    {([{ v: 'left', i: AlignLeft }, { v: 'center', i: AlignCenter }, { v: 'right', i: AlignRight }] as const).map((a) => (
                      <button key={a.v} onClick={() => updateField(selectedField, { alignment: a.v })}
                        className={cn('flex-1 p-1.5 rounded-lg text-xs font-medium border transition-all',
                          selectedFieldData.alignment === a.v ? 'border-vibrant-primary bg-vibrant-primary/10 text-vibrant-primary' : 'border-border text-muted-foreground hover:bg-muted')}>
                        <a.i className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground">Font</label>
                  <select value={selectedFieldData.fontFamily}
                    onChange={(e) => updateField(selectedField, { fontFamily: e.target.value })}
                    className="w-full h-7 px-2 rounded-lg border border-border bg-background text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-vibrant-primary/30">
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans-serif</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground">X: {selectedFieldData.xPercent}% Y: {selectedFieldData.yPercent}%</p>
                </div>
              </motion.div>
            ) : (
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-center">
                <Move className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Klik field di canvas untuk edit</p>
              </div>
            )}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label className="text-[10px] text-muted-foreground">Ukuran Kertas</label>
              <select value={config.pageSize} onChange={(e) => handleChange({ ...config, pageSize: e.target.value as 'a4' | 'f4' })}
                className="w-full h-7 px-2 rounded-lg border border-border bg-card text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-vibrant-primary/30">
                <option value="a4">A4 Landscape</option>
                <option value="f4">F4 Landscape</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
