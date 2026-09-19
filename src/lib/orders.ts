import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Order, OrderItem, CustomerAddress, OrderStatus, OrderStats } from '@/types';
import { updateStock, getProductById } from './db';
import { getMongoCollection, isMongoConfigured } from './mongodb';

const DB_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Initial seed orders for CRM demonstration
const SEED_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'WT-2025-1001',
    customer: {
      fullName: 'Aakash Verma',
      phone: '+91 98234 56789',
      email: 'aakash.v@gmail.com',
      street: 'Flat 402, Royal Palms, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
    items: [
      {
        productId: '18324',
        name: 'Rolex Day-Date President Gold Blue Dial',
        brand: 'Rolex',
        price: 2499,
        quantity: 1,
        image: 'https://watchtown.in/wp-content/uploads/2026/02/Rolex-Day-Date-President-Gold-Blue-Dial-1-600x600.jpeg',
      },
    ],
    subtotal: 2499,
    shippingFee: 0,
    total: 2499,
    paymentMethod: 'cod',
    status: 'dispatched',
    trackingNumber: 'BD-78941258',
    courier: 'BlueDart Express',
    notes: 'Call before delivery',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ord_1002',
    orderNumber: 'WT-2025-1002',
    customer: {
      fullName: 'Rohit Sharma',
      phone: '+91 97112 34567',
      email: 'rohit.s@outlook.com',
      street: 'H-12, Sector 15, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
    },
    items: [
      {
        productId: '9302',
        name: 'Audemars Piguet Royal Oak Stainless Steel Silver Black Dial',
        brand: 'Audemars Piguet',
        price: 6500,
        quantity: 1,
        image: 'https://watchtown.in/wp-content/uploads/2025/10/Audemars-Piguet-Royal-Oak-Stainless-Steel-Silver-Black-Dial-1-watchtown-600x600.jpeg',
      },
    ],
    subtotal: 6500,
    shippingFee: 0,
    total: 6500,
    paymentMethod: 'cod',
    status: 'confirmed',
    notes: 'Premium box packaging requested',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'ord_1003',
    orderNumber: 'WT-2025-1003',
    customer: {
      fullName: 'Priya Nair',
      phone: '+91 99887 65432',
      email: 'priya.nair@yahoo.com',
      street: '34, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    items: [
      {
        productId: '12906',
        name: 'Coach Delancey Rose Gold Black Dial 36mm',
        brand: 'Coach',
        price: 6499,
        quantity: 1,
        image: 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg',
      },
    ],
    subtotal: 6499,
    shippingFee: 0,
    total: 6499,
    paymentMethod: 'upi',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ord_1004',
    orderNumber: 'WT-2025-1004',
    customer: {
      fullName: 'Deepak Patel',
      phone: '+91 98765 43210',
      email: 'deepak.patel@gmail.com',
      street: '12, C.G. Road, Navrangpura',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
    },
    items: [
      {
        productId: '15559',
        name: 'Tag Heuer Aquaracer Black Diver 44mm',
        brand: 'Tag Heuer',
        price: 5499,
        quantity: 1,
        image: 'https://watchtown.in/wp-content/uploads/2025/12/Tag-Heuer-Aquaracer-Black-Diver-44mm-1-600x600.jpg',
      },
    ],
    subtotal: 5499,
    shippingFee: 0,
    total: 5499,
    paymentMethod: 'cod',
    status: 'delivered',
    trackingNumber: 'DEL-3498102',
    courier: 'Delhivery',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let localCache: Order[] | null = null;
let mongoOrdersSeeded = false;

function readOrdersFromFile(): Order[] {
  if (localCache) return localCache;

  ensureDbDirectory();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2), 'utf8');
    localCache = [...SEED_ORDERS];
    return localCache;
  }

  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    localCache = JSON.parse(raw) as Order[];
    return localCache;
  } catch (err) {
    console.error('Failed to read orders DB:', err);
    localCache = [...SEED_ORDERS];
    return localCache;
  }
}

