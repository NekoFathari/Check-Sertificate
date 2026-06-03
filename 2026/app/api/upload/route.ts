import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { getPrisma } from '@/lib/prisma';
import { parseFile, validateRows } from '@/lib/file-parser';
import { getAuthUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'upload';

    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 });
    }

    const { rows, errors: parseErrors } = await parseFile(file);

    if (parseErrors.length > 0 && rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Gagal membaca file',
        errors: parseErrors,
      }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'File kosong' }, { status: 400 });
    }

    if (mode === 'preview') {
      const preview = rows.slice(0, 5);
      const validation = validateRows(rows);
      return NextResponse.json({
        success: true,
        preview,
        totalRows: rows.length,
        validCount: validation.validRows.length,
        errorCount: validation.errors.length,
        validationErrors: validation.errors.slice(0, 10),
      });
    }

    const { validRows, errors: validationErrors } = validateRows(rows);

    if (validRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada data valid',
        errors: validationErrors,
      }, { status: 400 });
    }

    try {
      // Fetch all existing records for dedup
      const existingList = await prisma.sertifikat.findMany({
        where: {
          nomor_sertif: { in: validRows.map((r) => r.nomor_sertif).filter(Boolean) },
        },
        select: { id: true, nomor_sertif: true, nama_acara: true },
      });

      const existingMap = new Map<string, string>();
      for (const e of existingList) {
        existingMap.set(`${e.nomor_sertif}::${e.nama_acara}`, e.id);
      }

      const toInsert: any[] = [];
      const toUpdate: { id: string; data: any }[] = [];

      for (const row of validRows) {
        const key = `${row.nomor_sertif}::${row.nama_acara}`;
        const recordData = {
          nama: row.nama || '',
          nama_acara: row.nama_acara || '',
          nomor_sertif: row.nomor_sertif || '',
          asal: row.asal || '',
          kab_kot: row.kab_kot || '',
          provinsi: row.provinsi || '',
          status: row.status || 'Aktif',
          kategori: row.kategori || null,
        };

        if (existingMap.has(key)) {
          toUpdate.push({ id: existingMap.get(key)!, data: recordData });
        } else {
          toInsert.push(recordData);
        }
      }

      const BATCH_SIZE = 200;
      let inserted = 0;
      let updated = 0;

      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE);
        const result = await prisma.sertifikat.createMany({ data: batch });
        inserted += result.count;
      }

      for (const { id, data } of toUpdate) {
        try {
          await prisma.sertifikat.update({ where: { id }, data });
          updated++;
        } catch {}
      }

      return NextResponse.json({
        success: true,
        message: `${inserted} baru, ${updated} diperbarui`,
        inserted,
        updated,
        total: validRows.length,
        validationErrors: validationErrors.slice(0, 10),
      });
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        message: err?.message || 'Gagal import data',
        validationErrors: validationErrors.slice(0, 10),
      }, { status: 500 });
    } finally {
      exec('npm run analisis', { cwd: process.cwd() }, (err, stdout) => {
        if (err) console.error('Analisis error:', err.message);
        else console.log('Analisis:', stdout.slice(-200));
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal upload file',
    }, { status: 500 });
  }
}
