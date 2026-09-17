import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getOrderStats, GetOrdersQuery } from '@/lib/orders';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parsedLimit = searchParams.has('limit') ? parseInt(searchParams.get('limit') || '50', 10) : 50;
    const limit = Math.min(100, Math.max(1, parsedLimit || 50));

    const query: GetOrdersQuery = {
      status: (searchParams.get('status') as GetOrdersQuery['status']) || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.has('page') ? parseInt(searchParams.get('page') || '1', 10) : 1,
      limit,
    };

    const result = getOrders(query);
    const stats = getOrderStats();

    return NextResponse.json({
      success: true,
      ...result,
      stats,
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, paymentMethod = 'cod', notes } = body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data. Customer details and items are required.' },
        { status: 400 }
      );
    }

    const result = createOrder({
      customer,
      items,
      paymentMethod,
      notes,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order }, { status: 201 });
  } catch (err) {
    console.error('Error creating order:', err);
    return NextResponse.json(
      { error: 'Failed to place order.' },
      { status: 500 }
    );
  }
}
