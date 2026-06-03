import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParseResult {
  rows: Record<string, string>[];
  errors: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_FIELDS = ['nama', 'nama_acara', 'nomor_sertif'];

const HEADER_MAP: Record<string, string> = {
  nama: 'nama',
  name: 'nama',
  nama_peserta: 'nama',
  nama_pemegang: 'nama',
  nama_pemegang_sertifikat: 'nama',
  pemegang: 'nama',
  pemilik: 'nama',
  nama_acara: 'nama_acara',
  acara: 'nama_acara',
  webinar: 'nama_acara',
  diklat: 'nama_acara',
  webinar_diklat: 'nama_acara',
  'webinar/diklat': 'nama_acara',
  kegiatan: 'nama_acara',
  nama_kegiatan: 'nama_acara',
  event: 'nama_acara',
  pelatihan: 'nama_acara',
  nomor_sertif: 'nomor_sertif',
  no_sertifikat: 'nomor_sertif',
  no_seri_sertifikat: 'nomor_sertif',
  nomor_sertifikat: 'nomor_sertif',
  no_seri: 'nomor_sertif',
  nopes: 'nomor_sertif',
  asal: 'asal',
  asal_instansi: 'asal',
  instansi: 'asal',
  institusi: 'asal',
  asal_sekolah: 'asal',
  sekolah: 'asal',
  lembaga: 'asal',
  unit_kerja: 'asal',
  kab_kot: 'kab_kot',
  kab_kota: 'kab_kot',
  'kab/kota': 'kab_kot',
  'kab_/_kota': 'kab_kot',
  kabupaten: 'kab_kot',
  kota: 'kab_kot',
  kab: 'kab_kot',
  provinsi: 'provinsi',
  propinsi: 'provinsi',
  prov: 'provinsi',
  status: 'status',
  status_keaktifan: 'status',
  keaktifan: 'status',
};

const STATUS_MAP: Record<string, string> = {
  aktif: 'Aktif',
  peserta: 'Aktif',
  pemateri: 'Aktif',
  narasumber: 'Aktif',
  panitia: 'Aktif',
  nonaktif: 'Tidak Aktif',
  non_aktif: 'Tidak Aktif',
  'tidak aktif': 'Tidak Aktif',
};

function normalize(text: string): string {
  return String(text).trim().toLowerCase().replace(/\s+/g, '_');
}

function mapHeader(original: string): string {
  const key = normalize(original);
  if (HEADER_MAP[key]) return HEADER_MAP[key];
  const keySlash = key.replace(/\/$|^\//, '').replace(/\//g, '_');
  if (HEADER_MAP[keySlash]) return HEADER_MAP[keySlash];
  return key;
}

function mapStatus(value: string): string {
  if (!value) return 'Aktif';
  const key = normalize(value);
  if (STATUS_MAP[key]) return STATUS_MAP[key];
  return 'Aktif';
}

function mapRow(rawRow: Record<string, string>, rowNum: number): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [col, value] of Object.entries(rawRow)) {
    const target = mapHeader(col);
    if (target === 'null' || target === 'undefined' || !target) continue;
    if (mapped[target] !== undefined) continue;
    if (target === 'status') {
      const original = String(value || '').trim();
      const upper = original.toUpperCase();
      if (['PESERTA', 'NARASUMBER', 'PANITIA', 'PEMATERI'].includes(upper)) {
        mapped['kategori'] = upper;
      }
      mapped[target] = mapStatus(value);
    } else {
      mapped[target] = String(value || '').trim();
    }
  }
  return mapped;
}

export function validateRow(row: Record<string, string>): ValidationResult {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!row[field] || !row[field].trim()) {
      errors.push(`Field "${field}" wajib diisi`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRows(rows: Record<string, string>[]): {
  validRows: Record<string, string>[];
  errors: { row: number; messages: string[] }[];
} {
  const validRows: Record<string, string>[] = [];
  const errors: { row: number; messages: string[] }[] = [];

  rows.forEach((row, index) => {
    const result = validateRow(row);
    if (result.valid) {
      validRows.push(row);
    } else {
      errors.push({ row: index + 2, messages: result.errors });
    }
  });

  return { validRows, errors };
}

export async function parseCSVFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data as Record<string, string>[];
        const rows = rawRows.map((row, i) => mapRow(row, i));
        const errors: string[] = results.errors
          .filter((e) => e.type !== 'FieldMismatch')
          .map((e) => `Baris ${e.row || '?'}: ${e.message}`);

        resolve({ rows, errors });
      },
      error: (err: Error) => reject(err),
    });
  });
}

export async function parseXLSXFile(file: File): Promise<ParseResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return { rows: [], errors: ['File tidak memiliki sheet'] };

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    if (data.length < 2) return { rows: [], errors: [] };

    const rawHeaders = (data[0] as string[]).map((h: string) => String(h || '').trim());

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as string[];
      if (!row || row.every((cell) => !cell)) continue;
      const raw: Record<string, string> = {};
      rawHeaders.forEach((header, index) => {
        raw[header] = String(row[index] || '').trim();
      });
      const mappedRow = mapRow(raw, i);
      rows.push(mappedRow);
    }

    return { rows, errors: [] };
  } catch (error: any) {
    return { rows: [], errors: [error?.message || 'Gagal parse file XLSX'] };
  }
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return parseCSVFile(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSXFile(file);
  return { rows: [], errors: ['Format file tidak didukung'] };
}
