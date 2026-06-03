'use client';

import { StatsCards } from '@/components/dashboard/StatsCards';
import { SyncButton } from '@/components/dashboard/SyncButton';
import { ReportsPanel } from '@/components/dashboard/ReportsPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from 'sonner';
import { FadeIn } from '@/components/ui/motion';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.15)',
            background: 'var(--card)',
            color: 'var(--card-foreground)',
          },
        }}
      />

      {/* Stats Cards */}
      <StatsCards />

      {/* Reports Panel */}
      <FadeIn delay={0.2}>
        <div className="mb-8">
          <ReportsPanel />
        </div>
      </FadeIn>

      {/* Sync Section */}
      <FadeIn delay={0.3}>
        <Card className="mb-8 border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-vibrant-primary/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-vibrant-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Sinkronisasi Data</h3>
              <p className="text-xs text-muted-foreground">Google Sheets &rarr; Database</p>
            </div>
          </div>
          <CardContent className="pt-5 pb-6">
            <SyncButton />
          </CardContent>
        </Card>
      </FadeIn>
    </>
  );
}
