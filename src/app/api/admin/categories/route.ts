import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCategoriesList, addCategory, deleteCategory } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategoriesList();
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    console.error('Error fetching categories list:', err);
    return NextResponse.json({ error: 'Failed to fetch categories list' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, image, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Collection/Category name is required.' }, { status: 400 });
    }

    const category = await addCategory({
      name: name.trim(),
      image: typeof image === 'string' ? image.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : undefined,
    });

    const updatedCategories = await getCategoriesList();

    // Revalidate storefront and admin paths
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Collection "${category.name}" added successfully.`,
      category,
      categories: updatedCategories,
    });
  } catch (err: any) {
    console.error('Error adding category/collection:', err);
    return NextResponse.json({ error: err.message || 'Failed to add collection' }, { status: 500 });
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
      return NextResponse.json({ error: 'Category/Collection name or id is required for deletion.' }, { status: 400 });
    }

    const result = await deleteCategory(target, deleteProducts);

    if (result.hasProducts) {
      return NextResponse.json(
        {
          success: false,
          hasProducts: true,
          count: result.count,
          categoryName: result.categoryName,
          error: `Cannot delete collection "${result.categoryName}". There are ${result.count} timepiece(s) mapped to this collection. Please delete the watches first, or confirm deleting all watches in this collection.`,
        },
        { status: 400 }
      );
    }

    const updatedCategories = await getCategoriesList();

    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message:
        (result.deletedProductsCount ?? 0) > 0
          ? `Collection "${result.categoryName}" and ${result.deletedProductsCount} timepiece(s) deleted successfully.`
          : `Collection "${result.categoryName}" removed successfully.`,
      categories: updatedCategories,
      deletedProductsCount: result.deletedProductsCount || 0,
    });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete collection' }, { status: 500 });
  }
}
