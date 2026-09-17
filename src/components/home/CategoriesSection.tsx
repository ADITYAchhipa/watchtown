import React from 'react';
import { CATEGORIES_HTML } from '@/data/html/categories';

export function CategoriesSection() {
  return (
    <section
      aria-label="Product Categories and Value Propositions"
      dangerouslySetInnerHTML={{ __html: CATEGORIES_HTML }}
      suppressHydrationWarning
    />
  );
}
