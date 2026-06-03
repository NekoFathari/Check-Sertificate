'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/motion';
import { User, Shield, Calendar, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getAuthHeader } from '@/lib/auth';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const DEFAULT_PROFILE: ProfileData = {
  id: '',
  name: '',
  email: '',
  role: '',
  createdAt: '',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile', { headers: getAuthHeader() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProfile(json.data);
        else if (user) setProfile({ ...DEFAULT_PROFILE, ...user, createdAt: user.createdAt || '' });
      })
      .catch(() => {
        if (user) setProfile({ ...DEFAULT_PROFILE, ...user, createdAt: user.createdAt || '' });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpdate = async (updatedProfile: ProfileData) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedProfile.name }),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        toast.success('Profile berhasil diperbarui');
      } else {
        toast.error(json.message || 'Gagal memperbarui profile');
      }
    } catch {
      toast.error('Gagal memperbarui profile');
    }
  };

  return (
    <>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">Kelola informasi profil Anda</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn delay={0.1}>
          <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden lg:col-span-1">
            <div className="bg-gradient-to-br from-vibrant-primary to-vibrant-info p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto border-4 border-white/30 shadow-lg">
                <AvatarFallback className="bg-white text-vibrant-primary text-2xl font-bold">
                  {loading ? '...' : profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white font-bold text-lg mt-4">{loading ? 'Loading...' : profile.name}</h3>
              <p className="text-white/80 text-sm">{profile.email}</p>
              <Badge className="mt-3 bg-white/20 text-white border-white/30">
                <Shield className="w-3 h-3 mr-1" />
                {profile.role === 'admin' ? 'Administrator' : 'Pengguna'}
              </Badge>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bergabung</p>
                  <p className="font-medium text-foreground">{profile.createdAt ? formatDate(profile.createdAt) : '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ID Pengguna</p>
                  <p className="font-medium text-foreground font-mono text-xs">{profile.id || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-vibrant-primary" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} onUpdate={handleUpdate} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
