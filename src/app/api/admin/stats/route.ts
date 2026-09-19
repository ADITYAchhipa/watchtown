import { NextResponse } from 'next/server';
import { getInventoryStats } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const stats = await getInventoryStats();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return NextResponse.json(
      { error: 'Failed to fetch inventory statistics.' },
      { status: 500 }
    );
  }
}
