'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { StaggerContainer, StaggerItem, AnimatedCard } from '@/components/ui/motion';

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/sertifikat');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const data = json.data as any[];
          setStats({
            total: data.length,
            active: data.filter((s: any) => s.status === 'Aktif').length,
            inactive: data.filter((s: any) => s.status === 'Tidak Aktif').length,
          });
        }
      } catch {
        // Silently fail - will show 0
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const items = [
    {
      label: 'Total Sertifikat',
      value: stats.total,
      icon: FileText,
      gradient: 'bg-gradient-card-blue',
      shadow: 'shadow-vibrant',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-300',
      trend: { value: 12, up: true },
    },
    {
      label: 'Sertifikat Aktif',
      value: stats.active,
      icon: CheckCircle,
      gradient: 'bg-gradient-card-green',
      shadow: 'shadow-vibrant-success',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-300',
      trend: { value: 8, up: true },
    },
    {
      label: 'Tidak Aktif',
      value: stats.inactive,
      icon: XCircle,
      gradient: 'bg-gradient-card-rose',
      shadow: 'shadow-vibrant-rose',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-300',
      trend: { value: 3, up: false },
    },
  ];

  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <StaggerItem key={item.label}>
            <AnimatedCard delay={index * 0.1}>
              <Card className={`relative overflow-hidden border-0 ${item.shadow}`}>
                <div className={`${item.gradient} absolute inset-0 opacity-[0.03]`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                      <p className="text-3xl font-bold text-foreground">
                        {loading ? '...' : item.value}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {item.trend.up ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            +{item.trend.value}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                            <TrendingDown className="w-3 h-3" />
                            -{item.trend.value}%
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">vs bulan lalu</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
