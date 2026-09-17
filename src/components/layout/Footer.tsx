import React from 'react';
import { FOOTER_HTML } from '@/data/html/footer';

export function Footer() {
  return (
    <footer
      aria-label="Site Footer"
      dangerouslySetInnerHTML={{ __html: FOOTER_HTML }}
      suppressHydrationWarning
    />
  );
}
