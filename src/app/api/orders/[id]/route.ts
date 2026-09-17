import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/orders';
import { getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (session.role !== 'admin' && session.email !== order.customer.email) {
      return NextResponse.json(
        { error: 'Unauthorized to view this order.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error('Error fetching order:', err);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updated = updateOrderStatus(id, {
      status: body.status,
      trackingNumber: body.trackingNumber,
      courier: body.courier,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error('Error updating order:', err);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
