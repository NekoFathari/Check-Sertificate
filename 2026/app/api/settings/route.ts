import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-server';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload || !payload.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: payload.email as string } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        theme: user.theme,
        emailNotifications: user.emailNotifications,
        uploadNotifications: user.uploadNotifications,
        syncNotifications: user.syncNotifications,
        googleSheetsSettings: user.googleSheetsSettings ? JSON.parse(user.googleSheetsSettings) : null,
        lastPasswordChange: null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload || !payload.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { email: payload.email as string } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        theme: body.theme ?? user.theme,
        emailNotifications: body.emailNotifications ?? user.emailNotifications,
        uploadNotifications: body.uploadNotifications ?? user.uploadNotifications,
        syncNotifications: body.syncNotifications ?? user.syncNotifications,
        googleSheetsSettings: body.googleSheetsSettings !== undefined
          ? JSON.stringify(body.googleSheetsSettings)
          : user.googleSheetsSettings,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        theme: updated.theme,
        emailNotifications: updated.emailNotifications,
        uploadNotifications: updated.uploadNotifications,
        syncNotifications: updated.syncNotifications,
        googleSheetsSettings: updated.googleSheetsSettings ? JSON.parse(updated.googleSheetsSettings) : null,
        lastPasswordChange: null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 400 });
  }
}
