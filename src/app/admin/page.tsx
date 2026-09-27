import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  getProducts,
  getInventoryStats,
  getAllBrands,
  getAllCategories,
  getBrandsList,
  getCategoriesList,
} from '@/lib/db';
import { getOrders, getOrderStats } from '@/lib/orders';
import { getReviews } from '@/lib/reviews';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const { products } = await getProducts({ limit: 200, sort: 'newest' });
  const stats = await getInventoryStats();
  const brands = await getAllBrands();
  const categories = await getAllCategories();
  const brandRecords = await getBrandsList();
  const categoryRecords = await getCategoriesList();
  const { orders } = await getOrders({ limit: 100 });
  const orderStats = await getOrderStats();
  const reviews = await getReviews();

  return (
    <AdminDashboardClient
      initialSession={session}
      initialProducts={products}
      initialStats={stats}
      brands={brands}
      categories={categories}
      initialBrandsList={brandRecords}
      initialCategoriesList={categoryRecords}
      initialOrders={orders}
      initialOrderStats={orderStats}
      initialReviews={reviews}
    />
  );
}
