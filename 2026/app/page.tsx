'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FlagTriangleRight, Download } from 'lucide-react';
import { ReportModal } from '@/components/modals/ReportModal';
import { CertificatePublicModal } from '@/components/modals/CertificatePublicModal';
import { toast } from 'sonner';
import { Sertifikat } from '@/lib/types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Sertifikat[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [downloadCert, setDownloadCert] = useState<Sertifikat | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/sertifikat`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const q = searchQuery.toLowerCase();
        const results = json.data.filter(
          (cert: Sertifikat) =>
            cert.nomor_sertif.toLowerCase().includes(q) ||
            cert.nama.toLowerCase().includes(q)
        );
        setSearchResults(results);
        if (results.length === 0) {
          toast.error('Data tidak ditemukan. Anda bisa kirim laporan.');
        }
      } else {
        setSearchResults([]);
        toast.error('Gagal memuat data');
      }
    } catch {
      setSearchResults([]);
      toast.error('Gagal menghubungi server');
    }
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Verifikasi Sertifikat
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            IGI JATIM - Sistem Manajemen Sertifikat
          </p>
          <p className="text-muted-foreground">
            Masukkan nomor sertifikat atau nama pemegang untuk memverifikasi
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Cari nomor sertifikat atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  {isSearching ? 'Mencari...' : 'Cari'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {hasSearched && (
          <>
            {searchResults.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                      Hasil Pencarian ({searchResults.length} ditemukan)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>No. Sertifikat</TableHead>
                          <TableHead>Asal</TableHead>
                          <TableHead>Provinsi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((cert) => (
                          <TableRow key={cert.id}>
                            <TableCell className="font-medium">{cert.nama}</TableCell>
                            <TableCell className="font-mono text-xs">{cert.nomor_sertif}</TableCell>
                            <TableCell>{cert.asal}</TableCell>
                            <TableCell>{cert.provinsi}</TableCell>
                            <TableCell>
                              <Badge
                                className={cert.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}
                              >
                                {cert.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDownloadCert(cert)} title="Lihat & Download">
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-6">
                    Sertifikat tidak ditemukan. Silakan coba pencarian lain.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setHasSearched(false);
                        setSearchResults([]);
                      }}
                    >
                      Cari Kembali
                    </Button>
                    <Button onClick={() => setShowReport(true)}>
                      <FlagTriangleRight className="w-4 h-4 mr-2" />
                      Kirim Laporan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {hasSearched && searchResults.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowReport(true)}>
              <FlagTriangleRight className="w-4 h-4 mr-2" />
              Ada data tidak sesuai? Kirim laporan
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 underline">
            Masuk Sebagai Admin
          </Link>
        </div>

        <ReportModal
          open={showReport}
          onClose={() => setShowReport(false)}
          nomorSertif={searchQuery}
          found={searchResults.length > 0}
        />

        <CertificatePublicModal
          certificate={downloadCert}
          open={!!downloadCert}
          onClose={() => setDownloadCert(null)}
        />
      </div>
    </div>
  );
}
