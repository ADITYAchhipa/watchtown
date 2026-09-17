import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error('Error fetching product:', err);
    return NextResponse.json({ error: 'Failed to fetch product.' }, { status: 500 });
  }
}

export async function PUT(
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

    const allowedFields = {
      name: body.name,
      brand: body.brand,
      price: body.price,
      originalPrice: body.originalPrice,
      image: body.image,
      hoverImage: body.hoverImage,
      categories: body.categories,
      rating: body.rating,
      reviewCount: body.reviewCount,
      badge: body.badge,
      url: body.url,
      stock: body.stock,
      inStock: body.inStock,
      featured: body.featured,
      description: body.description,
      sku: body.sku,
    };
    // Remove undefined keys
    const sanitized = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    );
    const updated = updateProduct(id, sanitized);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
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
    const success = deleteProduct(id);

    if (!success) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
