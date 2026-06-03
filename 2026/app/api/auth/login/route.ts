import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth-server';
import { getPrisma } from '@/lib/prisma';

const FALLBACK_USERS = [
  { id: '1', name: 'Admin', email: 'admin@gmail.com', password: 'admin', role: 'admin' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check MongoDB first
    try {
      const prisma = getPrisma();
      const dbUser = await prisma.user.findUnique({ where: { email: emailLower } });

      if (dbUser && dbUser.password === password) {
        const token = await createToken({
          sub: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        });
        return NextResponse.json({
          success: true,
          token,
          user: { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role },
        });
      }

      if (dbUser && dbUser.password !== password) {
        return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
      }
    } catch {
      // DB not available, fall through to hardcoded
    }

    // Fallback to hardcoded users
    const fallbackUser = FALLBACK_USERS.find(
      (u) => u.email.toLowerCase() === emailLower && u.password === password
    );

    if (fallbackUser) {
      const token = await createToken({
        sub: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        role: fallbackUser.role,
      });
      return NextResponse.json({
        success: true,
        token,
        user: { id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role },
      });
    }

    return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal login' }, { status: 500 });
  }
}
