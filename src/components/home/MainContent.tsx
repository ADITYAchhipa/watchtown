import React from 'react';
import {
  MAIN_CONTENT_TOP_PRE_HTML,
  MAIN_CONTENT_TOP_POST_HTML,
  MAIN_CONTENT_BOTTOM_HTML,
} from '@/data/html/mainContentSplit';
import { GenderBannersSection } from '@/components/home/GenderBannersSection';
import { DynamicProductsCatalog } from '@/components/home/DynamicProductsCatalog';
import { CustomerReviewsSection } from '@/components/home/CustomerReviewsSection';
import { Product, WhatsAppReview } from '@/types';

interface MainContentProps {
  products: Product[];
  reviews?: WhatsAppReview[];
}

export function MainContent({ products, reviews }: MainContentProps) {
  return (
    <>
      <div className="container wt-main-intro-container">
        <div
          dangerouslySetInnerHTML={{ __html: MAIN_CONTENT_TOP_PRE_HTML }}
          suppressHydrationWarning
        />
        <GenderBannersSection />
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: MAIN_CONTENT_TOP_POST_HTML }}
        suppressHydrationWarning
      />
      <DynamicProductsCatalog initialProducts={products} />
      <CustomerReviewsSection initialReviews={reviews} />
      <div
        dangerouslySetInnerHTML={{ __html: MAIN_CONTENT_BOTTOM_HTML }}
        suppressHydrationWarning
      />
    </>
  );
}

