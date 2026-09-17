import React from 'react';
import { HEADER_HTML } from '@/data/html/header';

export function Header() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: HEADER_HTML }}
      suppressHydrationWarning
    />
  );
}