function writeOrdersToFile(orders: Order[]): void {
  ensureDbDirectory();
  localCache = orders;
  const tmpFile = `${ORDERS_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(orders, null, 2), 'utf8');
  fs.renameSync(tmpFile, ORDERS_FILE);
}

async function getOrdersCollection() {
  const collection = await getMongoCollection<Order>('orders');
  if (!collection) return null;

  if (!mongoOrdersSeeded) {
    mongoOrdersSeeded = true;
    try {
      const count = await collection.countDocuments();
      if (count === 0) {
        console.log('[MongoDB] Seeding orders collection from local data...');
        const initial = fs.existsSync(ORDERS_FILE)
          ? (JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) as Order[])
          : SEED_ORDERS;
        if (initial.length > 0) {
          const cleaned = initial.map((o) => {
            const copy = { ...o };
            delete (copy as any)._id;
            return copy;
          });
          await collection.insertMany(cleaned as any);
          await collection.createIndex({ id: 1 }, { unique: true });
          await collection.createIndex({ orderNumber: 1 });
          await collection.createIndex({ 'customer.phone': 1 });
          await collection.createIndex({ 'customer.email': 1 });
          await collection.createIndex({ status: 1 });
          console.log(`[MongoDB] Successfully seeded ${initial.length} orders!`);
        }
      }
    } catch (err) {
      console.error('[MongoDB] Error during orders seeding:', err);
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

export interface GetOrdersQuery {
  status?: OrderStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export async function getOrders(query: GetOrdersQuery = {}): Promise<{
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, query.page || 1);

  if (isMongoConfigured()) {
    const col = await getOrdersCollection();
    if (col) {
      const filter: any = {};

      if (query.status && query.status !== 'all') {
        filter.status = query.status;
      }

      if (query.search && query.search.trim()) {
        const s = query.search.trim();
        filter.$or = [
          { orderNumber: { $regex: s, $options: 'i' } },
          { 'customer.fullName': { $regex: s, $options: 'i' } },
          { 'customer.phone': { $regex: s, $options: 'i' } },
          { 'customer.city': { $regex: s, $options: 'i' } },
          { 'items.name': { $regex: s, $options: 'i' } },
        ];
      }

      const total = await col.countDocuments(filter);
      const limit = query.limit || total || 50;
      const totalPages = Math.ceil(total / limit) || 1;

      const cursor = col.find(filter).sort({ createdAt: -1 });
      if (query.limit) {
        cursor.skip((page - 1) * limit).limit(limit);
      }

      const docs = await cursor.toArray();
      return {
        orders: docs.map(sanitizeDoc),
        total,
        page,
        totalPages,
      };
    }
  }

  // File fallback
  const all = readOrdersFromFile();
  let list = [...all];

  if (query.status && query.status !== 'all') {
    list = list.filter((o) => o.status === query.status);
  }

  if (query.search && query.search.trim()) {
    const s = query.search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customer.fullName.toLowerCase().includes(s) ||
        o.customer.phone.includes(s) ||
        o.customer.city.toLowerCase().includes(s) ||
        o.items.some((it) => it.name.toLowerCase().includes(s))
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = list.length;
  const limit = query.limit || total;
  const totalPages = Math.ceil(total / limit) || 1;

  if (query.limit) {
    const startIndex = (page - 1) * limit;
    list = list.slice(startIndex, startIndex + limit);
  }

  return { orders: list, total, page, totalPages };
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isMongoConfigured()) {
    const col = await getOrdersCollection();
    if (col) {
      const doc = await col.findOne({
        $or: [
          { id: id },
          { orderNumber: { $regex: `^${id.trim()}$`, $options: 'i' } },
        ],
      });
      if (doc) return sanitizeDoc(doc);
    }
  }

  const all = readOrdersFromFile();
  const found = all.find((o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase());
  return found || null;
}

export interface CreateOrderInput {
  customer: CustomerAddress;
  items: OrderItem[];
  paymentMethod: 'cod' | 'upi';
  notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<{ order: Order } | { error: string }> {
  if (!input.items || input.items.length === 0) {
    return { error: 'No items in order.' };
  }

  if (!input.customer.fullName || !input.customer.phone || !input.customer.street || !input.customer.city) {
    return { error: 'Complete delivery address and phone number are required.' };
  }

  const VALID_PAYMENT_METHODS = ['cod', 'upi'] as const;
  if (!VALID_PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { error: 'Invalid payment method.' };
  }

  // Check inventory stock availability and deduct stock
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { error: `Invalid quantity for "${item.name}".` };
    }

    const product = await getProductById(item.productId);
    if (!product) {
      return { error: `Product "${item.name}" was not found.` };
    }

    item.price = product.price;

    const currentStock = product.stock ?? 0;
    if (currentStock < item.quantity) {
      return {
        error: `Insufficient stock for "${item.name}". Only ${currentStock} units available.`,
      };
    }
  }

  // Deduct stock for all items
  for (const item of input.items) {
    await updateStock(item.productId, { delta: -item.quantity });
  }

  const subtotal = input.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shippingFee = subtotal >= 1500 ? 0 : 99;
  const total = subtotal + shippingFee;

  const now = new Date().toISOString();
  const id = `ord_${crypto.randomUUID()}`;
  const orderNumber = `WT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id,
    orderNumber,
    customer: input.customer,
    items: input.items,
    subtotal,
    shippingFee,
    total,
    paymentMethod: input.paymentMethod,
    status: 'pending',
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  if (isMongoConfigured()) {
    const col = await getOrdersCollection();
    if (col) {
      await col.insertOne(newOrder as any);
      return { order: sanitizeDoc(newOrder) };
    }
  }

  const all = readOrdersFromFile();
  all.unshift(newOrder);
  writeOrdersToFile(all);

  return { order: newOrder };
}

