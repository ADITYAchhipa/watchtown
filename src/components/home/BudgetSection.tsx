import React from 'react';
import { BUDGET_HTML } from '@/data/html/budget';

export function BudgetSection() {
  return (
    <section
      aria-label="Budget Watch Collections and Latest Articles"
      dangerouslySetInnerHTML={{ __html: BUDGET_HTML }}
      suppressHydrationWarning
    />
  );
}
