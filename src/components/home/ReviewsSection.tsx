import React from 'react';
import { REVIEWS_HTML } from '@/data/html/reviews';

export function ReviewsSection() {
  return (
    <section
      aria-label="Customer Reviews"
      dangerouslySetInnerHTML={{ __html: REVIEWS_HTML }}
      suppressHydrationWarning
    />
  );
}
