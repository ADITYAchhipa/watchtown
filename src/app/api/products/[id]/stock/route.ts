import { NextRequest, NextResponse } from 'next/server';
import { updateStock } from '@/lib/db';
import { getSession } from '@/lib/auth';

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

    if (body.stock === undefined && body.delta === undefined) {
      return NextResponse.json(
        { error: 'Either "stock" or "delta" must be provided.' },
        { status: 400 }
      );
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isFinite(stock)) {
        return NextResponse.json({ error: 'Invalid stock value.' }, { status: 400 });
      }
    }

    if (body.delta !== undefined) {
      const delta = Number(body.delta);
      if (!Number.isFinite(delta)) {
        return NextResponse.json({ error: 'Invalid delta value.' }, { status: 400 });
      }
    }

    const updated = updateStock(id, {
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      delta: body.delta !== undefined ? Number(body.delta) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: updated,
      newStock: updated.stock,
      inStock: updated.inStock,
    });
  } catch (err) {
    console.error('Error updating stock:', err);
    return NextResponse.json({ error: 'Failed to update stock.' }, { status: 500 });
  }
}
