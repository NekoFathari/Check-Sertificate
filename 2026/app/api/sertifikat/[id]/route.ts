import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.sertifikat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Sertifikat tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.sertifikat.update({
      where: { id },
      data: {
        nama: body.nama ?? existing.nama,
        nama_acara: body.nama_acara ?? existing.nama_acara,
        nomor_sertif: body.nomor_sertif ?? existing.nomor_sertif,
        asal: body.asal ?? existing.asal,
        kab_kot: body.kab_kot ?? existing.kab_kot,
        provinsi: body.provinsi ?? existing.provinsi,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal memperbarui sertifikat',
    }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const { id } = await params;

    const existing = await prisma.sertifikat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Sertifikat tidak ditemukan' }, { status: 404 });
    }

    await prisma.sertifikat.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Sertifikat berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal menghapus sertifikat',
    }, { status: 400 });
  }
}
