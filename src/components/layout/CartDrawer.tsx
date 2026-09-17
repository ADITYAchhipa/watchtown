import React from 'react';
import { CART_DRAWER_HTML } from '@/data/html/cartDrawer';

export function CartDrawer() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: CART_DRAWER_HTML }}
      suppressHydrationWarning
    />
  );
}
