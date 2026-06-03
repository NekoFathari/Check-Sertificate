import { google, sheets_v4 } from 'googleapis';

interface SheetRow {
  [key: string]: string;
}

interface SyncResult {
  rows: SheetRow[];
  error?: string;
}

const FIELD_MAP: Record<string, string> = {
  nama: 'nama', name: 'nama', Nama: 'nama', NAMA: 'nama',
  nama_peserta: 'nama', 'nama peserta': 'nama',
  'nama pemegang': 'nama', 'nama pemegang sertifikat': 'nama',
  Nama_Pemegang_Sertifikat: 'nama',
  pemegang: 'nama', pemilik: 'nama',
  nama_acara: 'nama_acara', 'nama acara': 'nama_acara', 'Nama Acara': 'nama_acara',
  acara: 'nama_acara', kegiatan: 'nama_acara', 'nama kegiatan': 'nama_acara',
  event: 'nama_acara', pelatihan: 'nama_acara',
  webinar: 'nama_acara', diklat: 'nama_acara',
  'Webinar/Diklat': 'nama_acara',
  nomor_sertif: 'nomor_sertif',
  'nomor sertifikat': 'nomor_sertif', 'Nomor Sertifikat': 'nomor_sertif',
  'no sertifikat': 'nomor_sertif', 'No Sertifikat': 'nomor_sertif',
  'no seri sertifikat': 'nomor_sertif', 'No Seri Sertifikat': 'nomor_sertif',
  no_sertifikat: 'nomor_sertif', no_seri: 'nomor_sertif',
  nomor: 'nomor_sertif', nopes: 'nomor_sertif',
  asal: 'asal', Asal: 'asal', institusi: 'asal',
  asal_instansi: 'asal', 'asal instansi': 'asal', 'Asal Instansi': 'asal',
  asal_sekolah: 'asal', 'asal sekolah': 'asal',
  instansi: 'asal', sekolah: 'asal', lembaga: 'asal', unit_kerja: 'asal',
  kab_kot: 'kab_kot', 'kab/kot': 'kab_kot', 'Kab/Kot': 'kab_kot',
  kab_kota: 'kab_kot', 'kab/kota': 'kab_kot',
  'KAB / KOTA': 'kab_kot', 'kab / kota': 'kab_kot',
  kabupaten: 'kab_kot', kota: 'kab_kot', kab: 'kab_kot',
  provinsi: 'provinsi', Provinsi: 'provinsi', propinsi: 'provinsi',
  PROVINSI: 'provinsi', prov: 'provinsi',
  status: 'status', Status: 'status', STATUS: 'status',
  status_keaktifan: 'status', keaktifan: 'status',
};

function getSheetsClient(): sheets_v4.Sheets {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const apiKey = process.env.GOOGLE_API_KEY;

  // Mode 1: API Key (paling simpel — untuk spreadsheet public atau shared)
  if (apiKey && apiKey.startsWith('AIza')) {
    return google.sheets({ version: 'v4', auth: apiKey });
  }

  // Mode 2: Service Account Private Key (butuh PEM format)
  const isPemKey = privateKey && (
    privateKey.includes('-----BEGIN PRIVATE KEY-----') ||
    privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')
  );

  if (email && privateKey && isPemKey) {
    const key = privateKey.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    return google.sheets({ version: 'v4', auth });
  }

  // Mode 3: API Key dalam GOOGLE_PRIVATE_KEY (fallback)
  if (privateKey && privateKey.startsWith('AIza')) {
    return google.sheets({ version: 'v4', auth: privateKey });
  }

  throw new Error(
    'Google Sheets credentials tidak dikonfigurasi dengan benar. ' +
    'Tambahkan GOOGLE_API_KEY (API Key dari Google Cloud Console) atau ' +
    'GOOGLE_PRIVATE_KEY dalam format PEM (Service Account).'
  );
}

export function mapHeaders(headers: string[]): string[] {
  return headers.map((h) => {
    const trimmed = h.trim();
    const lower = trimmed.toLowerCase();
    for (const [source, target] of Object.entries(FIELD_MAP)) {
      if (lower === source.toLowerCase()) return target;
    }
    return trimmed;
  });
}

function mapRowGS(row: string[], headers: string[]): Record<string, string> {
  const mapped: Record<string, string> = {};
  row.forEach((value, index) => {
    const header = headers[index] || `col_${index}`;
    mapped[header] = value?.trim() || '';
  });
  if (mapped.status) {
    const upper = mapped.status.toUpperCase();
    if (['PESERTA', 'NARASUMBER', 'PANITIA', 'PEMATERI'].includes(upper)) {
      mapped.kategori = upper;
    }
  }
  return mapped;
}

export async function fetchSheetData(
  spreadsheetId: string,
  range: string
): Promise<SyncResult> {
  try {
    const sheets = getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return { rows: [] };
    }

    const rawHeaders = rows[0];
    const headers = mapHeaders(rawHeaders);
    const data = rows.slice(1).map((row) => mapRowGS(row, headers));

    return { rows: data };
  } catch (error: any) {
    const status = error?.response?.status;
    const errMsg = error?.errors?.[0]?.message || error?.message || '';

    if (status === 403) {
      return { rows: [], error: 'Akses ditolak. Pastikan spreadsheet sudah di-share ke Service Account email.' };
    }
    if (status === 404) {
      return { rows: [], error: 'Spreadsheet tidak ditemukan. Periksa Spreadsheet ID.' };
    }
    if (errMsg.includes('DECODER') || errMsg.includes('unsupported')) {
      return {
        rows: [],
        error:
          'Format credentials salah. Gunakan GOOGLE_API_KEY (API Key) atau GOOGLE_PRIVATE_KEY dalam format PEM.\n' +
          'Contoh PEM: -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n-----END PRIVATE KEY-----\n',
      };
    }

    return { rows: [], error: errMsg || 'Gagal mengakses Google Sheets' };
  }
}
