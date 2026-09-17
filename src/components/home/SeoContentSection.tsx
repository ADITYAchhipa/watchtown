import React from 'react';
import { SEO_CONTENT_HTML } from '@/data/html/seoContent';

export function SeoContentSection() {
  return (
    <section
      aria-label="SEO Buying Guides and Frequently Asked Questions"
      dangerouslySetInnerHTML={{ __html: SEO_CONTENT_HTML }}
      suppressHydrationWarning
    />
  );
}
