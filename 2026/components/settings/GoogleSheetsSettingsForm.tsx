'use client';

import { useState, useEffect } from 'react';
import { GoogleSheetsSettings, GoogleSheetConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Database, Link2, FileSpreadsheet, Clock, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoogleSheetsSettingsFormProps {
  settings: GoogleSheetsSettings;
  onChange: (updates: Partial<GoogleSheetsSettings>) => void;
}

export function GoogleSheetsSettingsForm({ settings, onChange }: GoogleSheetsSettingsFormProps) {
  const [formData, setFormData] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.spreadsheetId.trim()) {
      newErrors.spreadsheetId = 'Spreadsheet ID harus diisi';
    }
    
    if (formData.sheets.length === 0) {
      newErrors.sheets = 'Minimal 1 sheet harus dikonfigurasi';
    }
    
    formData.sheets.forEach((sheet, index) => {
      if (!sheet.name.trim()) {
        newErrors[`sheet_${index}_name`] = `Nama Sheet ${index + 1} harus diisi`;
      }
      if (!sheet.dataRange.trim()) {
        newErrors[`sheet_${index}_range`] = `Range Sheet ${index + 1} harus diisi`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onChange(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof GoogleSheetsSettings, value: string | GoogleSheetConfig[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const addSheet = () => {
    setFormData((prev) => ({
      ...prev,
      sheets: [...prev.sheets, { name: '', dataRange: 'A1:F1000', enabled: true }],
    }));
  };

  const removeSheet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sheets: prev.sheets.filter((_, i) => i !== index),
    }));
  };

  const updateSheet = (index: number, updates: Partial<GoogleSheetConfig>) => {
    setFormData((prev) => ({
      ...prev,
      sheets: prev.sheets.map((sheet, i) => (i === index ? { ...sheet, ...updates } : sheet)),
    }));
    if (errors[`sheet_${index}_name`]) setErrors((prev) => ({ ...prev, [`sheet_${index}_name`]: '' }));
    if (errors[`sheet_${index}_range`]) setErrors((prev) => ({ ...prev, [`sheet_${index}_range`]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Spreadsheet ID */}
        <div className="space-y-2">
          <Label htmlFor="spreadsheetId" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            Spreadsheet ID
          </Label>
          <Input
            id="spreadsheetId"
            value={formData.spreadsheetId}
            onChange={(e) => updateField('spreadsheetId', e.target.value)}
            className="h-11 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgm..."
          />
          <AnimatePresence>
            {errors.spreadsheetId && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-rose-600"
              >
                {errors.spreadsheetId}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Multi-Sheet Configuration */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              Konfigurasi Sheet
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSheet}
              className="h-8 text-xs border-border"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah Sheet
            </Button>
          </div>

          <AnimatePresence>
            {formData.sheets.map((sheet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg border border-border bg-muted/50"
              >
                <div className="md:col-span-4 space-y-1">
                  <Label className="text-xs text-muted-foreground">Nama Sheet</Label>
                  <Input
                    value={sheet.name}
                    onChange={(e) => updateSheet(index, { name: e.target.value })}
                    className="h-9 border-border focus-visible:ring-vibrant-primary/30"
                    placeholder={`Sheet${index + 1}`}
                  />
                  {errors[`sheet_${index}_name`] && (
                    <p className="text-xs text-rose-600">{errors[`sheet_${index}_name`]}</p>
                  )}
                </div>
                <div className="md:col-span-5 space-y-1">
                  <Label className="text-xs text-muted-foreground">Range Data</Label>
                  <Input
                    value={sheet.dataRange}
                    onChange={(e) => updateSheet(index, { dataRange: e.target.value })}
                    className="h-9 border-border focus-visible:ring-vibrant-primary/30"
                    placeholder="A1:F1000"
                  />
                  {errors[`sheet_${index}_range`] && (
                    <p className="text-xs text-rose-600">{errors[`sheet_${index}_range`]}</p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-end justify-center pb-1">
                  <button
                    type="button"
                    onClick={() => updateSheet(index, { enabled: !sheet.enabled })}
                    className="flex items-center gap-1 text-xs"
                    title={sheet.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {sheet.enabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className={sheet.enabled ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {sheet.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </button>
                </div>
                <div className="md:col-span-1 flex items-end justify-center pb-1">
                  {formData.sheets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSheet(index)}
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                      title="Hapus Sheet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {errors.sheets && (
            <p className="text-xs text-rose-600">{errors.sheets}</p>
          )}
        </div>

        {/* Sync Interval */}
        <div className="space-y-2">
          <Label htmlFor="syncInterval" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Interval Sinkronisasi (menit)
          </Label>
          <Input
            id="syncInterval"
            type="number"
            min={1}
            max={1440}
            value={formData.syncIntervalMinutes}
            onChange={(e) => updateField('syncIntervalMinutes', e.target.value)}
            className="h-11 border-slate-200 focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50"
          />
          <p className="text-xs text-muted-foreground">Minimal 1 menit, maksimal 1440 menit (24 jam)</p>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 bg-gradient-to-r from-vibrant-success to-emerald-400 text-white hover:opacity-90 shadow-vibrant-success border-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Konfigurasi
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
