'use client';

import { Bell, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const notifications = [
  { id: 'n1', title: 'Sinkronisasi berhasil', detail: 'Google Sheets sudah diperbarui', type: 'success' },
  { id: 'n2', title: 'Laporan baru masuk', detail: 'Ada data yang tidak ditemukan', type: 'warning' },
  { id: 'n3', title: 'Edit sertifikat dibutuhkan', detail: 'Beberapa data perlu diverifikasi', type: 'warning' },
];

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center">
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-vibrant-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Notifikasi</div>
        <DropdownMenuSeparator />
        {notifications.map((item) => (
          <DropdownMenuItem key={item.id} className="items-start gap-3 py-2 cursor-pointer">
            <div className="mt-0.5">
              {item.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock3 className="w-3 h-3" />
          Real-time placeholder
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}