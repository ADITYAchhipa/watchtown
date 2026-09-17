import React from 'react';
import { MOBILE_TOOLBAR_HTML } from '@/data/html/mobileToolbar';

export function MobileToolbar() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: MOBILE_TOOLBAR_HTML }}
      suppressHydrationWarning
    />
  );
}
