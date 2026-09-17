import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, InventoryStats } from '@/types';
import { SEED_PRODUCTS } from './seed-products';

const DB_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// In-memory cache for fast reads
let cache: Product[] | null = null;

function readProducts(): Product[] {
  if (cache) return cache;

  ensureDbDirectory();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    // Seed initial products
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf8');
    cache = [...SEED_PRODUCTS];
    return cache;
  }

  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    cache = JSON.parse(raw) as Product[];
    return cache;
  } catch (err) {
    console.error('Failed to read products DB, falling back to seed:', err);
    cache = [...SEED_PRODUCTS];
    return cache;
  }
}

function writeProducts(products: Product[]): void {
  ensureDbDirectory();
  cache = products;
  const tmpFile = `${PRODUCTS_FILE}.tmp.${process.pid}.${crypto.randomBytes(6).toString('hex')}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(products, null, 2), 'utf8');
    fs.renameSync(tmpFile, PRODUCTS_FILE);
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch {}
    throw err;
  }
}

export interface GetProductsQuery {
  search?: string;
  brand?: string;
  category?: string;
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'name_asc';
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function getProducts(query: GetProductsQuery = {}): {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
} {
  const all = readProducts();
  let list = [...all];

  // Search filter (name, brand, sku)
  if (query.search && query.search.trim()) {
    const s = query.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.brand && p.brand.toLowerCase().includes(s)) ||
        (p.sku && p.sku.toLowerCase().includes(s)) ||
        p.categories.some((c) => c.toLowerCase().includes(s))
    );
  }

  // Brand filter
  if (query.brand && query.brand !== 'all') {
    list = list.filter(
      (p) => p.brand && p.brand.toLowerCase() === query.brand?.toLowerCase()
    );
  }

  // Category filter
  if (query.category && query.category !== 'all') {
    list = list.filter((p) =>
      p.categories.some(
        (c) => c.toLowerCase() === query.category?.toLowerCase()
      )
    );
  }

  // Stock status filter
  if (query.stockStatus && query.stockStatus !== 'all') {
    if (query.stockStatus === 'in_stock') {
      list = list.filter((p) => (p.stock ?? 0) > 4);
    } else if (query.stockStatus === 'low_stock') {
      list = list.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 4);
    } else if (query.stockStatus === 'out_of_stock') {
      list = list.filter((p) => (p.stock ?? 0) <= 0);
    }
  }

  // Featured filter
  if (query.featured !== undefined) {
    list = list.filter((p) => Boolean(p.featured) === query.featured);
  }

  // Sorting
  const sort = query.sort || 'newest';
  list.sort((a, b) => {
    switch (sort) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'stock_asc':
        return (a.stock ?? 0) - (b.stock ?? 0);
      case 'stock_desc':
        return (b.stock ?? 0) - (a.stock ?? 0);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
    }
  });

  const total = list.length;
  const page = Math.max(1, query.page || 1);
  const limit = query.limit || total;
  const totalPages = Math.ceil(total / limit) || 1;

  if (query.limit) {
    const startIndex = (page - 1) * limit;
    list = list.slice(startIndex, startIndex + limit);
  }

  return {
    products: list,
    total,
    page,
    totalPages,
  };
}

export function getProductById(idOrSlug: string | number): Product | null {
  const all = readProducts();
  const searchStr = String(idOrSlug).toLowerCase().trim().replace(/\/$/, '');
  
  const found = all.find((p) => {
    // 1. Direct ID match
    if (String(p.id).toLowerCase() === searchStr) return true;

    // 2. Slug match from URL
    if (p.url) {
      const slug = p.url.split('/product/')[1]?.replace(/\/$/, '')?.toLowerCase();
      if (slug && slug === searchStr) return true;
    }

    // 3. SKU match
    if (p.sku && p.sku.toLowerCase() === searchStr) return true;

    // 4. Name to slug match
    const nameSlug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (nameSlug === searchStr) return true;

    return false;
  });

  return found || null;
}

export function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string | number }
): Product {
  const all = readProducts();
  const now = new Date().toISOString();
  const id = data.id || `wt_${Date.now()}`;
  const stock = typeof data.stock === 'number' ? Math.max(0, data.stock) : 10;
  const inStock = stock > 0;

  const newProduct: Product = {
    ...data,
    id,
    stock,
    inStock,
    createdAt: now,
    updatedAt: now,
    url:
      data.url ||
      `https://watchtown.in/product/${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
  };

  all.unshift(newProduct);
  writeProducts(all);
  return newProduct;
}

export function updateProduct(
  id: string | number,
  updates: Partial<Product>
): Product | null {
  const all = readProducts();
  const index = all.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  const existing = all[index];
  const stock =
    updates.stock !== undefined
      ? Math.max(0, updates.stock)
      : existing.stock ?? 0;
  const inStock = updates.inStock !== undefined ? updates.inStock : stock > 0;

  const updated: Product = {
    ...existing,
    ...updates,
    stock,
    inStock,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  writeProducts(all);
  return updated;
}

export function updateStock(
  id: string | number,
  stockOrDelta: { stock?: number; delta?: number }
): Product | null {
  const all = readProducts();
  const index = all.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  const existing = all[index];
  let newStock = existing.stock ?? 0;

  if (stockOrDelta.stock !== undefined) {
    if (!Number.isFinite(stockOrDelta.stock)) throw new Error('Invalid stock value');
    newStock = Math.max(0, stockOrDelta.stock);
  } else if (stockOrDelta.delta !== undefined) {
    if (!Number.isFinite(stockOrDelta.delta)) throw new Error('Invalid delta value');
    newStock = Math.max(0, newStock + stockOrDelta.delta);
  }

  const updated: Product = {
    ...existing,
    stock: newStock,
    inStock: newStock > 0,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  writeProducts(all);
  return updated;
}

export function deleteProduct(id: string | number): boolean {
  const all = readProducts();
  const filtered = all.filter((p) => String(p.id) !== String(id));
  if (filtered.length === all.length) return false;

  writeProducts(filtered);
  return true;
}

export function getInventoryStats(): InventoryStats {
  const all = readProducts();
  const totalProducts = all.length;
  let totalStock = 0;
  let totalValuation = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const brandsSet = new Set<string>();
  const catsSet = new Set<string>();

  for (const p of all) {
    const stock = p.stock ?? 0;
    totalStock += stock;
    totalValuation += stock * p.price;

    if (stock <= 0) {
      outOfStockCount++;
    } else if (stock <= 4) {
      lowStockCount++;
    }

    if (p.brand) brandsSet.add(p.brand);
    p.categories.forEach((c) => catsSet.add(c));
  }

  return {
    totalProducts,
    totalStock,
    totalValuation,
    lowStockCount,
    outOfStockCount,
    totalBrands: brandsSet.size,
    totalCategories: catsSet.size,
  };
}

export function getAllBrands(): string[] {
  const all = readProducts();
  const set = new Set<string>();
  all.forEach((p) => {
    if (p.brand) set.add(p.brand);
  });
  return Array.from(set).sort();
}

export function getAllCategories(): string[] {
  const all = readProducts();
  const set = new Set<string>();
  all.forEach((p) => {
    p.categories.forEach((c) => set.add(c));
  });
  return Array.from(set).sort();
}
