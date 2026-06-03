'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Home, FileText, User, Settings, LogOut, Menu, Calendar } from 'lucide-react';
import { useState } from 'react';

export function DashboardSidebar() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'w-64' : 'w-0'
        } md:w-64 bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">IGI JATIM</h1>
          <p className="text-xs text-gray-400">Manajemen Sertifikat</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link href="/dashboard/sertifikat" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group">
            <FileText className="w-5 h-5" />
            <span>Sertifikat</span>
          </Link>

          <Link href="/events" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group">
            <Calendar className="w-5 h-5" />
            <span>Event</span>
          </Link>

          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group">
            <User className="w-5 h-5" />
            <span>Profil</span>
          </Link>
        </nav>

        {/* Bottom section: Settings + Logout */}
        <div className="px-4 py-4 border-t border-gray-800 space-y-2">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group text-gray-300">
            <Settings className="w-5 h-5" />
            <span>Pengaturan</span>
          </Link>

          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Overlay when sidebar open on mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
