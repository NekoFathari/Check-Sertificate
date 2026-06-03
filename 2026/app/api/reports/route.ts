import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const data = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal memuat laporan',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const report = await prisma.report.create({
      data: {
        name: body.name || 'Anonim',
        email: body.email || null,
        nomor_sertif: body.nomor_sertif || null,
        message: body.message || '',
        category: body.category || 'other',
        status: 'open',
        imageData: body.imageData || null,
      },
    });
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal menyimpan laporan',
    }, { status: 400 });
  }
}
