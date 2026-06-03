"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sertifikat } from '@/lib/types';
import { UploadArea } from '@/components/dashboard/UploadArea';
import { DataTable } from '@/components/dashboard/DataTable';
import { SyncLogsPanel } from '@/components/dashboard/SyncLogsPanel';
import { CertificatePreview } from '@/components/certificate/CertificatePreview';
import { EditSertifikatModal } from '@/components/modals/EditSertifikatModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';
import { FadeIn } from '@/components/ui/motion';
import { Upload, Database, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeader } from '@/lib/auth';

export default function SertifikatPage() {
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event');
  const [selectedCertificate, setSelectedCertificate] = useState<Sertifikat | null>(null);
  const [previewCertificate, setPreviewCertificate] = useState<Sertifikat | null>(null);
  const [editItem, setEditItem] = useState<Sertifikat | null>(null);
  const [deleteItem, setDeleteItem] = useState<Sertifikat | null>(null);
  const [data, setData] = useState<Sertifikat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter by event if query param present
  const filteredByEvent = useMemo(() => {
    if (eventParam) return data.filter((s) => s.nama_acara === eventParam);
    return data;
  }, [data, eventParam]);

  // Get all unique event-based samples for current preview's event
  const previewSamples = useMemo(() => {
    if (!previewCertificate) return data;
    return data.filter((s) => s.nama_acara === previewCertificate.nama_acara);
  }, [data, previewCertificate]);

  useEffect(() => {
    if (eventParam && filteredByEvent.length > 0) {
      setPreviewCertificate(filteredByEvent[0]);
      setSelectedCertificate(filteredByEvent[0]);
    }
  }, [eventParam]);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/sertifikat');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        try { sessionStorage.setItem('sertifikat_cache', JSON.stringify(json.data)); } catch {}
      }
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleDelete = async (item: Sertifikat) => {
    try {
      const res = await fetch(`/api/sertifikat/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Sertifikat berhasil dihapus');
        refreshData();
      } else {
        toast.error(json.message || 'Gagal menghapus');
      }
    } catch {
      toast.error('Gagal menghapus sertifikat');
    }
    setDeleteItem(null);
  };

  const displayCert = previewCertificate || selectedCertificate || data[0];

  return (
    <>
      {eventParam && (
        <FadeIn>
          <div className="mb-4 px-1 py-2 rounded-lg bg-vibrant-primary/5 border border-vibrant-primary/10 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <span className="text-sm font-semibold text-vibrant-primary">{eventParam}</span>
            <span className="text-xs text-muted-foreground">({filteredByEvent.length} sertifikat)</span>
          </div>
        </FadeIn>
      )}

      {/* Upload Section */}
      <FadeIn delay={0.1}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-lg bg-vibrant-success/10 flex items-center justify-center">
              <Upload className="w-4 h-4 text-vibrant-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Unggah Data</h3>
              <p className="text-xs text-muted-foreground">Import dari file CSV/XLSX</p>
            </div>
          </div>
          <UploadArea onUploadSuccess={refreshData} />
        </div>
      </FadeIn>

      {/* Data Table */}
      <FadeIn delay={0.2}>
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4 px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-vibrant-info/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-vibrant-info" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Data Sertifikat</h3>
                <p className="text-xs text-muted-foreground">Kelola dan verifikasi sertifikat</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-vibrant-primary text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Data
            </button>
          </div>
          <DataTable
            data={filteredByEvent}
            onEdit={(item) => {
              setEditItem(item);
              setPreviewCertificate(item);
            }}
            onDelete={(item) => setDeleteItem(item)}
            isLoading={loading}
          />
        </div>
      </FadeIn>

      {/* Certificate Preview */}
      <FadeIn delay={0.3}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-lg bg-vibrant-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-vibrant-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Pratinjau Sertifikat</h3>
              <p className="text-xs text-muted-foreground">Preview template atau custom sertifikat</p>
            </div>
          </div>
          <CertificatePreview
            certificate={displayCert}
            samples={previewSamples.length > 1 ? previewSamples : undefined}
            onSampleChange={(cert) => setPreviewCertificate(cert)}
          />
        </div>
      </FadeIn>

      {/* Sync Logs */}
      <FadeIn delay={0.35}>
        <SyncLogsPanel />
      </FadeIn>

      {/* Modals */}
      {(editItem || isCreateOpen) && (
        <EditSertifikatModal
          item={editItem}
          onClose={() => { setEditItem(null); setIsCreateOpen(false); }}
          onSuccess={() => {
            setEditItem(null);
            setIsCreateOpen(false);
            refreshData();
            toast.success(isCreateOpen ? 'Sertifikat berhasil ditambahkan' : 'Sertifikat berhasil diperbarui');
          }}
        />
      )}
      {deleteItem && (
        <DeleteConfirmDialog
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => handleDelete(deleteItem)}
        />
      )}
    </>
  );
}
