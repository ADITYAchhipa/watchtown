import React from 'react';
import { MOBILE_NAV_HTML } from '@/data/html/mobileNav';

export function MobileDrawer() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: MOBILE_NAV_HTML }}
      suppressHydrationWarning
    />
  );
}