export async function updateOrderStatus(
  id: string,
  updates: {
    status?: OrderStatus;
    trackingNumber?: string;
    courier?: string;
    notes?: string;
  }
): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  if (updates.status) {
    const VALID_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!VALID_STATUSES.includes(updates.status)) {
      throw new Error('Invalid order status.');
    }
  }

  // If order was cancelled, restore inventory stock
  if (updates.status === 'cancelled' && existing.status !== 'cancelled') {
    for (const item of existing.items) {
      await updateStock(item.productId, { delta: item.quantity });
    }
  }

  const updated: Order = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isMongoConfigured()) {
    const col = await getOrdersCollection();
    if (col) {
      await col.updateOne(
        { $or: [{ id }, { orderNumber: id }] },
        { $set: updated }
      );
      return sanitizeDoc(updated);
    }
  }

  const all = readOrdersFromFile();
  const index = all.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index !== -1) {
    all[index] = updated;
    writeOrdersToFile(all);
  }

  return updated;
}

export async function getOrderStats(): Promise<OrderStats> {
  if (isMongoConfigured()) {
    const col = await getOrdersCollection();
    if (col) {
      const allDocs = await col.find({}).toArray();
      let totalRevenue = 0;
      let pendingCount = 0;
      let confirmedCount = 0;
      let dispatchedCount = 0;
      let deliveredCount = 0;

      for (const o of allDocs) {
        if (o.status !== 'cancelled') {
          totalRevenue += o.total;
        }
        switch (o.status) {
          case 'pending':
            pendingCount++;
            break;
          case 'confirmed':
            confirmedCount++;
            break;
          case 'dispatched':
            dispatchedCount++;
            break;
          case 'delivered':
            deliveredCount++;
            break;
        }
      }

      return {
        totalOrders: allDocs.length,
        totalRevenue,
        pendingCount,
        confirmedCount,
        dispatchedCount,
        deliveredCount,
      };
    }
  }

  const all = readOrdersFromFile();
  let totalRevenue = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let dispatchedCount = 0;
  let deliveredCount = 0;

  for (const o of all) {
    if (o.status !== 'cancelled') {
      totalRevenue += o.total;
    }
    switch (o.status) {
      case 'pending':
        pendingCount++;
        break;
      case 'confirmed':
        confirmedCount++;
        break;
      case 'dispatched':
        dispatchedCount++;
        break;
      case 'delivered':
        deliveredCount++;
        break;
    }
  }

  return {
    totalOrders: all.length,
    totalRevenue,
    pendingCount,
    confirmedCount,
    dispatchedCount,
    deliveredCount,
  };
}
