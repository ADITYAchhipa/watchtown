import React from 'react';
import { HERO_HTML } from '@/data/html/hero';

export function HeroSection() {
  return (
    <section
      aria-label="Hero Section and Trust Badges"
      dangerouslySetInnerHTML={{ __html: HERO_HTML }}
      suppressHydrationWarning
    />
  );
}
