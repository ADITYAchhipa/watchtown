import React from 'react';
import { TRENDING_HTML } from '@/data/html/trending';

export function TrendingProductsSection() {
  return (
    <section
      aria-label="First Copy Watches Catalog"
      dangerouslySetInnerHTML={{ __html: TRENDING_HTML }}
      suppressHydrationWarning
    />
  );
}
