'use client';

import { useState } from 'react';
import { SecuritySettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecuritySettingsFormProps {
  settings: SecuritySettings;
  onChange: (updates: Partial<SecuritySettings>) => void;
}

export function SecuritySettingsForm({ settings, onChange }: SecuritySettingsFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini harus diisi';
    } else if (formData.currentPassword !== settings.currentPasswordHash) {
      // In real app, this would be a server check
      newErrors.currentPassword = 'Password saat ini tidak sesuai';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password baru harus diisi';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password minimal 6 karakter';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onChange({
      currentPasswordHash: formData.newPassword,
      lastPasswordChange: new Date().toISOString(),
    });
    
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    toast.success('Password berhasil diubah!', {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    });
    
    setIsSubmitting(false);
  };

  const toggleShow = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Password Saat Ini
        </Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showPassword.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => {
              setFormData({ ...formData, currentPassword: e.target.value });
              if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
            }}
            className="h-11 pr-10 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50"
            placeholder="Masukkan password saat ini"
          />
          <button
            type="button"
            onClick={() => toggleShow('current')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.currentPassword && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-rose-600"
            >
              {errors.currentPassword}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Password Baru
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value });
              if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
            }}
            className="h-11 pr-10 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50"
            placeholder="Minimal 6 karakter"
          />
          <button
            type="button"
            onClick={() => toggleShow('new')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.newPassword && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-rose-600"
            >
              {errors.newPassword}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Konfirmasi Password Baru
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPassword.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            className="h-11 pr-10 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50"
            placeholder="Ulangi password baru"
          />
          <button
            type="button"
            onClick={() => toggleShow('confirm')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-rose-600"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 bg-gradient-to-r from-vibrant-rose to-rose-400 text-white hover:opacity-90 shadow-vibrant-rose border-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengubah...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Ubah Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
