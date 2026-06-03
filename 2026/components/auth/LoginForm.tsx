'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, AlertCircle, Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setApiError('');
    setIsSubmitting(true);

    try {
      const success = await login(data.email, data.password);

      if (success) {
        router.push('/dashboard');
      } else {
        setApiError('Email atau password tidak sesuai');
      }
    } catch (error) {
      setApiError('Terjadi kesalahan saat login');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border/60 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vibrant-primary to-vibrant-info flex items-center justify-center mx-auto mb-4 shadow-vibrant">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Selamat Datang</h2>
          <p className="text-muted-foreground text-sm">Masuk ke panel admin IGI JATIM</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {apiError}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@gmail.com"
                className="pl-11 h-12 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50 rounded-xl"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-11 h-12 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50 rounded-xl"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-vibrant-primary/[0.04] border border-vibrant-primary/10">
            <p className="text-xs font-semibold text-vibrant-primary mb-2">Demo Credentials:</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><span className="font-medium">Email:</span> admin@gmail.com</span>
              <span><span className="font-medium">Password:</span> admin</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-vibrant-primary to-vibrant-info text-white hover:opacity-90 shadow-vibrant border-0 rounded-xl text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Memuat...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
