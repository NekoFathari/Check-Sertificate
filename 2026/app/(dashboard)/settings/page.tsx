'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { AppSettings, GoogleSheetsSettings } from '@/lib/types';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettingsForm } from '@/components/settings/SecuritySettingsForm';
import { GoogleSheetsSettingsForm } from '@/components/settings/GoogleSheetsSettingsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { Palette, Bell, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { getAuthHeader } from '@/lib/auth';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  emailNotifications: true,
  uploadNotifications: true,
  syncNotifications: true,
};

const DEFAULT_SHEETS: GoogleSheetsSettings = {
  spreadsheetId: '',
  sheets: [{ name: 'Sheet1', dataRange: 'A1:F1000', enabled: true }],
  syncIntervalMinutes: 60,
};

export default function SettingsPage() {
  const { theme: providerTheme, setTheme: setProviderTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('appSettings');
      if (stored) return JSON.parse(stored);
    }
    return DEFAULT_SETTINGS;
  });
  const [sheets, setSheets] = useState<GoogleSheetsSettings>(DEFAULT_SHEETS);

  useEffect(() => {
    fetch('/api/settings', { headers: getAuthHeader() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const s = { ...DEFAULT_SETTINGS, ...json.data };
          setSettings(s);
          if (s.theme !== providerTheme) setProviderTheme(s.theme);
          if (json.data.googleSheetsSettings) {
            setSheets(json.data.googleSheetsSettings);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const saveToApi = async (updates: Partial<AppSettings>) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  };

  const handleSheetsChange = async (updates: Partial<GoogleSheetsSettings>) => {
    const newSheets = { ...sheets, ...updates };
    setSheets(newSheets);
    await saveSheetsToApi(newSheets);
  };

  const saveSheetsToApi = async (updates: GoogleSheetsSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetsSettings: updates }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Konfigurasi Google Sheets berhasil disimpan!', {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        });
      } else {
        toast.error(json.message || 'Gagal menyimpan');
      }
    } catch {
      toast.error('Gagal menyimpan konfigurasi');
    }
  };

  const handleThemeChange = (theme: AppSettings['theme']) => {
    setSettings((prev) => ({ ...prev, theme }));
    setProviderTheme(theme);
    saveToApi({ theme });
    toast.success('Tema berhasil diubah!', {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    });
  };

  const handleNotificationChange = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    saveToApi(updates);
    toast.success('Preferensi notifikasi disimpan!', {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    });
  };

  return (
    <>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">Atur preferensi aplikasi dan keamanan akun</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.1}>
          <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Palette className="w-5 h-5 text-vibrant-primary" />
                Tema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSettings settings={settings} onChange={handleThemeChange} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-vibrant-warning" />
                Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings settings={settings} onChange={handleNotificationChange} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-vibrant-rose" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm
                settings={{ currentPasswordHash: '', lastPasswordChange: null }}
                onChange={() => {}}
              />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-vibrant-success" />
                Google Sheets
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Konfigurasi multi-sheet untuk sinkronisasi data dari berbagai tab spreadsheet
              </p>
            </CardHeader>
            <CardContent>
              <GoogleSheetsSettingsForm
                settings={sheets}
                onChange={handleSheetsChange}
              />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
