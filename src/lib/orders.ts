import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Order, OrderItem, CustomerAddress, OrderStatus, OrderStats } from '@/types';
import { updateStock, getProductById } from './db';

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

let cache: Order[] | null = null;

function readOrders(): Order[] {
  if (cache) return cache;

  ensureDbDirectory();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2), 'utf8');
    cache = [...SEED_ORDERS];
    return cache;
  }

  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    cache = JSON.parse(raw) as Order[];
    return cache;
  } catch (err) {
    console.error('Failed to read orders DB:', err);
    cache = [...SEED_ORDERS];
    return cache;
  }
}

function writeOrders(orders: Order[]): void {
  ensureDbDirectory();
  cache = orders;
  const tmpFile = `${ORDERS_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(orders, null, 2), 'utf8');
  fs.renameSync(tmpFile, ORDERS_FILE);
}

export interface GetOrdersQuery {
  status?: OrderStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export function getOrders(query: GetOrdersQuery = {}): {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
} {
  const all = readOrders();
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

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = list.length;
  const page = Math.max(1, query.page || 1);
  const limit = query.limit || total;
  const totalPages = Math.ceil(total / limit) || 1;

  if (query.limit) {
    const startIndex = (page - 1) * limit;
    list = list.slice(startIndex, startIndex + limit);
  }

  return { orders: list, total, page, totalPages };
}

export function getOrderById(id: string): Order | null {
  const all = readOrders();
  const found = all.find((o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase());
  return found || null;
}

export interface CreateOrderInput {
  customer: CustomerAddress;
  items: OrderItem[];
  paymentMethod: 'cod' | 'upi';
  notes?: string;
}

export function createOrder(input: CreateOrderInput): { order: Order } | { error: string } {
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

    const product = getProductById(item.productId);
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
    updateStock(item.productId, { delta: -item.quantity });
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

  const all = readOrders();
  all.unshift(newOrder);
  writeOrders(all);

  return { order: newOrder };
}

export function updateOrderStatus(
  id: string,
  updates: {
    status?: OrderStatus;
    trackingNumber?: string;
    courier?: string;
    notes?: string;
  }
): Order | null {
  const all = readOrders();
  const index = all.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return null;

  const existing = all[index];

  if (updates.status) {
    const VALID_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!VALID_STATUSES.includes(updates.status)) {
      throw new Error('Invalid order status.');
    }
  }

  // If order was cancelled, restore inventory stock
  if (updates.status === 'cancelled' && existing.status !== 'cancelled') {
    for (const item of existing.items) {
      updateStock(item.productId, { delta: item.quantity });
    }
  }

  const updated: Order = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  writeOrders(all);
  return updated;
}

export function getOrderStats(): OrderStats {
  const all = readOrders();
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
