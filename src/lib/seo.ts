import { SITE_CONFIG } from '@/lib/constants';
import { PRODUCTS } from '@/data/products';
import { FAQS } from '@/data/faqs';

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.siteUrl}/#organization`,
    name: SITE_CONFIG.siteName,
    url: SITE_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: SITE_CONFIG.ogImage,
      width: '200',
      height: '200',
    },
    sameAs: [
      SITE_CONFIG.siteUrl,
      'https://www.instagram.com/watchtown_in/',
      'https://chat.whatsapp.com/EqFzIkN7VAk4sEipabrqEU',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.phone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.siteUrl}/#website`,
    url: SITE_CONFIG.siteUrl,
    name: SITE_CONFIG.siteName,
    publisher: {
      '@id': `${SITE_CONFIG.siteUrl}/#organization`,
    },
    inLanguage: SITE_CONFIG.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.siteUrl}/?s={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top First Copy Watches in India',
    description:
      'Explore premium 7AA replica watches from brands like Rolex, Audemars Piguet, Patek Philippe, Hublot, and Omega.',
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.slice(0, 30).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        image: product.image,
        url: product.url,
        description: `Buy ${product.name} online at best price in India with free shipping and cash on delivery.`,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: SITE_CONFIG.currency,
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          url: product.url,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '156',
        },
      },
    })),
  };
}

export function getFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'First Copy Watches',
        item: `${SITE_CONFIG.siteUrl}/product-category/first-copy-watches/`,
      },
    ],
  };
}
