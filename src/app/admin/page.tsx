import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  getProducts,
  getInventoryStats,
  getAllBrands,
  getAllCategories,
} from '@/lib/db';
import { getOrders, getOrderStats } from '@/lib/orders';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const { products } = getProducts({ limit: 200, sort: 'newest' });
  const stats = getInventoryStats();
  const brands = getAllBrands();
  const categories = getAllCategories();
  const { orders } = getOrders({ limit: 100 });
  const orderStats = getOrderStats();

  return (
    <AdminDashboardClient
      initialSession={session}
      initialProducts={products}
      initialStats={stats}
      brands={brands}
      categories={categories}
      initialOrders={orders}
      initialOrderStats={orderStats}
    />
  );
}
