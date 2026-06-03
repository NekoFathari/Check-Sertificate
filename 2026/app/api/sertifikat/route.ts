import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

export async function GET() {
  try {
    const prisma = getPrisma();
    const data = await prisma.sertifikat.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal memuat data',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const sertifikat = await prisma.sertifikat.create({
      data: {
        nama: body.nama || '',
        nama_acara: body.nama_acara || '',
        nomor_sertif: body.nomor_sertif || '',
        asal: body.asal || '',
        kab_kot: body.kab_kot || '',
        provinsi: body.provinsi || '',
        status: body.status || 'Aktif',
      },
    });
    return NextResponse.json({ success: true, data: sertifikat });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal membuat sertifikat',
    }, { status: 400 });
  }
}
