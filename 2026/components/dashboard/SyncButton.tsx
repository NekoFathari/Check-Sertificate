'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { getCurrentTime } from '@/lib/utils';
import { getAuthHeader } from '@/lib/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PulseDot } from '@/components/ui/motion';

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('Belum disinkronkan');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('lastSynced');
    if (saved) setLastSynced(saved);
  }, []);

  const handleSync = async () => {
    setIsLoading(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) { clearInterval(interval); return 85; }
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      clearInterval(interval);
      setProgress(100);

      if (json.success) {
        const time = getCurrentTime();
        setLastSynced(time);
        localStorage.setItem('lastSynced', time);
        toast.success(json.message || 'Sinkronisasi berhasil!', {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        });
      } else {
        toast.error(json.message || 'Gagal sinkronisasi');
      }
    } catch (error) {
      clearInterval(interval);
      toast.error('Gagal melakukan sinkronisasi. Periksa koneksi.');
    } finally {
      setTimeout(() => { setIsLoading(false); setProgress(0); }, 500);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <PulseDot color="bg-emerald-500" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>Terakhir disinkronkan: <span className="font-medium text-foreground">{lastSynced}</span></span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full sm:w-48"
            >
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-vibrant-primary to-vibrant-info rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">{Math.round(progress)}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-vibrant-primary to-vibrant-info text-white hover:opacity-90 shadow-vibrant border-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Menyinkronkan...' : 'Sinkronkan Google Sheets'}
        </Button>
      </div>
    </div>
  );
}
