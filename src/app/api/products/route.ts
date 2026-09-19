import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  createProduct,
  getAllBrands,
  getAllCategories,
  GetProductsQuery,
} from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsedLimit = searchParams.has('limit') ? parseInt(searchParams.get('limit') || '50', 10) : undefined;
    const limit = parsedLimit !== undefined ? Math.min(100, Math.max(1, parsedLimit)) : undefined;

    const query: GetProductsQuery = {
      search: searchParams.get('search') || undefined,
      brand: searchParams.get('brand') || undefined,
      category: searchParams.get('category') || undefined,
      stockStatus: (searchParams.get('stockStatus') as GetProductsQuery['stockStatus']) || undefined,
      sort: (searchParams.get('sort') as GetProductsQuery['sort']) || undefined,
      featured: searchParams.has('featured')
        ? searchParams.get('featured') === 'true'
        : undefined,
      page: searchParams.has('page')
        ? parseInt(searchParams.get('page') || '1', 10)
        : 1,
      limit,
    };

    const result = await getProducts(query);
    const brands = await getAllBrands();
    const categories = await getAllCategories();

    return NextResponse.json({
      success: true,
      ...result,
      meta: {
        brands,
        categories,
      },
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json(
      { error: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, price, stock } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Product name and price are required.' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive finite number.' },
        { status: 400 }
      );
    }

    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative integer.' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name: body.name.trim(),
      brand: body.brand?.trim() || 'WatchTown Luxury',
      sku:
        body.sku?.trim() ||
        `WT-${(body.brand || 'LUX').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : Math.round(Number(body.price) * 1.6),
      image: body.image?.trim() || 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg',
      hoverImage: body.hoverImage?.trim() || undefined,
      categories: Array.isArray(body.categories) && body.categories.length > 0 ? body.categories : ['Watches'],
      rating: body.rating ? Number(body.rating) : 5,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 10,
      badge: body.badge?.trim() || undefined,
      url: body.url?.trim() || `https://watchtown.in/product/${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
      stock: body.stock !== undefined ? Math.max(0, Number(body.stock)) : 10,
      inStock: (body.stock !== undefined ? Number(body.stock) : 10) > 0,
      featured: Boolean(body.featured),
      description: body.description?.trim() || 'Premium 7AA master copy luxury timepiece with warranty and luxury box.',
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json(
      { error: 'Failed to create product.' },
      { status: 500 }
    );
  }
}
