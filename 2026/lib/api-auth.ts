import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-server';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  if (!payload) return null;
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    role: payload.role as string,
  };
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest, context?: any) => {
    const user = await getAuthUser(req);
    if (!user) {
      const { NextResponse } = await import('next/server');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, context, user);
  };
}
