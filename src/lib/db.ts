import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, InventoryStats, Brand, Category } from '@/types';
import { SEED_PRODUCTS } from './seed-products';
import { getMongoCollection, isMongoConfigured } from './mongodb';

const DB_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const BRANDS_FILE = path.join(DB_DIR, 'brands.json');
const CATEGORIES_FILE = path.join(DB_DIR, 'categories.json');

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// In-memory cache for fast reads in local JSON mode with file mtime validation
let localCache: Product[] | null = null;
let lastCacheMtime = 0;
let mongoSeeded = false;

function readProductsFromFile(): Product[] {
  ensureDbDirectory();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf8');
    localCache = [...SEED_PRODUCTS];
    try {
      lastCacheMtime = fs.statSync(PRODUCTS_FILE).mtimeMs;
    } catch {
      lastCacheMtime = Date.now();
    }
    return localCache;
  }

  try {
    const stat = fs.statSync(PRODUCTS_FILE);
    if (localCache && localCache.length > 0 && stat.mtimeMs === lastCacheMtime) {
      return localCache;
    }

    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Product[];
    if ((!parsed || parsed.length === 0) && SEED_PRODUCTS.length > 0) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf8');
      localCache = [...SEED_PRODUCTS];
      lastCacheMtime = fs.statSync(PRODUCTS_FILE).mtimeMs;
      return localCache;
    }
    localCache = parsed;
    lastCacheMtime = stat.mtimeMs;
    return localCache;
  } catch (err) {
    console.error('Failed to read products DB:', err);
    if (localCache && localCache.length > 0) return localCache;
    localCache = [...SEED_PRODUCTS];
    return localCache;
  }
}

