# WatchTown - Luxury Watches E-Commerce Platform

A production-grade, full-stack Next.js 16 and React 19 e-commerce web platform engineered for high performance, visual fidelity, seamless order fulfillment, and advanced Search Engine Optimization (SEO).

WatchTown features a dual-persistence architecture (MongoDB Atlas with automatic local fallback), cloud media management via AWS S3 / Cloudflare R2, OTP-based and credentialed authentication with Resend email delivery, real-time inventory management, and an admin management backoffice.

---

## 🌟 Key Highlights & Features

### 🛍️ Storefront & User Experience
- **Pixel-Perfect Luxury Design**: Retains rich typography, fluid layouts, responsive drawer navigations, and luxury watch aesthetics.
- **Dynamic Product Catalog (`/shop`, `/product/[id]`)**:
  - Live stock status indicators (`In Stock`, `Low Stock`, `Out of Stock`).
  - Search, sort by price/rating/newest, and filter by brand/category.
  - Multi-image zoom gallery, specifications table, trust badges, and direct WhatsApp order CTA.
- **Cart & Wishlist Management (`/cart`, `/wishlist`)**:
  - Slide-out quick cart drawer and dedicated cart review.
  - Wishlist persistence for saved timepieces.
  - Direct checkout flow with support for coupon codes, shipping address calculation, and payment notes.
- **Order Tracking & Confirmation (`/track-order`, `/order-success`)**:
  - Real-time order lookup by Order ID or email/phone.
  - Visual status timeline: `Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered` (or `Cancelled`).
- **Customer Trust & Proof (`/customer-reviews`, `/customer-trust`, `/live-dispatch-proof`)**:
  - Dedicated dispatch gallery and customer reviews proof showcase.

---

### 🛡️ Authentication & Customer Portal (`/account`)
- **Secure Password & Passwordless OTP Auth**:
  - Email/Password login and registration powered by **PBKDF2 SHA-512** key derivation with individual salts.
  - 6-digit one-time password (OTP) verification powered by **Resend** transactional emails.
  - HMAC-signed cookie sessions with automatic expiration and session revocation safeguards.
- **Customer Account Dashboard**:
  - View personal order history with live fulfillment statuses.
  - Manage shipping addresses, contact details, and account preferences.

---

### 💼 Admin Operations Backoffice (`/admin`)
- **Protected Access (`/admin/login`, `/admin/register`)**:
  - Role-based authorization (`admin` vs `customer`).
  - Registration protected by a secret key (`ADMIN_REGISTRATION_SECRET`).
- **Business Intelligence & Metrics (`/api/admin/stats`)**:
  - Real-time KPI cards: Total Revenue, Total Orders, Active Products, Out-of-Stock count, and Average Order Value (AOV).
- **Product & Inventory Management**:
  - Add, edit, or delete watch models with pricing, sale discounts, specifications, and SKU.
  - Instant stock availability toggle directly from the list view.
  - Integrated cloud image uploader (`/api/admin/upload`) targeting AWS S3 or compatible object storage.
- **Order Processing & Fulfillment**:
  - View incoming orders, customer details, shipping address, payment method, and purchased items.
  - Update order delivery status with automatic customer status synchronization.

---

### 🗄️ Dual-Engine Data Layer
- **MongoDB Atlas Integration**: Native MongoDB driver connection with connection pooling for high-concurrency production deployments.
- **Zero-Config Local JSON Fallback**: Automatically activates when `MONGODB_URI` is unset. Stores products, orders, users, and OTPs in `./data/` using atomic file writes to ensure seamless local development without external dependencies.

---

### 🚀 Performance & SEO Engine
- **Next.js 16 App Router & Turbopack**: Blazing-fast static generation (SSG) with on-demand dynamic rendering.
- **Typography & CWV Optimization**: Zero Cumulative Layout Shift (CLS) via `next/font/google` (`Urbanist`, `Poppins`, `Playfair Display`).
- **Structured Data (JSON-LD Schemas)**:
  - `Organization`: Brand identity, logo, and customer support points.
  - `WebSite`: SearchAction sitelinks box.
  - `ItemList`: Rich snippet product lists.
  - `FAQPage`: Expandable SERP question-and-answer snippets.
  - `BreadcrumbList`: Enhanced navigational breadcrumbs on search engines.
