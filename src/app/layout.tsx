import type { Metadata, Viewport } from 'next';
import { Urbanist, Poppins, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { THEME_STYLESHEETS } from '@/data/stylesheets';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_CONFIG } from '@/lib/constants';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { DynamicCartDrawer } from '@/components/cart/DynamicCartDrawer';
import { PageInteractions } from '@/components/home/PageInteractions';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-urbanist',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-playfair',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.siteName}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.siteUrl }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.siteName,
  applicationName: SITE_CONFIG.siteName,
  generator: 'Next.js 15',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_CONFIG.siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.siteUrl,
    siteName: SITE_CONFIG.siteName,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: 'WatchTown Luxury First Copy Watches',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: '@watchtown',
  },
  icons: {
    icon: [
      {
        url: 'https://watchtown.in/wp-content/uploads/2025/05/cropped-android-chrome-512x512-2-32x32.png',
        sizes: '32x32',
      },
      {
        url: 'https://watchtown.in/wp-content/uploads/2025/05/cropped-android-chrome-512x512-2-192x192.png',
        sizes: '192x192',
      },
    ],
    apple: [
      {
        url: 'https://watchtown.in/wp-content/uploads/2025/05/cropped-android-chrome-512x512-2-180x180.png',
        sizes: '180x180',
      },
    ],
    shortcut: ['https://watchtown.in/wp-content/uploads/2025/05/cropped-android-chrome-512x512-2-32x32.png'],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-US"
      prefix="og: https://ogp.me/ns#"
      className={`${urbanist.variable} ${poppins.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://watchtown.in" />
        <link rel="dns-prefetch" href="https://watchtown.in" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Theme External Stylesheets */}
        {THEME_STYLESHEETS.map((sheet, index) => (
          <link
            key={`theme-sheet-${index}-${sheet.id || index}`}
            rel="stylesheet"
            id={sheet.id}
            href={sheet.href}
            media={sheet.media || 'all'}
          />
        ))}

        <JsonLd />
      </head>
      <body
        className="home page-template-default page page-id-17 theme-woodmart woocommerce-no-js wrapper-custom categories-accordion-on woodmart-ajax-shop-on sticky-toolbar-on elementor-default elementor-kit-6 elementor-page elementor-page-17"
        suppressHydrationWarning
      >
        <CartProvider>
          <WishlistProvider>
            <PageInteractions />
            {children}
            <DynamicCartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
