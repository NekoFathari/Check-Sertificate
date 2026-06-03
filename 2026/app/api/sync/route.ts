import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { getPrisma } from '@/lib/prisma';
import { fetchSheetData } from '@/lib/google-sheets';
import { getAuthUser } from '@/lib/api-auth';

async function getUserSheetsSettings(email: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.googleSheetsSettings) return null;
  try { return JSON.parse(user.googleSheetsSettings); } catch { return null; }
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const dbSettings = await getUserSheetsSettings(authUser.email as string);
    const spreadsheetId = body.spreadsheetId
      || dbSettings?.spreadsheetId
      || process.env.GOOGLE_SPREADSHEET_ID;

    const enabledSheets = dbSettings?.sheets?.filter((s: any) => s.enabled) || [];
    const firstSheetRange = enabledSheets[0]?.dataRange;
    const sheetName = enabledSheets[0]?.name;
    const range = body.range || (firstSheetRange && sheetName ? `${sheetName}!${firstSheetRange}` : null) || 'Sheet1!A1:F10000';

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        message: 'Spreadsheet ID tidak dikonfigurasi',
      }, { status: 400 });
    }

    const { rows, error } = await fetchSheetData(spreadsheetId, range);

    if (error) {
      await prisma.syncLog.create({
        data: {
          status: 'failed',
          source: 'google-sheets',
          totalRows: 0,
          message: error,
        },
      });
      return NextResponse.json({
        success: false,
        message: error,
      }, { status: 500 });
    }

    if (rows.length === 0) {
      await prisma.syncLog.create({
        data: {
          status: 'success',
          source: 'google-sheets',
          totalRows: 0,
          message: 'Tidak ada data baru',
        },
      });
      return NextResponse.json({
        success: true,
        message: 'Tidak ada data baru untuk disinkronkan',
        total: 0,
        inserted: 0,
        updated: 0,
      });
    }

    const validRows = rows.filter((row) => {
      const nomor_sertif = row.nomor_sertif || '';
      const nama_acara = row.nama_acara || '';
      const nama = row.nama || '';
      return nomor_sertif && nama_acara && nama;
    });

    const invalidRows = rows.length - validRows.length;

    // Batch upsert: fetch all existing records first
    const existingList = await prisma.sertifikat.findMany({
      where: {
        nomor_sertif: { in: validRows.map((r) => r.nomor_sertif) },
      },
      select: { id: true, nomor_sertif: true, nama_acara: true },
    });

    const existingMap = new Map<string, string>();
    for (const e of existingList) {
      existingMap.set(`${e.nomor_sertif}::${e.nama_acara}`, e.id);
    }

    const toInsert: any[] = [];
    const toUpdate: { id: string; data: any }[] = [];
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of validRows) {
      const key = `${row.nomor_sertif}::${row.nama_acara}`;
      try {
        if (existingMap.has(key)) {
          toUpdate.push({
            id: existingMap.get(key)!,
            data: {
              nama: row.nama || '',
              nomor_sertif: row.nomor_sertif || '',
              nama_acara: row.nama_acara || '',
              asal: row.asal || '',
              kab_kot: row.kab_kot || '',
              provinsi: row.provinsi || '',
              status: row.status || 'Aktif',
              kategori: row.kategori || null,
            },
          });
        } else {
          toInsert.push({
            nama: row.nama || '',
            nama_acara: row.nama_acara || '',
            nomor_sertif: row.nomor_sertif || '',
            asal: row.asal || '',
            kab_kot: row.kab_kot || '',
            provinsi: row.provinsi || '',
            status: row.status || 'Aktif',
            kategori: row.kategori || null,
          });
        }
      } catch (err: any) {
        errors.push(err?.message || 'unknown error');
      }
    }

    // Batch create new records
    const BATCH_SIZE = 200;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const result = await prisma.sertifikat.createMany({ data: batch });
      inserted += result.count;
    }

    // Update existing records
    for (const { id, data } of toUpdate) {
      try {
        await prisma.sertifikat.update({ where: { id }, data });
        updated++;
      } catch (err: any) {
        errors.push(err?.message || 'update error');
      }
    }

    const details = JSON.stringify({
      totalFetched: rows.length,
      valid: validRows.length,
      invalid: invalidRows,
      inserted,
      updated,
    });

    await prisma.syncLog.create({
      data: {
        status: 'success',
        source: 'google-sheets',
        totalRows: inserted + updated,
        message: `${inserted} baru, ${updated} diperbarui, ${invalidRows} invalid`,
        details,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi berhasil: ${inserted} data baru, ${updated} diperbarui`,
      total: rows.length,
      inserted,
      updated,
      invalid: invalidRows,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal sinkronisasi',
    }, { status: 500 });
  } finally {
    exec('npm run analisis', { cwd: process.cwd() }, (err, stdout) => {
      if (err) console.error('Analisis error:', err.message);
      else console.log('Analisis:', stdout.slice(-200));
    });
  }
}
