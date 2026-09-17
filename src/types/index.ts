export interface Product {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  categories: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
  url: string;
  stock?: number;
  inStock?: boolean;
  featured?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  expiresAt: number;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalBrands: number;
  totalCategories: number;
}

export interface CartItem {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  productId: string | number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerAddress {
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  totalAmount?: number;
  paymentMethod: 'cod' | 'upi';
  status: OrderStatus;
  trackingNumber?: string;
  trackingAwb?: string;
  courier?: string;
  trackingCourier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  confirmedCount: number;
  dispatchedCount: number;
  deliveredCount: number;
}

export interface Category {
  id: string;
  name: string;
  url: string;
  image?: string;
  count?: number;
}

export interface Brand {
  id: string;
  name: string;
  url: string;
  logo?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  url: string;
  date: string;
  excerpt: string;
  image: string;
  author: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  title: string;
  description: string;
  keywords: string[];
  author: string;
  phone: string;
  whatsappUrl: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  ogImage: string;
}
