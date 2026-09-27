import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBrandsList, addBrand, deleteBrand } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await getBrandsList();
    return NextResponse.json({ success: true, brands });
  } catch (err: any) {
    console.error('Error fetching brands list:', err);
    return NextResponse.json({ error: 'Failed to fetch brands list' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, logo, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Brand name is required.' }, { status: 400 });
    }

    const brand = await addBrand({
      name: name.trim(),
      logo: typeof logo === 'string' ? logo.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : undefined,
    });

    const updatedBrands = await getBrandsList();

    // Revalidate storefront and admin paths
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Brand "${brand.name}" added successfully.`,
      brand,
      brands: updatedBrands,
    });
  } catch (err: any) {
    console.error('Error adding brand:', err);
    return NextResponse.json({ error: err.message || 'Failed to add brand' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let target = searchParams.get('name') || searchParams.get('id');
    let deleteProducts = searchParams.get('deleteProducts') === 'true' || searchParams.get('cascade') === 'true';

    if (!target) {
      try {
        const body = await req.json();
        target = body.name || body.id;
        if (body.deleteProducts !== undefined) deleteProducts = Boolean(body.deleteProducts);
        if (body.cascade !== undefined) deleteProducts = Boolean(body.cascade);
      } catch {
        // empty body ok
      }
    }

    if (!target) {
      return NextResponse.json({ error: 'Brand name or id is required for deletion.' }, { status: 400 });
    }

    const result = await deleteBrand(target, deleteProducts);

    if (result.hasProducts) {
      return NextResponse.json(
        {
          success: false,
          hasProducts: true,
          count: result.count,
          brandName: result.brandName,
          error: `Cannot delete brand "${result.brandName}". There are ${result.count} timepiece(s) linked to this brand in the catalog. Please delete the watches first, or confirm deleting all watches under this brand.`,
        },
        { status: 400 }
      );
    }

    const updatedBrands = await getBrandsList();

    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message:
        (result.deletedProductsCount ?? 0) > 0
          ? `Brand "${result.brandName}" and ${result.deletedProductsCount} timepiece(s) deleted successfully.`
          : `Brand "${result.brandName}" removed successfully.`,
      brands: updatedBrands,
      deletedProductsCount: result.deletedProductsCount || 0,
    });
  } catch (err: any) {
    console.error('Error deleting brand:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete brand' }, { status: 500 });
  }
}
