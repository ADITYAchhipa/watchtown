import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: 'Failed to log out.' },
      { status: 500 }
    );
  }
}
