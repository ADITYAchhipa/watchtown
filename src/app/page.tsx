import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MainContent } from '@/components/home/MainContent';
import { Overlays } from '@/components/layout/Overlays';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { getProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { products } = await getProducts({ limit: 100, sort: 'newest' });

  return (
    <>
      <div className="wd-page-wrapper website-wrapper" suppressHydrationWarning>
        <Header />
        <MainContent products={products} />
        <Footer />
      </div>

      <Overlays />
      <ScrollToTop />
      <WhatsAppButton />
    </>
  );
}
