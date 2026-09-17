import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    let rateData = rateLimitMap.get(ip);
    if (!rateData || now > rateData.resetTime) {
      rateData = { count: 1, resetTime: now + 15 * 60 * 1000 };
    } else {
      rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > 5) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password must be valid strings.' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    
    rateLimitMap.delete(ip);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
