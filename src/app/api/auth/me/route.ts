import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401, headers: { 'Cache-Control': 'no-store, private' } });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    }, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (err) {
    console.error('Session check error:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500, headers: { 'Cache-Control': 'no-store, private' } });
  }
}