- **Search Engine Discovery**:
  - Dynamic XML Sitemap (`/sitemap.xml`)
  - Configurable Crawler Directives (`/robots.txt`)
  - Progressive Web App Manifest (`/manifest.webmanifest`)

---

## 📁 Directory Structure

```
watchtown/
├── data/                             # Local JSON database storage (fallback mode)
│   ├── products.json                 # Products catalog
│   ├── orders.json                   # Placed customer orders
│   └── users.json                    # Customer and admin accounts
├── public/                           # Static assets, icons, and fonts
├── src/
│   ├── app/                          # Next.js App Router routes & API endpoints
│   │   ├── (storefront)/
│   │   │   ├── page.tsx              # Luxury storefront homepage
│   │   │   ├── shop/                 # Product catalog & filterable search
│   │   │   ├── product/[id]/         # Dynamic single product page
│   │   │   ├── cart/                 # Shopping cart view
│   │   │   ├── checkout/             # Order checkout page
│   │   │   ├── order-success/        # Post-purchase confirmation
│   │   │   ├── track-order/          # Live order status lookup
│   │   │   ├── wishlist/             # Saved items
│   │   │   ├── customer-reviews/     # Verified customer testimonials
│   │   │   ├── live-dispatch-proof/  # Real-time packaging & dispatch photos
│   │   │   ├── customer-trust/       # Trust & guarantee overview
│   │   │   └── (legal & policies)/   # Terms, Privacy, Refund, Shipping
│   │   ├── account/                  # Customer auth & dashboard
│   │   ├── admin/                    # Admin backoffice
│   │   │   ├── page.tsx              # Operations dashboard & metrics
│   │   │   ├── login/page.tsx        # Admin login
│   │   │   └── register/page.tsx     # Admin registration (secret-guarded)
│   │   ├── api/                      # Full REST API endpoints
│   │   │   ├── admin/
│   │   │   │   ├── stats/            # Dashboard KPI metrics
│   │   │   │   └── upload/           # AWS S3 image uploader
│   │   │   ├── auth/
│   │   │   │   ├── login/            # Password authentication
│   │   │   │   ├── register/         # User registration
│   │   │   │   ├── send-otp/         # Email OTP generation & dispatch
│   │   │   │   ├── logout/           # Session cookie invalidation
│   │   │   │   └── me/               # Current session validator
│   │   │   ├── orders/               # Order placement & lookup
│   │   │   │   └── [id]/             # Order detail & status update
│   │   │   └── products/             # Product catalog API
│   │   │       ├── [id]/             # Single product CRUD
│   │   │       └── [id]/stock/       # Stock availability toggle
│   │   ├── layout.tsx                # Root layout with fonts, JSON-LD & meta
│   │   ├── not-found.tsx             # Branded 404 handler
│   │   ├── robots.ts                 # Dynamic robots.txt
│   │   ├── sitemap.ts                # Dynamic XML sitemap
│   │   └── manifest.ts               # Web App Manifest (PWA)
│   ├── components/
│   │   ├── admin/                    # Admin backoffice components
│   │   ├── home/                     # Homepage modular sections
│   │   ├── layout/                   # Header, Footer, Drawers, MobileToolbar
│   │   ├── seo/                      # Schema.org JSON-LD injectors
│   │   └── ui/                       # Toast, Scroll-to-Top, WhatsApp buttons
│   ├── lib/                          # Core server utilities & database adapters
│   │   ├── auth.ts                   # PBKDF2 hashing, sessions & tokens
│   │   ├── db.ts                     # Unified product database (MongoDB / JSON)
│   │   ├── mongodb.ts                # MongoDB connection client & pool
│   │   ├── orders.ts                 # Unified order database (MongoDB / JSON)
│   │   ├── otp.ts                    # OTP generation, storage & verification
│   │   ├── resend.ts                 # Email sender service via Resend
│   │   ├── s3.ts                     # AWS S3 / Cloudflare R2 client
│   │   └── seo.ts                    # Schema generation helpers
│   ├── styles/                       # Global stylesheets & design system
│   └── types/                        # TypeScript definitions (Product, Order, User, etc.)
├── .env.example                      # Environment variables template
├── next.config.mjs                   # Remote image domains & CSP headers
├── package.json                      # Dependencies & NPM scripts
└── tsconfig.json                     # Strict TypeScript config
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root based on [`.env.example`](file:///Users/sama/watchtown/.env.example):

```env
# -----------------------------------------------------------------------------
# 1. MongoDB Database (Optional - Defaults to local JSON storage if omitted)
# -----------------------------------------------------------------------------
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/watchtown?retryWrites=true&w=majority
MONGODB_DB=watchtown

