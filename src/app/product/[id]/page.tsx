import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductById, getProducts } from '@/lib/db';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SITE_CONFIG } from '@/lib/constants';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Watch Not Found | WatchTown',
    };
  }

  return {
    title: `Buy ${product.name} Online | Free Shipping & COD`,
    description: `Shop top-quality 7AA first-copy ${product.name} at WatchTown. ₹${product.price} only with Cash on Delivery and 7-day replacement warranty.`,
    openGraph: {
      title: `${product.name} - 7AA First Copy Watch`,
      description: `Get ${product.name} for ₹${product.price}. Free Express Shipping all over India.`,
      images: [
        {
          url: product.image,
          width: 600,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const { products: all } = await getProducts({ limit: 50 });
  const relatedProducts = all.filter(
    (p) => String(p.id) !== String(product.id) && (p.brand === product.brand || p.categories.some((c) => product.categories.includes(c)))
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description || `Premium 7AA replica watch by ${product.brand}`,
    sku: product.sku || `WT-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'WatchTown',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_CONFIG.siteUrl}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'WatchTown',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || '5.0',
      reviewCount: product.reviewCount || '15',
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
