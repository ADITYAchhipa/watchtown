import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    let rateData = rateLimitMap.get(ip);
    if (!rateData || now > rateData.resetTime) {
      rateData = { count: 1, resetTime: now + 60 * 60 * 1000 };
    } else {
      rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > 3) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, password, role = 'customer', adminSecret } = body;

    if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Name, email, and password must be valid strings.' },
        { status: 400 }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    
    if (adminSecret && typeof adminSecret !== 'string') {
      return NextResponse.json({ error: 'Admin secret must be a string.' }, { status: 400 });
    }

    const result = await registerUser(name, email, password, role, adminSecret);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
