'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import { Loader2, Shield, FileCheck, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-hero">
        <Loader2 className="w-10 h-10 animate-spin text-vibrant-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[5%] w-64 h-64 bg-vibrant-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-vibrant-success/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vibrant-primary/10 text-vibrant-primary text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Panel Admin
              </div>
              <h1 className="text-5xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
                Kelola Sertifikat dengan <span className="text-gradient">Mudah</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sistem manajemen sertifikat IGI JATIM yang terintegrasi dengan Google Sheets untuk sinkronisasi data real-time.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FileCheck, label: 'Verifikasi Cepat', desc: 'Validasi sertifikat dalam detik' },
                { icon: Users, label: 'Data Terpusat', desc: 'Kelola ribuan sertifikat' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm">
                  <item.icon className="w-6 h-6 text-vibrant-primary mb-3" />
                  <p className="font-semibold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
