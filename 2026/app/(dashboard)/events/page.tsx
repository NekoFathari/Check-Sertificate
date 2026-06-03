'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CertificateOverlayConfig, Sertifikat } from '@/lib/types';
import { FadeIn } from '@/components/ui/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, ImageUp, Palette, ExternalLink, Search, Save, ChevronDown, ChevronUp, X, Check, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [bgImages, setBgImages] = useState<Record<string, string | null>>({});
  const [eventModes, setEventModes] = useState<Record<string, 'template' | 'overlay'>>({});
  const [saveStates, setSaveStates] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});

  const [allCerts, setAllCerts] = useState<Sertifikat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sertifikat');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAllCerts(json.data);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const events = useMemo(() => {
    const seen = new Set<string>();
    const unique: { eventName: string; count: number }[] = [];
    allCerts.forEach((s) => {
      if (!seen.has(s.nama_acara)) {
        seen.add(s.nama_acara);
        unique.push({ eventName: s.nama_acara, count: allCerts.filter((x) => x.nama_acara === s.nama_acara).length });
      }
    });
    return unique;
  }, [allCerts]);

  useEffect(() => {
    const modes: Record<string, 'template' | 'overlay'> = {};
    const bgs: Record<string, string | null> = {};
    events.forEach((ev) => {
      try {
        const saved = localStorage.getItem(`overlay-config-${ev.eventName}`);
        if (saved) {
          const config: CertificateOverlayConfig = JSON.parse(saved);
          modes[ev.eventName] = 'overlay';
          bgs[ev.eventName] = config.backgroundImage || null;
        } else {
          modes[ev.eventName] = 'template';
          bgs[ev.eventName] = null;
        }
      } catch {
        modes[ev.eventName] = 'template';
        bgs[ev.eventName] = null;
      }
    });
    setEventModes(modes);
    setBgImages(bgs);
  }, [events]);

  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter((e) => e.eventName.toLowerCase().includes(q));
  }, [events, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const handleModeChange = (eventName: string, mode: 'template' | 'overlay') => {
    setEventModes((prev) => ({ ...prev, [eventName]: mode }));
    if (mode === 'overlay') {
      setExpandedEvent(eventName === expandedEvent ? null : eventName);
      try {
        const saved = localStorage.getItem(`overlay-config-${eventName}`);
        if (saved) {
          const config = JSON.parse(saved);
          if (config.backgroundImage) {
            setBgImages((prev) => ({ ...prev, [eventName]: config.backgroundImage }));
          }
        }
      } catch {}
    } else {
      try {
        localStorage.removeItem(`overlay-config-${eventName}`);
      } catch {}
      setBgImages((prev) => ({ ...prev, [eventName]: null }));
      setSaveStates((prev) => ({ ...prev, [eventName]: 'idle' }));
      setExpandedEvent(null);
      toast.success('Beralih ke Template');
    }
  };

  const handleUploadBg = (eventName: string, file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Maksimal 10MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setBgImages((prev) => ({ ...prev, [eventName]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOverlay = (eventName: string) => {
    const bg = bgImages[eventName];
    if (!bg) { toast.error('Upload background dulu'); return; }
    setSaveStates((prev) => ({ ...prev, [eventName]: 'saving' }));
    try {
      const existing = (() => { try { const s = localStorage.getItem(`overlay-config-${eventName}`); return s ? JSON.parse(s) : null; } catch { return null; } })();
      const config: CertificateOverlayConfig = {
        id: existing?.id || String(Date.now()),
        name: eventName,
        eventName,
        backgroundImage: bg,
        fields: existing?.fields || [],
        pageSize: existing?.pageSize || 'a4',
      };
      localStorage.setItem(`overlay-config-${eventName}`, JSON.stringify(config));
      setSaveStates((prev) => ({ ...prev, [eventName]: 'saved' }));
      setEventModes((prev) => ({ ...prev, [eventName]: 'overlay' }));
      toast.success(`Overlay disimpan untuk "${eventName}"`);
      setTimeout(() => setSaveStates((prev) => ({ ...prev, [eventName]: 'idle' })), 2000);
    } catch {
      setSaveStates((prev) => ({ ...prev, [eventName]: 'idle' }));
      toast.error('Gagal menyimpan');
    }
  };

  const handleManage = (eventName: string) => {
    router.push(`/dashboard/sertifikat?event=${encodeURIComponent(eventName)}`);
  };

  const pages = useMemo(() => {
    const result: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (page > 3) result.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) result.push(i);
      if (page < totalPages - 2) result.push('...');
      result.push(totalPages);
    }
    return result;
  }, [totalPages, page]);

  return (
    <>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Event Templates</h2>
          <p className="text-sm text-muted-foreground">Atur template sertifikat untuk setiap acara</p>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari acara..."
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="font-mono">{filtered.length} acara</Badge>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-vibrant-primary" />
                Daftar Acara
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Acara</TableHead>
                    <TableHead className="text-foreground font-semibold">Jumlah</TableHead>
                    <TableHead className="text-foreground font-semibold">Mode</TableHead>
                    <TableHead className="text-foreground font-semibold w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((event) => {
                    const mode = eventModes[event.eventName] || 'template';
                    const isExpanded = expandedEvent === event.eventName && mode === 'overlay';
                    return (
                      <>
                        <TableRow key={event.eventName} className={cn('border-b border-border/50 hover:bg-muted/30', isExpanded && 'bg-muted/30')}>
                          <TableCell>
                            <p className="font-semibold text-foreground">{event.eventName}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">{event.count}</Badge>
                          </TableCell>
                          <TableCell>
                            <select
                              value={mode}
                              onChange={(e) => handleModeChange(event.eventName, e.target.value as 'template' | 'overlay')}
                              className="h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-vibrant-primary/30 cursor-pointer"
                            >
                              <option value="template">Template</option>
                              <option value="overlay">Overlay</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleManage(event.eventName)} className="border-border text-xs h-8" title="Kelola sertifikat">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              {mode === 'overlay' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedEvent(isExpanded ? null : event.eventName)}
                                  title={isExpanded ? 'Sembunyikan' : 'Edit overlay'}>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Overlay Config */}
                        {isExpanded && (
                          <TableRow className="border-b border-border/50 bg-muted/20">
                            <TableCell colSpan={4} className="p-4">
                              <div className="flex flex-col sm:flex-row items-start gap-4">
                                {/* Upload Area */}
                                <div className="flex-shrink-0">
                                  {bgImages[event.eventName] ? (
                                    <div className="relative group">
                                      <img
                                        src={bgImages[event.eventName]!}
                                        alt="Preview"
                                        className="w-48 h-32 object-cover rounded-lg border border-border"
                                      />
                                      <button
                                        onClick={() => {
                                          setBgImages((prev) => ({ ...prev, [event.eventName]: null }));
                                          setSaveStates((prev) => ({ ...prev, [event.eventName]: 'idle' }));
                                        }}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => {
                                          const f = (e.target as HTMLInputElement).files?.[0];
                                          if (f) handleUploadBg(event.eventName, f);
                                        };
                                        input.click();
                                      }}
                                      className="w-48 h-32 rounded-lg border-2 border-dashed border-border hover:border-vibrant-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-vibrant-primary transition-colors cursor-pointer bg-muted/30"
                                    >
                                      <Upload className="w-6 h-6" />
                                      <span className="text-xs">Upload Background</span>
                                    </button>
                                  )}
                                </div>

                                {/* Info + Save */}
                                <div className="flex-1 space-y-2">
                                  <p className="text-xs text-muted-foreground">
                                    Background gambar tersimpan. Gunakan <strong className="text-foreground">Kelola Sertifikat</strong> ↗ untuk mengatur posisi teks (drag field di editor).
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveOverlay(event.eventName)}
                                      disabled={!bgImages[event.eventName] || saveStates[event.eventName] === 'saving'}
                                      className="bg-vibrant-primary text-white hover:opacity-90 border-0 text-xs h-8"
                                    >
                                      {saveStates[event.eventName] === 'saving' ? (
                                        <>Menyimpan...</>
                                      ) : saveStates[event.eventName] === 'saved' ? (
                                        <><Check className="w-3.5 h-3.5 mr-1" /> Tersimpan</>
                                      ) : (
                                        <><Save className="w-3.5 h-3.5 mr-1" /> Simpan Konfigurasi</>
                                      )}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleManage(event.eventName)} className="border-border text-xs h-8">
                                      <ExternalLink className="w-3 h-3 mr-1" /> Edit Posisi Teks
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Acara tidak ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  Halaman {page} dari {totalPages} ({filtered.length} acara)
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  {pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-1.5 text-muted-foreground text-xs">...</span>
                    ) : (
                      <Button key={p} variant={page === p ? 'default' : 'outline'} size="icon"
                        className={cn('h-7 w-7 text-xs font-medium', page === p ? 'bg-vibrant-primary text-white border-0' : 'border-border')}
                        onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    )
                  )}
                  <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </>
  );
}
