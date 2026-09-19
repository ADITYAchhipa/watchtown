import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, InventoryStats } from '@/types';
import { SEED_PRODUCTS } from './seed-products';
import { getMongoCollection, isMongoConfigured } from './mongodb';

const DB_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// In-memory cache for fast reads in local JSON mode
let localCache: Product[] | null = null;
let mongoSeeded = false;

function readProductsFromFile(): Product[] {
  if (localCache) return localCache;

  ensureDbDirectory();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), 'utf8');
    localCache = [];
    return localCache;
  }

  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    localCache = JSON.parse(raw) as Product[];
    return localCache;
  } catch (err) {
    console.error('Failed to read products DB:', err);
    localCache = [];
    return localCache;
  }
}

function writeProductsToFile(products: Product[]): void {
  ensureDbDirectory();
  localCache = products;
  const tmpFile = `${PRODUCTS_FILE}.tmp.${process.pid}.${crypto.randomBytes(6).toString('hex')}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(products, null, 2), 'utf8');
    fs.renameSync(tmpFile, PRODUCTS_FILE);
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch {}
    throw err;
  }
}

async function getProductsCollection() {
  const collection = await getMongoCollection<Product>('products');
  if (!collection) return null;

  if (!mongoSeeded) {
    mongoSeeded = true;
    try {
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ brand: 1 });
      await collection.createIndex({ categories: 1 });
      await collection.createIndex({ price: 1 });
    } catch (err) {
      console.error('[MongoDB] Error during products indexing:', err);
    }
  }

  return collection;
}

function sanitizeDoc<T extends Record<string, any>>(doc: T): T {
  if (!doc) return doc;
  const clean = { ...doc };
  delete (clean as any)._id;
  return clean;
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

export async function getProducts(query: GetProductsQuery = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, query.page || 1);

  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const filter: any = {};

      if (query.search && query.search.trim()) {
        const s = query.search.trim();
        filter.$or = [
          { name: { $regex: s, $options: 'i' } },
          { brand: { $regex: s, $options: 'i' } },
          { sku: { $regex: s, $options: 'i' } },
          { categories: { $elemMatch: { $regex: s, $options: 'i' } } },
        ];
      }

      if (query.brand && query.brand !== 'all') {
        filter.brand = { $regex: `^${query.brand.trim()}$`, $options: 'i' };
      }

      if (query.category && query.category !== 'all') {
        filter.categories = { $elemMatch: { $regex: `^${query.category.trim()}$`, $options: 'i' } };
      }

      if (query.stockStatus && query.stockStatus !== 'all') {
        if (query.stockStatus === 'in_stock') {
          filter.stock = { $gt: 4 };
        } else if (query.stockStatus === 'low_stock') {
          filter.stock = { $gt: 0, $lte: 4 };
        } else if (query.stockStatus === 'out_of_stock') {
          filter.$or = [{ stock: { $lte: 0 } }, { inStock: false }];
        }
      }

      if (query.featured !== undefined) {
        filter.featured = query.featured;
      }

      const sortMap: Record<string, any> = {
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        stock_asc: { stock: 1 },
        stock_desc: { stock: -1 },
        name_asc: { name: 1 },
        newest: { createdAt: -1 },
      };
      const sort = sortMap[query.sort || 'newest'] || { createdAt: -1 };

      const total = await col.countDocuments(filter);
      const limit = query.limit || total || 50;
      const totalPages = Math.ceil(total / limit) || 1;

      const cursor = col.find(filter).sort(sort);
      if (query.limit) {
        cursor.skip((page - 1) * limit).limit(limit);
      }

      const docs = await cursor.toArray();
      return {
        products: docs.map(sanitizeDoc),
        total,
        page,
        totalPages,
      };
    }
  }

  // Local JSON fallback
  const all = readProductsFromFile();
  let list = [...all];

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

  if (query.brand && query.brand !== 'all') {
    list = list.filter(
      (p) => p.brand && p.brand.toLowerCase() === query.brand?.toLowerCase()
    );
  }

  if (query.category && query.category !== 'all') {
    list = list.filter((p) =>
      p.categories.some(
        (c) => c.toLowerCase() === query.category?.toLowerCase()
      )
    );
  }

  if (query.stockStatus && query.stockStatus !== 'all') {
    if (query.stockStatus === 'in_stock') {
      list = list.filter((p) => (p.stock ?? 0) > 4);
    } else if (query.stockStatus === 'low_stock') {
      list = list.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 4);
    } else if (query.stockStatus === 'out_of_stock') {
      list = list.filter((p) => (p.stock ?? 0) <= 0);
    }
  }

  if (query.featured !== undefined) {
    list = list.filter((p) => Boolean(p.featured) === query.featured);
  }

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

export async function getProductById(idOrSlug: string | number): Promise<Product | null> {
  const searchStr = String(idOrSlug).toLowerCase().trim().replace(/\/$/, '');

  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      // Direct string/number ID match
      let doc = await col.findOne({
        $or: [{ id: idOrSlug as any }, { id: String(idOrSlug) }],
      });
      if (doc) return sanitizeDoc(doc);

      // Search by SKU
      doc = await col.findOne({ sku: { $regex: `^${searchStr}$`, $options: 'i' } });
      if (doc) return sanitizeDoc(doc);

      // Search by URL slug or name regex
      doc = await col.findOne({
        $or: [
          { url: { $regex: `/product/${searchStr}/?`, $options: 'i' } },
          { name: { $regex: searchStr.replace(/-/g, ' '), $options: 'i' } },
        ],
      });
      if (doc) return sanitizeDoc(doc);
    }
  }

  // Fallback to local
  const all = readProductsFromFile();
  const found = all.find((p) => {
    if (String(p.id).toLowerCase() === searchStr) return true;
    if (p.url) {
      const slug = p.url.split('/product/')[1]?.replace(/\/$/, '')?.toLowerCase();
      if (slug && slug === searchStr) return true;
    }
    if (p.sku && p.sku.toLowerCase() === searchStr) return true;
    const nameSlug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (nameSlug === searchStr) return true;
    return false;
  });

  return found || null;
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string | number }
): Promise<Product> {
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

  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      await col.insertOne(newProduct as any);
      return sanitizeDoc(newProduct);
    }
  }

  const all = readProductsFromFile();
  all.unshift(newProduct);
  writeProductsToFile(all);
  return newProduct;
}

export async function updateProduct(
  id: string | number,
  updates: Partial<Product>
): Promise<Product | null> {
  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const existing = await getProductById(id);
      if (!existing) return null;

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

      await col.updateOne(
        { $or: [{ id: id as any }, { id: String(id) }] },
        { $set: updated }
      );
      return sanitizeDoc(updated);
    }
  }

  const all = readProductsFromFile();
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
  writeProductsToFile(all);
  return updated;
}

export async function updateStock(
  id: string | number,
  stockOrDelta: { stock?: number; delta?: number }
): Promise<Product | null> {
  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const existing = await getProductById(id);
      if (!existing) return null;

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

      await col.updateOne(
        { $or: [{ id: id as any }, { id: String(id) }] },
        { $set: { stock: newStock, inStock: newStock > 0, updatedAt: updated.updatedAt } }
      );
      return sanitizeDoc(updated);
    }
  }

  const all = readProductsFromFile();
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
  writeProductsToFile(all);
  return updated;
}

export async function deleteProduct(id: string | number): Promise<boolean> {
  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const result = await col.deleteOne({
        $or: [{ id: id as any }, { id: String(id) }],
      });
      return result.deletedCount > 0;
    }
  }

  const all = readProductsFromFile();
  const filtered = all.filter((p) => String(p.id) !== String(id));
  if (filtered.length === all.length) return false;

  writeProductsToFile(filtered);
  return true;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const allDocs = await col.find({}).toArray();
      const totalProducts = allDocs.length;
      let totalStock = 0;
      let totalValuation = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      const brandsSet = new Set<string>();
      const catsSet = new Set<string>();

      for (const p of allDocs) {
        const stock = p.stock ?? 0;
        totalStock += stock;
        totalValuation += stock * (p.price || 0);

        if (stock <= 0) {
          outOfStockCount++;
        } else if (stock <= 4) {
          lowStockCount++;
        }

        if (p.brand) brandsSet.add(p.brand);
        if (Array.isArray(p.categories)) {
          p.categories.forEach((c) => catsSet.add(c));
        }
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
  }

  const all = readProductsFromFile();
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

export async function getAllBrands(): Promise<string[]> {
  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const brands = await col.distinct('brand', { brand: { $exists: true } });
      return (brands as string[]).filter(Boolean).sort();
    }
  }

  const all = readProductsFromFile();
  const set = new Set<string>();
  all.forEach((p) => {
    if (p.brand) set.add(p.brand);
  });
  return Array.from(set).sort();
}

export async function getAllCategories(): Promise<string[]> {
  if (isMongoConfigured()) {
    const col = await getProductsCollection();
    if (col) {
      const categories = await col.distinct('categories', {});
      return (categories as string[]).filter(Boolean).sort();
    }
  }

  const all = readProductsFromFile();
  const set = new Set<string>();
  all.forEach((p) => {
    p.categories.forEach((c) => set.add(c));
  });
  return Array.from(set).sort();
}
