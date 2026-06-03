'use client';

import { AppSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mail, Upload, Bell, BellOff } from 'lucide-react';

interface NotificationSettingsProps {
  settings: AppSettings;
  onChange: (updates: Partial<AppSettings>) => void;
}

export function NotificationSettings({ settings, onChange }: NotificationSettingsProps) {
  const toggles = [
    {
      key: 'emailNotifications' as const,
      label: 'Notifikasi Email',
      desc: 'Terima pemberitahuan melalui email',
      icon: Mail,
    },
    {
      key: 'uploadNotifications' as const,
      label: 'Notifikasi Unggah',
      desc: 'Beritahu saat file berhasil diunggah',
      icon: Upload,
    },
    {
      key: 'syncNotifications' as const,
      label: 'Notifikasi Sinkronisasi',
      desc: 'Beritahu saat sinkronisasi selesai',
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-3">
      {toggles.map((toggle) => {
        const Icon = toggle.icon;
        const isEnabled = settings[toggle.key];
        
        return (
          <div
            key={toggle.key}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
              isEnabled ? 'border-vibrant-success/30 bg-emerald-50/30' : 'border-border bg-muted/50'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{toggle.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{toggle.desc}</p>
            </div>
            <button
              onClick={() => onChange({ [toggle.key]: !isEnabled })}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors duration-200',
                isEnabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center',
                  isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                )}
              >
                {isEnabled ? (
                  <Bell className="w-3 h-3 text-emerald-500" />
                ) : (
                  <BellOff className="w-3 h-3 text-muted-foreground" />
                )}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
