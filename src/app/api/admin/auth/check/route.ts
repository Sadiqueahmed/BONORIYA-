import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ authenticated: false });
    }

    const admin = await db.admin.findUnique({
      where: { id: sessionId },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, admin });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
