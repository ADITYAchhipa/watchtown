import React from 'react';
import { OVERLAYS_HTML } from '@/data/html/overlays';

export function Overlays() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: OVERLAYS_HTML }}
      suppressHydrationWarning
    />
  );
}
