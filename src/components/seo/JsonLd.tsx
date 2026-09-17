import React from 'react';
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getItemListSchema,
  getFaqSchema,
  getBreadcrumbSchema,
} from '@/lib/seo';

export function JsonLd() {
  const schemas = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getItemListSchema(),
    getFaqSchema(),
    getBreadcrumbSchema(),
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`ldjson-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
