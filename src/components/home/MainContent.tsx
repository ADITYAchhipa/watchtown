import React from 'react';
import { MAIN_CONTENT_TOP_HTML, MAIN_CONTENT_BOTTOM_HTML } from '@/data/html/mainContentSplit';
import { DynamicProductsCatalog } from '@/components/home/DynamicProductsCatalog';
import { Product } from '@/types';

interface MainContentProps {
  products: Product[];
}

export function MainContent({ products }: MainContentProps) {
  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: MAIN_CONTENT_TOP_HTML }}
        suppressHydrationWarning
      />
      <DynamicProductsCatalog initialProducts={products} />
      <div
        dangerouslySetInnerHTML={{ __html: MAIN_CONTENT_BOTTOM_HTML }}
        suppressHydrationWarning
      />
    </>
  );
}
