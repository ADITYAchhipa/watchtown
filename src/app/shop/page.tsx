import React from 'react';
import type { Metadata } from 'next';
import { getProducts, getAllBrands, getAllCategories } from '@/lib/db';
import { ShopClient } from '@/components/shop/ShopClient';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Shop All First Copy Watches | Rolex, Patek, Audemars Piguet & More',
  description: 'Explore the complete WatchTown 7AA first copy watch catalog. Filter by brand, price, and movement with Cash on Delivery.',
};

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    brand?: string;
    category?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, brand, category, maxPrice, sort } = await searchParams;
  const { products } = getProducts({ limit: 200, sort: 'newest' });
  const brands = getAllBrands();
  const categories = getAllCategories();

  let initialPriceRange: 'all' | 'under_2500' | 'under_5000' | 'above_5000' = 'all';
  if (maxPrice === '2000' || maxPrice === '2500') initialPriceRange = 'under_2500';
  else if (maxPrice === '3000' || maxPrice === '5000') initialPriceRange = 'under_5000';

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header />
      <ShopClient
        initialProducts={products}
        brands={brands}
        categories={categories}
        initialSearch={search}
        initialBrand={brand}
        initialCategory={category}
        initialPriceRange={initialPriceRange}
        initialSort={sort as 'newest' | 'price_asc' | 'price_desc' | 'name_asc'}
      />
      <Footer />
    </div>
  );
}