function writeProductsToFile(products: Product[]): void {
  ensureDbDirectory();
  const tmpFile = `${PRODUCTS_FILE}.tmp.${process.pid}.${crypto.randomBytes(6).toString('hex')}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(products, null, 2), 'utf8');
    fs.renameSync(tmpFile, PRODUCTS_FILE);
    localCache = products;
    try {
      lastCacheMtime = fs.statSync(PRODUCTS_FILE).mtimeMs;
    } catch {
      lastCacheMtime = Date.now();
    }
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch { }
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

      const count = await collection.countDocuments();
      if (count === 0 && SEED_PRODUCTS.length > 0) {
        console.log('[MongoDB] Seeding products collection from SEED_PRODUCTS...');
        const cleaned = SEED_PRODUCTS.map((p) => {
          const copy = { ...p };
          delete (copy as any)._id;
          return copy;
        });
        await collection.insertMany(cleaned as any);
      }
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

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function readBrandsFromFile(): Brand[] {
  ensureDbDirectory();
  if (!fs.existsSync(BRANDS_FILE)) {
    const products = readProductsFromFile();
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) set.add(p.brand.trim());
    });
    const defaultBrandNames = set.size > 0 ? Array.from(set) : [
      'Rolex', 'Audemars Piguet', 'Patek Philippe', 'Omega',
      'Tag Heuer', 'Cartier', 'Hublot', 'Tissot', 'Casio', 'Rado'
    ];
    const initialBrands: Brand[] = defaultBrandNames.map((name) => ({
      id: `brand-${slugify(name)}`,
      name,
      url: `/shop?brand=${encodeURIComponent(name)}`,
      logo: '',
      description: `Curated collection of ${name} timepieces.`,
      createdAt: new Date().toISOString(),
    }));
    try {
      fs.writeFileSync(BRANDS_FILE, JSON.stringify(initialBrands, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write initial brands file:', err);
    }
    return initialBrands;
  }

  try {
    const raw = fs.readFileSync(BRANDS_FILE, 'utf8');
    return JSON.parse(raw) as Brand[];
  } catch (err) {
    console.error('Failed to read brands file:', err);
    return [];
  }
}

function writeBrandsToFile(brands: Brand[]): void {
  ensureDbDirectory();
  fs.writeFileSync(BRANDS_FILE, JSON.stringify(brands, null, 2), 'utf8');
}

export async function getBrandsList(): Promise<Brand[]> {
  const brands = readBrandsFromFile();
  const products = readProductsFromFile();

  // Create a map to quickly compute products count and sample image
  const statsMap = new Map<string, { count: number; totalValue: number; sampleImage: string }>();

  products.forEach((p) => {
    if (!p.brand) return;
    const bName = p.brand.trim();
    const lower = bName.toLowerCase();
    const current = statsMap.get(lower) || { count: 0, totalValue: 0, sampleImage: '' };
    current.count += 1;
    current.totalValue += (p.stock ?? 1) * p.price;
    if (!current.sampleImage && p.image) {
      current.sampleImage = p.image;
    }
    statsMap.set(lower, current);
  });

  // Ensure any brand from products is represented
  const existingNamesLower = new Set(brands.map((b) => b.name.toLowerCase()));
  let updated = false;

  statsMap.forEach((_, lowerKey) => {
    if (!existingNamesLower.has(lowerKey)) {
      // Find actual casing
      const actualProd = products.find((p) => p.brand && p.brand.toLowerCase() === lowerKey);
      const actualName = actualProd?.brand || lowerKey;
      brands.push({
        id: `brand-${slugify(actualName)}`,
        name: actualName,
        url: `/shop?brand=${encodeURIComponent(actualName)}`,
        logo: '',
        description: `Curated ${actualName} collection.`,
        createdAt: new Date().toISOString(),
      });
      existingNamesLower.add(lowerKey);
      updated = true;
    }
  });

  if (updated) {
    try {
      writeBrandsToFile(brands);
    } catch {
      // ignore write errors in read path
    }
  }

  // Populate dynamic stats
  return brands.map((b) => {
    const stat = statsMap.get(b.name.toLowerCase()) || { count: 0, totalValue: 0, sampleImage: '' };
    return {
      ...b,
      productCount: stat.count,
      totalValue: stat.totalValue,
      sampleImage: b.logo || stat.sampleImage || '',
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addBrand(data: { name: string; logo?: string; description?: string }): Promise<Brand> {
  const trimmedName = data.name.trim();
  if (!trimmedName) throw new Error('Brand name is required');

  const products = readProductsFromFile();
  const existingProduct = products.find((p) => p.brand && p.brand.toLowerCase() === trimmedName.toLowerCase());
  const resolvedName = (trimmedName === trimmedName.toLowerCase() && existingProduct?.brand) ? existingProduct.brand : trimmedName;

  const brands = readBrandsFromFile();
  const slug = slugify(resolvedName);
  const existingIndex = brands.findIndex(
    (b) => b.name.toLowerCase() === resolvedName.toLowerCase() || b.id === `brand-${slug}`
  );

  const brandObj: Brand = {
    id: existingIndex >= 0 ? brands[existingIndex].id : `brand-${Date.now()}-${slug}`,
    name: resolvedName,
    url: `/shop?brand=${encodeURIComponent(resolvedName)}`,
    logo: data.logo?.trim() || (existingIndex >= 0 ? brands[existingIndex].logo || '' : ''),
    description: data.description?.trim() || (existingIndex >= 0 ? brands[existingIndex].description || '' : ''),
    createdAt: existingIndex >= 0 ? brands[existingIndex].createdAt || new Date().toISOString() : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    brands[existingIndex] = brandObj;
  } else {
    brands.push(brandObj);
  }

  writeBrandsToFile(brands);
  return brandObj;
}

export interface DeleteEntityResult {
  success: boolean;
  brandName?: string;
  categoryName?: string;
  hasProducts?: boolean;
  count?: number;
  deletedProductsCount?: number;
}

export async function deleteBrand(nameOrId: string, deleteAssociatedProducts: boolean = false): Promise<DeleteEntityResult> {
  const brands = readBrandsFromFile();
  const lower = nameOrId.toLowerCase();
  const targetBrand = brands.find((b) => b.id === nameOrId || b.name.toLowerCase() === lower);
  const actualName = targetBrand?.name || nameOrId;

  // Check how many products are linked to this brand in catalog
  const allProducts = readProductsFromFile();
  const matchingProducts = allProducts.filter((p) => p.brand && p.brand.toLowerCase() === actualName.toLowerCase());
  const productCount = matchingProducts.length;

  if (productCount > 0 && !deleteAssociatedProducts) {
    return {
      success: false,
      hasProducts: true,
      count: productCount,
      brandName: actualName,
    };
  }

  let deletedProductsCount = 0;
  if (productCount > 0 && deleteAssociatedProducts) {
    const remainingProducts = allProducts.filter((p) => !p.brand || p.brand.toLowerCase() !== actualName.toLowerCase());
    deletedProductsCount = allProducts.length - remainingProducts.length;
    writeProductsToFile(remainingProducts);
  }

  const filtered = brands.filter((b) => b.id !== nameOrId && b.name.toLowerCase() !== actualName.toLowerCase());
  writeBrandsToFile(filtered);

  return {
    success: true,
    brandName: actualName,
    deletedProductsCount,
  };
}

function readCategoriesFromFile(): Category[] {
  ensureDbDirectory();
  if (!fs.existsSync(CATEGORIES_FILE)) {
    const products = readProductsFromFile();
    const set = new Set<string>();
    products.forEach((p) => {
      (p.categories || []).forEach((c) => {
        if (c && c.trim()) set.add(c.trim());
      });
    });
    const defaultCatNames = set.size > 0 ? Array.from(set) : [
      "Men's Watches", "Women's Watches", "Automatic Watches",
      "Chronograph Watches", "Diver Watches", "Luxury", "Quartz Watches"
    ];
    const initialCats: Category[] = defaultCatNames.map((name) => ({
      id: `cat-${slugify(name)}`,
      name,
      url: `/shop?category=${encodeURIComponent(name)}`,
      image: '',
      description: `Explore all ${name} at WatchTown.`,
      createdAt: new Date().toISOString(),
    }));
    try {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(initialCats, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write initial categories file:', err);
    }
    return initialCats;
  }

  try {
    const raw = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    return JSON.parse(raw) as Category[];
  } catch (err) {
    console.error('Failed to read categories file:', err);
    return [];
  }
}

function writeCategoriesToFile(categories: Category[]): void {
  ensureDbDirectory();
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
}

export async function getCategoriesList(): Promise<Category[]> {
  const categories = readCategoriesFromFile();
  const products = readProductsFromFile();

  const statsMap = new Map<string, { count: number; sampleImage: string }>();

  products.forEach((p) => {
    (p.categories || []).forEach((c) => {
      if (!c) return;
      const cName = c.trim();
      const lower = cName.toLowerCase();
      const current = statsMap.get(lower) || { count: 0, sampleImage: '' };
      current.count += 1;
      if (!current.sampleImage && p.image) {
        current.sampleImage = p.image;
      }
      statsMap.set(lower, current);
    });
  });

  // Ensure any category from products is represented
  const existingNamesLower = new Set(categories.map((c) => c.name.toLowerCase()));
  let updated = false;

  statsMap.forEach((_, lowerKey) => {
    if (!existingNamesLower.has(lowerKey)) {
      // Find actual casing
      let actualName = lowerKey;
      for (const p of products) {
        const found = (p.categories || []).find((c) => c.toLowerCase() === lowerKey);
        if (found) {
          actualName = found;
          break;
        }
      }
      categories.push({
        id: `cat-${slugify(actualName)}`,
        name: actualName,
        url: `/shop?category=${encodeURIComponent(actualName)}`,
        image: '',
        description: `Explore all ${actualName} at WatchTown.`,
        createdAt: new Date().toISOString(),
      });
      existingNamesLower.add(lowerKey);
      updated = true;
    }
  });

  if (updated) {
    try {
      writeCategoriesToFile(categories);
    } catch {
      // ignore
    }
  }

  return categories.map((c) => {
    const stat = statsMap.get(c.name.toLowerCase()) || { count: 0, sampleImage: '' };
    return {
      ...c,
      productCount: stat.count,
      sampleImage: c.image || stat.sampleImage || '',
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCategory(data: { name: string; image?: string; description?: string }): Promise<Category> {
  const trimmedName = data.name.trim();
  if (!trimmedName) throw new Error('Category/Collection name is required');

  const categories = readCategoriesFromFile();
  const slug = slugify(trimmedName);
  const existingIndex = categories.findIndex(
    (c) => c.name.toLowerCase() === trimmedName.toLowerCase() || c.id === `cat-${slug}`
  );

  const catObj: Category = {
    id: existingIndex >= 0 ? categories[existingIndex].id : `cat-${Date.now()}-${slug}`,
    name: trimmedName,
    url: `/shop?category=${encodeURIComponent(trimmedName)}`,
    image: data.image?.trim() || (existingIndex >= 0 ? categories[existingIndex].image || '' : ''),
    description: data.description?.trim() || (existingIndex >= 0 ? categories[existingIndex].description || '' : ''),
    createdAt: existingIndex >= 0 ? categories[existingIndex].createdAt || new Date().toISOString() : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    categories[existingIndex] = catObj;
  } else {
    categories.push(catObj);
  }

  writeCategoriesToFile(categories);
  return catObj;
}

export async function deleteCategory(nameOrId: string, deleteAssociatedProducts: boolean = false): Promise<DeleteEntityResult> {
  const categories = readCategoriesFromFile();
  const lower = nameOrId.toLowerCase();
  const targetCat = categories.find((c) => c.id === nameOrId || c.name.toLowerCase() === lower);
  const actualName = targetCat?.name || nameOrId;

  const allProducts = readProductsFromFile();
  const matchingProducts = allProducts.filter((p) =>
    (p.categories || []).some((c) => c.toLowerCase() === actualName.toLowerCase())
  );
  const productCount = matchingProducts.length;

  if (productCount > 0 && !deleteAssociatedProducts) {
    return {
      success: false,
      hasProducts: true,
      count: productCount,
      categoryName: actualName,
    };
  }

  let deletedProductsCount = 0;
  if (productCount > 0 && deleteAssociatedProducts) {
    const remainingProducts = allProducts.filter(
      (p) => !(p.categories || []).some((c) => c.toLowerCase() === actualName.toLowerCase())
    );
    deletedProductsCount = allProducts.length - remainingProducts.length;
    writeProductsToFile(remainingProducts);
  }

  const filtered = categories.filter((c) => c.id !== nameOrId && c.name.toLowerCase() !== actualName.toLowerCase());
  writeCategoriesToFile(filtered);

  return {
    success: true,
    categoryName: actualName,
    deletedProductsCount,
  };
}

export async function getAllBrands(): Promise<string[]> {
  const brands = await getBrandsList();
  return brands.map((b) => b.name);
}

export async function getAllCategories(): Promise<string[]> {
  const categories = await getCategoriesList();
  return categories.map((c) => c.name);
}

