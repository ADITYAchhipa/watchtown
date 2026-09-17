import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import { ARTICLES } from '@/data/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_CONFIG.siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.siteUrl}/shop/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.siteUrl}/product-category/mens-watches/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.siteUrl}/product-category/womens-watches/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.siteUrl}/product-category/watch-types/automatic-watches/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.siteUrl}/product-category/brands/rolex-watches/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: cat.url,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((prod) => ({
    url: prod.url,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: article.url,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...coreRoutes, ...categoryRoutes, ...productRoutes, ...articleRoutes];
}
