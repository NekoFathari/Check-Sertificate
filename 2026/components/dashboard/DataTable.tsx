'use client';

import { useState, useMemo } from 'react';
import { Sertifikat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileX } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: Sertifikat[];
  onEdit?: (item: Sertifikat) => void;
  onDelete?: (item: Sertifikat) => void;
  isLoading?: boolean;
}

type SortKey = keyof Sertifikat;

export function DataTable({ data, onEdit, onDelete, isLoading = false }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const pageSize = 10;

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nomor_sertif.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, currentPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getPageNumbers = (total: number, current: number): (number | 'ellipsis')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [];
    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
    return pages;
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-vibrant-primary" />
      : <ArrowDown className="w-3.5 h-3.5 text-vibrant-primary" />;
  };

  const SortHeader = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => (
    <TableHead
      onClick={() => handleSort(key)}
      className="cursor-pointer select-none hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon columnKey={key} />
      </div>
    </TableHead>
  );

  const getStatusBadge = (status: string) => {
    if (status === 'Aktif') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          Aktif
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/50 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
        Tidak Aktif
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold text-foreground">Data Sertifikat</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau nomor sertif..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full sm:w-72 border-border focus-visible:ring-vibrant-primary/30 focus-visible:border-vibrant-primary/50"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/80 hover:bg-muted/80">
                <SortHeader label="Nama" sortKey="nama" />
                <SortHeader label="Acara" sortKey="nama_acara" />
                <SortHeader label="No. Sertifikat" sortKey="nomor_sertif" />
                <SortHeader label="Asal" sortKey="asal" />
                <SortHeader label="Kabupaten/Kota" sortKey="kab_kot" />
                <SortHeader label="Provinsi" sortKey="provinsi" />
                <SortHeader label="Status" sortKey="status" />
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileX className="w-12 h-12 mb-3 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Tidak ada data ditemukan</p>
                      <p className="text-xs mt-1">Coba ubah kata kunci pencarian</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-muted/60',
                      'group cursor-default'
                    )}
                  >
                    <TableCell className="font-semibold text-foreground">{item.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{item.nama_acara}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{item.nomor_sertif}</TableCell>
                    <TableCell className="text-muted-foreground">{item.asal}</TableCell>
                    <TableCell className="text-muted-foreground">{item.kab_kot}</TableCell>
                    <TableCell className="text-muted-foreground">{item.provinsi}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-vibrant-primary hover:bg-vibrant-primary/10"
                          onClick={() => onEdit?.(item)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-vibrant-rose hover:bg-vibrant-rose/10"
                          onClick={() => onDelete?.(item)}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-semibold text-foreground">{paginatedData.length}</span> dari{' '}
              <span className="font-semibold text-foreground">{sortedData.length}</span> hasil
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 border-border"
              >
                <span className="text-xs font-bold">{'«'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {getPageNumbers(totalPages, currentPage).map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="w-8 text-center text-sm text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                        page === currentPage
                          ? 'bg-vibrant-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 border-border"
              >
                <span className="text-xs font-bold">{'»'}</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