# -----------------------------------------------------------------------------
# 2. AWS S3 Storage (For Product Image Uploads in Admin)
# -----------------------------------------------------------------------------
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=your_s3_bucket_name
# Optional custom CDN domain (e.g., Cloudflare or CloudFront)
# AWS_S3_CUSTOM_DOMAIN=cdn.watchtown.in

# -----------------------------------------------------------------------------
# 3. Security Secrets
# -----------------------------------------------------------------------------
# 64-character secret key for signing auth session cookies
SESSION_SECRET=your_super_secret_session_key_min_32_characters

# Secret passphrase required to register as an administrator
ADMIN_REGISTRATION_SECRET=your_secure_admin_passphrase_here

# -----------------------------------------------------------------------------
# 4. Email Service (Resend for Registration & Login OTPs)
# -----------------------------------------------------------------------------
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=WatchTown <onboarding@resend.dev>
```

> [!TIP]
> If `MONGODB_URI` is left blank, the application will effortlessly operate using the local `./data/*.json` filesystem database. This allows for instant local development without configuring external cloud services.

---

## 🔌 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Query products (supports search, category, sort, page) | Public |
| `POST` | `/api/products` | Create a new product entry | Admin |
| `GET` | `/api/products/:id` | Fetch product details by ID or slug | Public |
| `PUT` | `/api/products/:id` | Update product details | Admin |
| `DELETE` | `/api/products/:id` | Remove a product from the catalog | Admin |
| `POST` | `/api/products/:id/stock` | Toggle stock availability (`in_stock` / `out_of_stock`) | Admin |
| `GET` | `/api/orders` | List orders (filtered by user session or all for admin) | User / Admin |
| `POST` | `/api/orders` | Place a new customer order | Public |
| `GET` | `/api/orders/:id` | Get single order status & tracking details | Public / User |
| `PUT` | `/api/orders/:id` | Update order fulfillment status | Admin |
| `POST` | `/api/admin/upload` | Upload watch media to AWS S3 storage | Admin |
| `GET` | `/api/admin/stats` | Retrieve real-time sales, order, and stock metrics | Admin |
| `POST` | `/api/auth/register` | Create customer or admin account | Public |
| `POST` | `/api/auth/login` | Log in with email & password | Public |
| `POST` | `/api/auth/send-otp` | Request 6-digit one-time password via email | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | Authenticated |
| `POST` | `/api/auth/logout` | Clear authentication session cookies | Authenticated |

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **npm** or **pnpm** / **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```
Edit `.env.local` to configure your security secrets and optional MongoDB/S3/Resend credentials.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🔐 Admin Setup Walkthrough

1. Set `ADMIN_REGISTRATION_SECRET` in your `.env.local` file.
2. Navigate to [http://localhost:3000/admin/register](http://localhost:3000/admin/register).
3. Fill in your Name, Email, Password, and your configured `ADMIN_REGISTRATION_SECRET`.
4. Once registered, log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the operations dashboard.

---

## 🔍 SEO & Crawl Verification Endpoints
- **Storefront**: [http://localhost:3000/](http://localhost:3000/)
- **Product Catalog**: [http://localhost:3000/shop](http://localhost:3000/shop)
- **Dynamic XML Sitemap**: [http://localhost:3000/sitemap.xml](http://localhost:3000/sitemap.xml)
- **Crawler Directives**: [http://localhost:3000/robots.txt](http://localhost:3000/robots.txt)
- **Web App Manifest**: [http://localhost:3000/manifest.webmanifest](http://localhost:3000/manifest.webmanifest)
