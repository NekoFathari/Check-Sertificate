'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, Inbox, RefreshCw, Clock3, ImageUp } from 'lucide-react';
import { ReportItem } from '@/lib/types';
import { ReportDetailModal } from '@/components/modals/ReportDetailModal';
import { getAuthHeader } from '@/lib/auth';

function getBadgeVariant(status: ReportItem['status']) {
  if (status === 'resolved') return 'success';
  if (status === 'in-progress') return 'secondary';
  return 'destructive';
}

export function ReportsPanel() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', { headers: getAuthHeader() });
      const json = await res.json();
      if (json.success) setReports(json.data);
      else toast.error('Gagal memuat laporan');
    } catch {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-vibrant-warning" />
            Laporan Masuk
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Data yang tidak sesuai atau tidak ditemukan akan muncul di sini.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Muat Ulang
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            Belum ada laporan.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-border bg-muted/30 p-4 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{report.name}</p>
                  <p className="text-sm text-muted-foreground">{report.message}</p>
                </div>
                <Badge variant={getBadgeVariant(report.status) as any} className="w-fit">
                  {report.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1 border border-border">
                  <Clock3 className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleString('id-ID')}
                </span>
                {report.nomor_sertif && (
                  <span className="rounded-full bg-card px-2 py-1 border border-border font-mono">
                    {report.nomor_sertif}
                  </span>
                )}
                {report.imageData && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1 border border-border">
                    <ImageUp className="w-3 h-3" />
                    Ada Bukti
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={(id, status) => {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
          }}
        />
      )}
    </Card>
  );
}