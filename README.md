# WatchTown - Next.js E-Commerce Platform

A production-grade, high-performance Next.js 15 conversion of the WatchTown luxury first-copy watches store, engineered for visual fidelity, Core Web Vitals performance, and advanced search engine optimization (SEO).

---

## 🚀 Key Highlights & Architecture

- **Pixel-Perfect Fidelity**: Preserves the exact UI, layouts, styles, fonts, and responsiveness of the original Woodmart + Elementor store.
- **Production Folder Structure**: Modularized clean architecture separating layout components, home sections, structured data, SEO libraries, and global styles.
- **Advanced SEO Optimizations**:
  - **Dynamic Metadata**: Complete OpenGraph, Twitter Cards, Canonical links, and Googlebot directives.
  - **Comprehensive JSON-LD Schemas**:
    - `Organization` with logo, contact points, and social profiles.
    - `WebSite` with Google Sitelinks Searchbox potentialAction.
    - `ItemList` product catalog for Google Rich Snippets.
    - `FAQPage` schema enabling expandable FAQ accordions directly on SERPs.
    - `BreadcrumbList` for breadcrumb SERP enhancements.
  - **Dynamic XML Sitemap** (`/sitemap.xml`) indexing core pages, category routes, product pages, and blog guides.
  - **Robots Configuration** (`/robots.txt`) with custom crawler directives.
  - **Web App Manifest** (`/manifest.webmanifest`) for PWA installability.
- **Performance & CWV (Core Web Vitals)**:
  - Zero Cumulative Layout Shift (CLS) with `next/font/google` preloading (`Urbanist`, `Poppins`, `Playfair Display`).
  - DNS-prefetch and preconnect directives for asset origins.
  - Replaced lazy-loading SVG placeholders with direct high-resolution asset paths.
  - Fast static page prerendering (SSG).

---

## 📁 Production Directory Structure

```
watchtown/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with fonts, SEO meta, stylesheets & JSON-LD
│   │   ├── page.tsx                  # Home page assembling all production sections
│   │   ├── not-found.tsx             # Custom branded 404 error page
│   │   ├── robots.ts                 # Dynamic robots.txt generator
│   │   ├── sitemap.ts                # Dynamic XML sitemap generator
│   │   └── manifest.ts               # Web App Manifest (PWA compliant)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Topbar, Logo, Navigation, Search, Cart trigger
│   │   │   ├── Footer.tsx            # Multi-column footer, trust seals, payment badges
│   │   │   ├── MobileDrawer.tsx      # Slide-out mobile menu with categories
│   │   │   ├── CartDrawer.tsx        # Slide-out shopping cart sidebar
│   │   │   └── MobileToolbar.tsx     # Sticky mobile bottom navigation
│   │   ├── home/
│   │   │   ├── HeroSection.tsx       # H1 heading, hero banner, trust badges ("Built on Trust")
│   │   │   ├── CategoriesSection.tsx # Category icons & value propositions
│   │   │   ├── TrendingProductsSection.tsx # Tabbed product catalog & loops
│   │   │   ├── ReviewsSection.tsx    # Customer feedback review screenshot carousel
│   │   │   ├── BudgetSection.tsx     # Watches under 2k/3k/5k and blog articles
│   │   │   ├── SeoContentSection.tsx # Keyword-rich copy and interactive FAQ accordion
│   │   │   └── PageInteractions.tsx  # Client-side drawer, accordion, & scroll controller
│   │   ├── ui/
│   │   │   ├── ScrollToTop.tsx       # Floating smooth scroll-to-top button
│   │   │   └── WhatsAppButton.tsx    # Floating WhatsApp order channel CTA
│   │   └── seo/
│   │       └── JsonLd.tsx            # Multi-schema JSON-LD structured data injector
│   ├── data/
│   │   ├── products.ts               # Structured product catalog extracted from WooCommerce
│   │   ├── categories.ts             # Categories data
│   │   ├── articles.ts               # Blog guides with metadata
│   │   ├── faqs.ts                   # FAQs with questions and detailed answers
│   │   ├── stylesheets.ts            # List of all 87 theme stylesheets
│   │   └── html/                     # Extracted modular HTML blocks
│   ├── lib/
│   │   ├── constants.ts              # Central site configuration and metadata constants
│   │   └── seo.ts                    # Schema.org JSON-LD generator functions
│   ├── styles/
│   │   ├── globals.css               # Global reset, typography, and interactive rules
│   │   └── inline-styles.css         # Extracted WordPress & Elementor custom CSS
│   └── types/
│       └── index.ts                  # TypeScript interfaces (Product, Category, Article, FAQ, etc.)
├── next.config.mjs                   # Remote image patterns and security headers
├── tsconfig.json                     # Strict TypeScript compiler options
└── package.json                      # Project dependencies and build scripts
```

---

## 🛠️ Getting Started

### Development
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Production Build
Create an optimized production build:
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

---

## 🔍 SEO Verification Endpoints
- **Home Page**: `http://localhost:3000/`
- **Sitemap**: `http://localhost:3000/sitemap.xml`
- **Robots.txt**: `http://localhost:3000/robots.txt`
- **Web App Manifest**: `http://localhost:3000/manifest.webmanifest`
