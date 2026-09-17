import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart/',
          '/checkout/',
          '/my-account/',
          '/wp-admin/',
          '/*?*orderby=*',
          '/*?*filter_*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/cart/', '/checkout/', '/my-account/', '/wp-admin/'],
      },
    ],
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap.xml`,
  };
}
