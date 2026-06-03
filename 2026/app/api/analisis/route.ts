import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { getPrisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get('refresh') === 'true';

    if (refresh) {
      await new Promise<void>((resolve, reject) => {
        exec('npm run analisis', { cwd: process.cwd() }, (err, stdout) => {
          if (err) reject(new Error(err.message || 'Gagal menjalankan analisis'));
          else resolve();
        });
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal menjalankan analisis',
    }, { status: 500 });
  }

  try {
    const prisma = getPrisma();
    const data = await prisma.analisisPeserta.findMany({
      orderBy: [{ namaAcara: 'asc' }, { kategori: 'asc' }, { asalType: 'asc' }],
    });

    const sertiTotal = await prisma.sertifikat.count();

    return NextResponse.json({
      success: true,
      totalRecords: sertiTotal,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal memuat analisis',
    }, { status: 500 });
  }
}
