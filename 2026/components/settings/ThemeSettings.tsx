'use client';

import { AppSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSettingsProps {
  settings: AppSettings;
  onChange: (theme: AppSettings['theme']) => void;
}

export function ThemeSettings({ settings, onChange }: ThemeSettingsProps) {
  const themes = [
    { value: 'light' as const, label: 'Terang', icon: Sun, desc: 'Tema cerah untuk penggunaan siang hari' },
    { value: 'dark' as const, label: 'Gelap', icon: Moon, desc: 'Tema gelap untuk penggunaan malam hari' },
    { value: 'system' as const, label: 'Sistem', icon: Monitor, desc: 'Mengikuti pengaturan perangkat' },
  ];

  return (
    <div className="space-y-3">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isActive = settings.theme === theme.value;
        
        return (
          <button
            key={theme.value}
            onClick={() => onChange(theme.value)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              isActive
                ? 'border-vibrant-primary bg-vibrant-primary/5'
                : 'border-border hover:border-border hover:bg-muted'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              isActive ? 'bg-vibrant-primary text-white' : 'bg-muted text-muted-foreground'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('font-semibold text-sm', isActive ? 'text-vibrant-primary' : 'text-foreground')}>
                {theme.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{theme.desc}</p>
            </div>
            {isActive && (
              <div className="w-5 h-5 rounded-full bg-vibrant-primary flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
