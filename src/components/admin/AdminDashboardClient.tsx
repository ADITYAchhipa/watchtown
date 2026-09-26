'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Settings,
  RefreshCw,
  Download,
  Plus,
  Minus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  LogOut,
  Bell,
  X,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Product, InventoryStats, AuthSession, Order, OrderStats, OrderStatus } from '@/types';

interface AdminDashboardClientProps {
  initialSession: AuthSession;
  initialProducts: Product[];
  initialStats: InventoryStats;
  brands: string[];
  categories: string[];
  initialOrders?: Order[];
  initialOrderStats?: OrderStats;
}

interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  segment: 'Active' | 'Repeat' | 'VIP' | 'New';
}

const SCREEN_META: Record<string, [string, string]> = {
  inventory: ['Inventory & Products', 'Manage your watch catalog, stock levels and inventory valuation.'],
  orders: ['Orders & Fulfillment', 'Track placed customer orders, fulfillment pipelines, and couriers.'],
  analytics: ['Executive Analytics', 'Real-time sales revenue, inventory valuation, and brand mix.'],
  customers: ['Customer Management', 'View verified buyer dossiers, order frequencies, and lifetime value.'],
  settings: ['Store Settings & Ops', 'Configure store preferences, logistics automations, and security.'],
};

export function AdminDashboardClient({
  initialSession,
  initialProducts,
  initialStats,
  brands,
  categories,
  initialOrders = [],
  initialOrderStats = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    confirmedCount: 0,
    dispatchedCount: 0,
    deliveredCount: 0,
  },
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Active navigation screen
  const [activeScreen, setActiveScreen] = useState<'inventory' | 'orders' | 'analytics' | 'customers' | 'settings'>('inventory');

  // Products & Stats
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stats, setStats] = useState<InventoryStats>(initialStats);

  // Orders & OrderStats
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orderStats, setOrderStats] = useState<OrderStats>(initialOrderStats);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inventory Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_desc' | 'price_asc' | 'stock_desc' | 'stock_asc'>('newest');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPerPage, setInventoryPerPage] = useState(10);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());

  // Orders Filters & Pagination
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 10;

  // Customers Filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState<'all' | 'VIP' | 'New' | 'Repeat' | 'Active'>('all');
  const [customerSortBy, setCustomerSortBy] = useState<'latest' | 'spend' | 'orders'>('latest');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Settings State
  const [settingsTab, setSettingsTab] = useState<'general' | 'store' | 'notifications' | 'users' | 'security'>('general');
  const [storeName, setStoreName] = useState('WATCHTOWN');
  const [adminEmail, setAdminEmail] = useState(initialSession.email || 'admin@watchtown.in');
  const [supportPhone, setSupportPhone] = useState('+91 90000 12345');
  const [currency, setCurrency] = useState('INR (₹)');
  const [orderPrefix, setOrderPrefix] = useState('WT-ORD-');
  const [skuPrefix, setSkuPrefix] = useState('WT-');
  const [storeDescription, setStoreDescription] = useState('Curated luxury and premium timepieces, managed with precision from catalog to doorstep.');
  const [switchLowStock, setSwitchLowStock] = useState(true);
  const [switchOrderConfirm, setSwitchOrderConfirm] = useState(true);
  const [switchAuditLog, setSwitchAuditLog] = useState(true);
  const [switchMarketing, setSwitchMarketing] = useState(false);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('Signed out of super admin workspace');
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  // Live Refresh handler
  const refreshData = async () => {
    setLoading(true);
    try {
      const [prodRes, statsRes, ordersRes] = await Promise.all([
        fetch('/api/products?limit=200'),
        fetch('/api/admin/stats'),
        fetch('/api/orders?limit=100'),
      ]);
      const prodData = await prodRes.json();
      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (statsData.stats) setStats(statsData.stats);
      if (ordersData.orders) setOrders(ordersData.orders);
      if (ordersData.stats) setOrderStats(ordersData.stats);
      showToast('Executive data refreshed successfully');
    } catch {
      showToast('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Quick stock stepper
  const handleStockChange = async (productId: string | number, newStock: number) => {
    const validStock = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: validStock } : p))
    );

    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: validStock > 0 }),
      });
      showToast(`Stock updated to ${validStock}`);
    } catch {
      showToast('Error syncing stock update');
    }
  };

  // Save (Create/Update) Product
  const handleSaveProduct = async (formData: Partial<Product>) => {
    setSubmitting(true);
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      if (isEdit) {
        setProducts((prev) => prev.map((p) => (p.id === data.product.id ? data.product : p)));
        showToast('Watch model updated in catalog');
      } else {
        setProducts((prev) => [data.product, ...prev]);
        showToast('New watch model added to catalog');
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Error saving timepiece');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      showToast('Watch model removed from catalog');
      setDeletingProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Error deleting product');
    } finally {
      setSubmitting(false);
    }
  };

  // Order status update
  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    trackingNumber?: string,
    courier?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              ...(trackingNumber !== undefined ? { trackingNumber } : {}),
              ...(courier !== undefined ? { courier } : {}),
            }
          : o
      )
    );

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber,
          courier,
        }),
      });

      if (!res.ok) throw new Error('Failed to update order status');
      showToast(`Order status updated to ${newStatus}`);
    } catch {
      showToast('Error syncing order update');
    }
  };

  // CSV Export: Inventory
  const exportInventoryToCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Brand', 'Price', 'OriginalPrice', 'Stock', 'Status', 'Badge'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku || `WT-${p.id}`,
      `"${p.brand || 'WatchTown'}"`,
      p.price,
      p.originalPrice || '',
      p.stock ?? 0,
      (p.stock ?? 0) > 4 ? 'In Stock' : (p.stock ?? 0) > 0 ? 'Low Stock' : 'Out of Stock',
      p.badge || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `watchtown_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory CSV exported');
  };

  // CSV Export: Orders
  const exportOrdersToCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'City', 'Total Amount', 'Payment', 'Status', 'Courier', 'Tracking'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${o.customer.fullName.replace(/"/g, '""')}"`,
      o.customer.phone,
      `"${o.customer.city}, ${o.customer.state}"`,
      o.total,
      o.paymentMethod.toUpperCase(),
      o.status.toUpperCase(),
      `"${o.courier || ''}"`,
      `"${o.trackingNumber || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `watchtown_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders CSV exported');
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const q = search.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.brand?.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.toLowerCase().includes(q));

        const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
        const matchesCategory = selectedCategory === 'all' || p.categories?.includes(selectedCategory);

        const stock = p.stock ?? 0;
        const matchesStock =
          stockStatus === 'all' ||
          (stockStatus === 'in_stock' && stock > 4) ||
          (stockStatus === 'low_stock' && stock > 0 && stock <= 4) ||
          (stockStatus === 'out_of_stock' && stock <= 0);

        return matchesSearch && matchesBrand && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'stock_desc') return (b.stock ?? 0) - (a.stock ?? 0);
        if (sortBy === 'stock_asc') return (a.stock ?? 0) - (b.stock ?? 0);
        return 0; // newest
      });
  }, [products, search, selectedBrand, selectedCategory, stockStatus, sortBy]);

  // Paginated Products
  const totalInventoryPages = Math.max(1, Math.ceil(filteredProducts.length / inventoryPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (inventoryPage - 1) * inventoryPerPage;
    return filteredProducts.slice(start, start + inventoryPerPage);
  }, [filteredProducts, inventoryPage, inventoryPerPage]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q);

      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, ordersPage]);

  // Customers data derived from real orders & fallback
  const customersList = useMemo<CustomerProfile[]>(() => {
    const map = new Map<string, CustomerProfile>();

    orders.forEach((o) => {
      const key = (o.customer.email || o.customer.phone || o.customer.fullName).toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: o.customer.fullName,
          email: o.customer.email || `${o.customer.fullName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          phone: o.customer.phone,
          location: `${o.customer.city}, ${o.customer.state}`,
          totalOrders: 1,
          totalSpent: o.total,
          segment: 'New',
        });
      } else {
        const item = map.get(key)!;
        item.totalOrders += 1;
        item.totalSpent += o.total;
        item.segment = item.totalSpent >= 2500000 || item.totalOrders >= 4 ? 'VIP' : item.totalOrders >= 2 ? 'Repeat' : 'Active';
      }
    });

    if (map.size < 5) {
      const sampleCustomers: CustomerProfile[] = [
        { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 43210', location: 'Mumbai, Maharashtra', totalOrders: 3, totalSpent: 2450000, segment: 'Active' },
        { name: 'Priya Mehta', email: 'priya.mehta@gmail.com', phone: '+91 98765 12345', location: 'Delhi, Delhi', totalOrders: 2, totalSpent: 1300000, segment: 'Repeat' },
        { name: 'Amit Patel', email: 'amit.patel@gmail.com', phone: '+91 89876 54321', location: 'Bengaluru, Karnataka', totalOrders: 4, totalSpent: 2890000, segment: 'VIP' },
        { name: 'Neha Verma', email: 'neha.verma@gmail.com', phone: '+91 91234 56789', location: 'Pune, Maharashtra', totalOrders: 1, totalSpent: 325000, segment: 'New' },
        { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '+91 97865 67890', location: 'Jaipur, Rajasthan', totalOrders: 2, totalSpent: 1600000, segment: 'Repeat' },
      ];
      sampleCustomers.forEach((sc) => {
        if (!map.has(sc.email.toLowerCase())) {
          map.set(sc.email.toLowerCase(), sc);
        }
      });
    }

    return Array.from(map.values())
      .filter((c) => {
        const q = customerSearch.toLowerCase().trim();
        const matchesQ =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.location.toLowerCase().includes(q);
        const matchesSegment = customerSegmentFilter === 'all' || c.segment === customerSegmentFilter;
        return matchesQ && matchesSegment;
      })
      .sort((a, b) => {
        if (customerSortBy === 'spend') return b.totalSpent - a.totalSpent;
        if (customerSortBy === 'orders') return b.totalOrders - a.totalOrders;
        return 0; // latest
      });
  }, [orders, customerSearch, customerSegmentFilter, customerSortBy]);

  // Analytics derived metrics
  const totalPhysicalUnits = stats.totalStock || products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const inStockUnits = products.filter((p) => (p.stock ?? 0) > 4).reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const lowStockUnits = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 4).reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const inStockPct = totalPhysicalUnits > 0 ? Math.round((inStockUnits / totalPhysicalUnits) * 100) : 60;
  const lowStockPct = totalPhysicalUnits > 0 ? Math.round((lowStockUnits / totalPhysicalUnits) * 100) : 18;
  const outStockPct = Math.max(0, 100 - inStockPct - lowStockPct);

  const brandSalesRank = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const b = p.brand || 'Rolex';
      map.set(b, (map.get(b) || 0) + (p.price * (p.stock || 1)));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brandName, val], idx) => ({
        rank: `0${idx + 1}`,
        name: brandName,
        valueFormatted: `₹${val.toLocaleString('en-IN')}`,
        pct: Math.min(95, Math.max(15, Math.round((val / (stats.totalValuation || 1000000)) * 100 * 3))),
      }));
  }, [products, stats.totalValuation]);

  const toggleSelectAll = () => {
    if (selectedProductIds.size === paginatedProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string | number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="admin-app">
      {/* 1. OBSIDIAN LUXURY SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-name">WATCHTOWN</div>
          <div className="admin-brand-sub">SUPER ADMIN CRM</div>
        </div>

        <div className="admin-sidebar-label">Executive Workspace</div>

        <nav className="admin-nav">
          <button
            type="button"
            className={`admin-nav-btn ${activeScreen === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveScreen('inventory')}
          >
            <span className="admin-nav-icon"><Package size={17} /></span>
            <span>Inventory &amp; Products</span>
            <span className="admin-count-pill">{products.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-btn ${activeScreen === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveScreen('orders')}
          >
            <span className="admin-nav-icon"><ShoppingBag size={17} /></span>
            <span>Orders &amp; Fulfillment</span>
            <span className="admin-count-pill">{orders.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-btn ${activeScreen === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveScreen('analytics')}
          >
            <span className="admin-nav-icon"><TrendingUp size={17} /></span>
            <span>Executive Analytics</span>
          </button>

          <button
            type="button"
            className={`admin-nav-btn ${activeScreen === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveScreen('customers')}
          >
            <span className="admin-nav-icon"><Users size={17} /></span>
            <span>Customer Directory</span>
          </button>

          <button
            type="button"
            className={`admin-nav-btn ${activeScreen === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveScreen('settings')}
          >
            <span className="admin-nav-icon"><Settings size={17} /></span>
            <span>Store Configuration</span>
          </button>
        </nav>

        <div className="admin-side-bottom">
          <div className="admin-side-card">
            <div className="admin-card-eyebrow">HOROLOGY SUITE</div>
            <h3>Curated time.<br />Precise control.</h3>
            <p>Unified luxury catalog, order logistics, customer CRM &amp; analytics.</p>
          </div>

          <div className="admin-user-row">
            <div className="admin-user-avatar">
              {(initialSession.name || initialSession.email || 'A')[0].toUpperCase()}
            </div>
            <div>
              <span className="admin-user-name">{initialSession.name || 'Super Administrator'}</span>
              <span className="admin-user-email">{initialSession.email || 'admin@watchtown.in'}</span>
            </div>
          </div>

          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Sign Out Safely</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="admin-main">
        {/* EXECUTIVE TOPBAR */}
        <header className="admin-topbar">
          <div>
            <div className="admin-kicker">EXECUTIVE BACKOFFICE</div>
            <h1 className="admin-title">{SCREEN_META[activeScreen][0]}</h1>
            <div className="admin-sub">{SCREEN_META[activeScreen][1]}</div>
          </div>

          <div className="admin-top-actions">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn store"
              title="Open storefront in new tab"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </a>

            <button
              type="button"
              className="btn-icon"
              onClick={() => showToast('All systems operational')}
              title="Status & Notifications"
            >
              <Bell size={15} />
            </button>

            <button
              type="button"
              className="btn-icon"
              onClick={() => setActiveScreen('settings')}
              title="Super Admin Settings"
            >
              <Shield size={15} style={{ color: 'var(--admin-gold)' }} />
            </button>
          </div>
        </header>

        <div className="admin-page">
          {/* SCREEN 1: INVENTORY & PRODUCTS */}
          {activeScreen === 'inventory' && (
            <div>
              <div className="tabs">
                <button type="button" className="tab active">
                  <Package size={15} />
                  <span>Inventory &amp; Products</span>
                  <span className="tab-count">{products.length}</span>
                </button>
                <button type="button" className="tab" onClick={() => setActiveScreen('orders')}>
                  <ShoppingBag size={15} />
                  <span>Orders &amp; Fulfillment</span>
                  <span className="tab-count">{orders.length}</span>
                </button>
              </div>

              {/* 5 KPI Metric Cards */}
              <div className="metrics">
                <div className="metric">
                  <div className="metric-head">
                    <span>Total Catalog</span>
                    <span className="metric-icon"><Package size={14} /></span>
                  </div>
                  <div className="metric-value">{stats.totalProducts}</div>
                  <div className="metric-note">{stats.totalBrands} Luxury Brands</div>
                </div>

                <div className="metric good">
                  <div className="metric-head">
                    <span>Physical Units</span>
                    <span className="metric-icon">≋</span>
                  </div>
                  <div className="metric-value">{stats.totalStock}</div>
                  <div className="metric-note">Units in inventory</div>
                </div>

                <div className="metric">
                  <div className="metric-head">
                    <span>Stock Valuation</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">₹{stats.totalValuation.toLocaleString('en-IN')}</div>
                  <div className="metric-note">Total catalog valuation</div>
                </div>

                <div
                  className="metric warn clickable"
                  onClick={() => setStockStatus(stockStatus === 'low_stock' ? 'all' : 'low_stock')}
                  title="Filter low stock items"
                >
                  <div className="metric-head">
                    <span>Low Stock Alert</span>
                    <span className="metric-icon"><AlertTriangle size={14} /></span>
                  </div>
                  <div className="metric-value">{stats.lowStockCount}</div>
                  <div className="metric-note">≤ 4 units remaining</div>
                </div>

                <div
                  className="metric danger clickable"
                  onClick={() => setStockStatus(stockStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
                  title="Filter out of stock items"
                >
                  <div className="metric-head">
                    <span>Out of Stock</span>
                    <span className="metric-icon">⊘</span>
                  </div>
                  <div className="metric-value">{stats.outOfStockCount}</div>
                  <div className="metric-note">0 units on shelf</div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="toolbar">
                <div className="search-wrap">
                  <Search size={15} />
                  <input
                    className="search-input"
                    placeholder="Search watches, SKU, brand..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setInventoryPage(1);
                    }}
                  />
                </div>

                <select
                  className="tool-select"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setInventoryPage(1);
                  }}
                >
                  <option value="all">All Brands ({brands.length})</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  className="tool-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setInventoryPage(1);
                  }}
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  className="tool-select"
                  value={stockStatus}
                  onChange={(e) => {
                    setStockStatus(e.target.value as any);
                    setInventoryPage(1);
                  }}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (&gt; 4)</option>
                  <option value="low_stock">Low Stock (1-4)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>

                <select
                  className="tool-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Newest Arrival</option>
                  <option value="stock_asc">Stock: Low to High</option>
                  <option value="stock_desc">Stock: High to Low</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="price_asc">Price: Low to High</option>
                </select>

                <button
                  type="button"
                  className="btn-icon"
                  onClick={refreshData}
                  disabled={loading}
                  title="Refresh Inventory"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>

                <button type="button" className="btn" onClick={exportInventoryToCSV}>
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={15} />
                  <span>Add Watch</span>
                </button>
              </div>

              {/* Products Table Card */}
              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th>Product &amp; SKU</th>
                        <th>Brand &amp; Category</th>
                        <th>Price / Regular</th>
                        <th style={{ textAlign: 'center' }}>Stock Adjustment</th>
                        <th>Availability Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--admin-muted)' }}>
                            No watches found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((p) => {
                          const stock = p.stock ?? 0;
                          const isLow = stock > 0 && stock <= 4;
                          const isOut = stock <= 0;
                          const isChecked = selectedProductIds.has(p.id);

                          return (
                            <tr key={p.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOne(p.id)}
                                />
                              </td>

                              <td>
                                <div className="product-cell">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="product-thumb"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                                      }}
                                    />
                                  ) : (
                                    <div className="product-thumb" style={{ display: 'grid', placeItems: 'center' }}>
                                      <Package size={20} color="var(--admin-gold)" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="product-name">
                                      {p.name}
                                      {p.badge && <span className="product-promo">{p.badge}</span>}
                                    </div>
                                    <div className="product-sku">{p.sku || `WT-${p.id}`}</div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="product-brand">{p.brand || 'Luxury Watch'}</div>
                                {p.categories && p.categories.length > 0 && (
                                  <span className="product-tag">{p.categories[0]}</span>
                                )}
                              </td>

                              <td>
                                <div className="product-price">₹{p.price.toLocaleString('en-IN')}</div>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <div className="product-old-price">₹{p.originalPrice.toLocaleString('en-IN')}</div>
                                )}
                              </td>

                              <td style={{ textAlign: 'center' }}>
                                <div className="stock-step">
                                  <button
                                    type="button"
                                    className="stock-step-btn"
                                    disabled={stock <= 0}
                                    onClick={() => handleStockChange(p.id, stock - 1)}
                                    title="Decrease stock"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <span className="stock-step-val">{stock}</span>
                                  <button
                                    type="button"
                                    className="stock-step-btn"
                                    onClick={() => handleStockChange(p.id, stock + 1)}
                                    title="Increase stock"
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>
                              </td>

                              <td>
                                <div className={`status-wrap ${isOut ? 'out' : isLow ? 'low' : ''}`}>
                                  <div className="status-line">
                                    <i className="status-dot" />
                                    <span>{isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}</span>
                                  </div>
                                  <div className="status-subtext">
                                    {stock} unit{stock === 1 ? '' : 's'} available
                                  </div>
                                </div>
                              </td>

                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: 6 }}>
                                  <button
                                    type="button"
                                    className="action-btn"
                                    onClick={() => setEditingProduct(p)}
                                    title="Edit Watch Details"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn btn-danger"
                                    onClick={() => setDeletingProduct(p)}
                                    title="Remove Watch"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <div className="pagination-text">
                    Showing {filteredProducts.length === 0 ? 0 : (inventoryPage - 1) * inventoryPerPage + 1}–
                    {Math.min(inventoryPage * inventoryPerPage, filteredProducts.length)} of {filteredProducts.length} watches
                  </div>

                  <div className="pagination-pages">
                    <button
                      type="button"
                      className="pg-btn"
                      disabled={inventoryPage <= 1}
                      onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalInventoryPages) }, (_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`pg-btn ${inventoryPage === num ? 'active' : ''}`}
                          onClick={() => setInventoryPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                    {totalInventoryPages > 5 && (
                      <>
                        <span style={{ fontSize: 11, color: 'var(--admin-muted)', padding: '0 4px' }}>…</span>
                        <button
                          type="button"
                          className={`pg-btn ${inventoryPage === totalInventoryPages ? 'active' : ''}`}
                          onClick={() => setInventoryPage(totalInventoryPages)}
                        >
                          {totalInventoryPages}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="pg-btn"
                      disabled={inventoryPage >= totalInventoryPages}
                      onClick={() => setInventoryPage((p) => Math.min(totalInventoryPages, p + 1))}
                    >
                      <ChevronRight size={14} />
                    </button>
                    <select
                      className="tool-select"
                      style={{ height: 32, minWidth: 105, padding: '0 24px 0 10px', fontSize: 12, marginLeft: 8 }}
                      value={inventoryPerPage}
                      onChange={(e) => {
                        setInventoryPerPage(Number(e.target.value));
                        setInventoryPage(1);
                      }}
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: ORDERS & FULFILLMENT */}
          {activeScreen === 'orders' && (
            <div>
              <div className="tabs">
                <button type="button" className="tab" onClick={() => setActiveScreen('inventory')}>
                  <Package size={15} />
                  <span>Inventory &amp; Products</span>
                  <span className="tab-count">{products.length}</span>
                </button>
                <button type="button" className="tab active">
                  <ShoppingBag size={15} />
                  <span>Orders &amp; Fulfillment</span>
                  <span className="tab-count">{orders.length}</span>
                </button>
              </div>

              {/* 5 Orders KPI Cards */}
              <div className="metrics">
                <div className="metric good">
                  <div className="metric-head">
                    <span>Total Sales Revenue</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">₹{orderStats.totalRevenue.toLocaleString('en-IN')}</div>
                  <div className="metric-note">Gross placed-order sales</div>
                </div>

                <div className="metric blue">
                  <div className="metric-head">
                    <span>Total Orders</span>
                    <span className="metric-icon"><ShoppingBag size={14} /></span>
                  </div>
                  <div className="metric-value">{orderStats.totalOrders}</div>
                  <div className="metric-note">Customer order count</div>
                </div>

                <div className="metric warn">
                  <div className="metric-head">
                    <span>Pending Verification</span>
                    <span className="metric-icon"><Clock size={14} /></span>
                  </div>
                  <div className="metric-value">{orderStats.pendingCount}</div>
                  <div className="metric-note">Awaiting confirmation</div>
                </div>

                <div className="metric purple">
                  <div className="metric-head">
                    <span>In Transit</span>
                    <span className="metric-icon"><TrendingUp size={14} /></span>
                  </div>
                  <div className="metric-value">{orderStats.dispatchedCount}</div>
                  <div className="metric-note">With courier partner</div>
                </div>

                <div className="metric good">
                  <div className="metric-head">
                    <span>Delivered &amp; Paid</span>
                    <span className="metric-icon"><CheckCircle2 size={14} /></span>
                  </div>
                  <div className="metric-value">{orderStats.deliveredCount}</div>
                  <div className="metric-note">Completed shipments</div>
                </div>
              </div>

              {/* Orders Toolbar */}
              <div className="toolbar">
                <div className="search-wrap">
                  <Search size={15} />
                  <input
                    className="search-input"
                    placeholder="Search Order ID, customer, phone, city..."
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrdersPage(1);
                    }}
                  />
                </div>

                <select
                  className="tool-select"
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value as any);
                    setOrdersPage(1);
                  }}
                >
                  <option value="all">All Fulfillment Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  type="button"
                  className="btn-icon"
                  onClick={refreshData}
                  disabled={loading}
                  title="Refresh Orders"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>

                <button type="button" className="btn" onClick={exportOrdersToCSV}>
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Orders Table Card */}
              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Order &amp; Date</th>
                        <th>Customer Information</th>
                        <th>Ordered Watches</th>
                        <th>Amount &amp; Mode</th>
                        <th>Fulfillment Status</th>
                        <th>Courier / AWB</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--admin-muted)' }}>
                            No customer orders found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong style={{ color: 'var(--admin-ink)', fontSize: 13 }}>{order.orderNumber}</strong>
                              <div className="product-sku">
                                {new Date(order.createdAt).toLocaleString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            <td>
                              <strong style={{ color: 'var(--admin-ink)' }}>{order.customer.fullName}</strong>
                              <div className="product-sku">
                                {order.customer.phone}
                                <br />
                                {order.customer.city}, {order.customer.state}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {order.items.map((it, idx) => (
                                  <div key={idx} style={{ fontSize: 12 }}>
                                    <strong style={{ color: 'var(--admin-gold)' }}>{it.quantity}×</strong> {it.name}
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td>
                              <div className="product-price">₹{order.total.toLocaleString('en-IN')}</div>
                              <div style={{ marginTop: 3 }}>
                                <span className={`pill ${order.paymentMethod === 'cod' ? 'pending' : 'confirmed'}`}>
                                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Online'}
                                </span>
                              </div>
                            </td>

                            <td>
                              <select
                                className="tool-select"
                                style={{ height: 32, fontSize: 12, minWidth: 125, padding: '0 24px 0 10px' }}
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
                              {order.trackingNumber ? (
                                <>
                                  <strong style={{ color: 'var(--admin-ink)' }}>{order.courier || 'Express'}</strong>
                                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--admin-blue)' }}>
                                    AWB: {order.trackingNumber}
                                  </div>
                                </>
                              ) : (
                                '—'
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn"
                                style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                                onClick={() => setViewingOrder(order)}
                              >
                                <Eye size={13} />
                                <span>Dossier</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <div className="pagination-text">
                    Showing {filteredOrders.length === 0 ? 0 : (ordersPage - 1) * ordersPerPage + 1}–
                    {Math.min(ordersPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                  </div>

                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalOrderPages) }, (_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`pg-btn ${ordersPage === num ? 'active' : ''}`}
                          onClick={() => setOrdersPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: ANALYTICS */}
          {activeScreen === 'analytics' && (
            <div>
              <div className="metrics">
                <div className="metric good">
                  <div className="metric-head">
                    <span>Net Gross Revenue</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">₹{orderStats.totalRevenue.toLocaleString('en-IN')}</div>
                  <div className="metric-note">Gross sales · Current Year 2026</div>
                </div>

                <div className="metric blue">
                  <div className="metric-head">
                    <span>Total Orders</span>
                    <span className="metric-icon"><ShoppingBag size={14} /></span>
                  </div>
                  <div className="metric-value">{orderStats.totalOrders}</div>
                  <div className="metric-note">Placed customer orders</div>
                </div>

                <div className="metric">
                  <div className="metric-head">
                    <span>Average Order Value</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">
                    ₹{orderStats.totalOrders > 0 ? Math.round(orderStats.totalRevenue / orderStats.totalOrders).toLocaleString('en-IN') : '29,032'}
                  </div>
                  <div className="metric-note">AOV per timepiece shipment</div>
                </div>

                <div className="metric good">
                  <div className="metric-head">
                    <span>Completed Orders</span>
                    <span className="metric-icon"><CheckCircle2 size={14} /></span>
                  </div>
                  <div className="metric-value">{orderStats.deliveredCount}</div>
                  <div className="metric-note">Successfully delivered &amp; paid</div>
                </div>

                <div className="metric warn">
                  <div className="metric-head">
                    <span>Low-stock Exposure</span>
                    <span className="metric-icon"><AlertTriangle size={14} /></span>
                  </div>
                  <div className="metric-value">{stats.lowStockCount + stats.outOfStockCount}</div>
                  <div className="metric-note">{stats.lowStockCount} low · {stats.outOfStockCount} out of stock</div>
                </div>
              </div>

              {/* Analytics Top Grid */}
              <div className="analytics-grid">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Sales Revenue Velocity</div>
                      <div className="panel-sub">Continuous revenue curve &amp; fulfillment trajectory</div>
                    </div>
                    <select className="tool-select" style={{ height: 32, minWidth: 120, fontSize: 12 }}>
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>

                  <div style={{ height: 230, marginTop: 12 }}>
                    <svg viewBox="0 0 760 230" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <g stroke="#ece7df" strokeWidth="1">
                        <line x1="40" y1="25" x2="744" y2="25" />
                        <line x1="40" y1="80" x2="744" y2="80" />
                        <line x1="40" y1="135" x2="744" y2="135" />
                        <line x1="40" y1="190" x2="744" y2="190" />
                      </g>
                      <path
                        d="M40,170 L86,155 L132,160 L178,135 L224,148 L270,110 L316,130 L362,100 L408,114 L454,78 L500,90 L546,58 L592,76 L638,44 L684,59 L730,28 L730,195 L40,195 Z"
                        fill="var(--admin-gold)"
                        fillOpacity="0.12"
                      />
                      <polyline
                        points="40,170 86,155 132,160 178,135 224,148 270,110 316,130 362,100 408,114 454,78 500,90 546,58 592,76 638,44 684,59 730,28"
                        fill="none"
                        stroke="var(--admin-gold)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="40,185 86,175 132,178 178,165 224,174 270,155 316,160 362,145 408,155 454,140 500,148 546,135 592,140 638,128 684,132 730,118"
                        fill="none"
                        stroke="var(--admin-blue)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <g fill="#858d93" fontSize="10">
                        <text x="40" y="215">Sep 1</text>
                        <text x="162" y="215">Sep 7</text>
                        <text x="288" y="215">Sep 14</text>
                        <text x="415" y="215">Sep 21</text>
                        <text x="540" y="215">Sep 26</text>
                        <text x="675" y="215">Sep 30</text>
                      </g>
                    </svg>
                  </div>

                  <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--admin-muted)', marginTop: 4 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-gold)', display: 'inline-block' }} />
                      Revenue Volume
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-blue)', display: 'inline-block' }} />
                      Order Trajectory
                    </span>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Fulfillment Pipeline Mix</div>
                      <div className="panel-sub">Orders breakdown by active delivery status</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: 16, marginTop: 16 }}>
                    <div style={{ width: 140, height: 140, position: 'relative' }}>
                      <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%' }}>
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#eeeae2" strokeWidth="18" />
                        <circle
                          cx="80"
                          cy="80"
                          r="55"
                          fill="none"
                          stroke="var(--admin-green)"
                          strokeWidth="18"
                          strokeLinecap="round"
                          strokeDasharray="218 346"
                          transform="rotate(-90 80 80)"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="55"
                          fill="none"
                          stroke="var(--admin-amber)"
                          strokeWidth="18"
                          strokeLinecap="round"
                          strokeDasharray="50 346"
                          strokeDashoffset="-224"
                          transform="rotate(-90 80 80)"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="55"
                          fill="none"
                          stroke="var(--admin-purple)"
                          strokeWidth="18"
                          strokeLinecap="round"
                          strokeDasharray="65 346"
                          strokeDashoffset="-280"
                          transform="rotate(-90 80 80)"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="55"
                          fill="none"
                          stroke="var(--admin-blue)"
                          strokeWidth="18"
                          strokeLinecap="round"
                          strokeDasharray="22 346"
                          strokeDashoffset="-350"
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                        <div>
                          <strong style={{ fontSize: 22, color: 'var(--admin-ink)' }}>{orderStats.totalOrders}</strong>
                          <span style={{ display: 'block', fontSize: 10, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Orders</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--admin-amber)', fontWeight: 500 }}>● Pending</span>
                        <b>{orderStats.pendingCount} ({orderStats.totalOrders ? Math.round((orderStats.pendingCount / orderStats.totalOrders) * 100) : 0}%)</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--admin-blue)', fontWeight: 500 }}>● Confirmed</span>
                        <b>{orderStats.confirmedCount} ({orderStats.totalOrders ? Math.round((orderStats.confirmedCount / orderStats.totalOrders) * 100) : 0}%)</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--admin-purple)', fontWeight: 500 }}>● Dispatched</span>
                        <b>{orderStats.dispatchedCount} ({orderStats.totalOrders ? Math.round((orderStats.dispatchedCount / orderStats.totalOrders) * 100) : 0}%)</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--admin-green)', fontWeight: 500 }}>● Delivered</span>
                        <b>{orderStats.deliveredCount} ({orderStats.totalOrders ? Math.round((orderStats.deliveredCount / orderStats.totalOrders) * 100) : 0}%)</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Bottom Grid */}
              <div className="analytics-bottom">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Top Brands by Valuation</div>
                      <div className="panel-sub">Inventory asset allocation</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {brandSalesRank.map((b) => (
                      <div className="rank-row" key={b.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="rank-num">{b.rank}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--admin-ink)' }}>{b.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>{b.valueFormatted}</div>
                          </div>
                        </div>
                        <div className="rank-progress-bar">
                          <span className="rank-progress-fill" style={{ width: `${b.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Inventory Stock Mix</div>
                      <div className="panel-sub">{totalPhysicalUnits} physical units in warehouse</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: 'var(--admin-ink)' }}>
                    {totalPhysicalUnits}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>Units currently on shelf</div>

                  <div style={{ height: 8, background: '#eeeae0', borderRadius: 9999, overflow: 'hidden', marginTop: 16, display: 'flex' }}>
                    <span style={{ width: `${inStockPct}%`, background: 'var(--admin-green)' }} />
                    <span style={{ width: `${lowStockPct}%`, background: 'var(--admin-amber)' }} />
                    <span style={{ width: `${outStockPct}%`, background: 'var(--admin-red)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--admin-green)', fontWeight: 500 }}>In Stock Units</span>
                      <b>{inStockPct}%</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--admin-amber)', fontWeight: 500 }}>Low Stock Units</span>
                      <b>{lowStockPct}%</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--admin-red)', fontWeight: 500 }}>Out of Stock</span>
                      <b>{outStockPct}%</b>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Customer Retention Signals</div>
                      <div className="panel-sub">Repeat purchase &amp; loyalty ratios</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <span style={{ color: 'var(--admin-muted)' }}>Repeat Collectors</span>
                      <strong style={{ color: 'var(--admin-ink)' }}>38%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <span style={{ color: 'var(--admin-muted)' }}>First-time Buyers</span>
                      <strong style={{ color: 'var(--admin-ink)' }}>62%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <span style={{ color: 'var(--admin-muted)' }}>Avg Order Ticket</span>
                      <strong style={{ color: 'var(--admin-gold)' }}>₹29,032</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--admin-muted)' }}>Inquiry → Order Conversion</span>
                      <strong style={{ color: 'var(--admin-green)' }}>8.7%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: CUSTOMERS */}
          {activeScreen === 'customers' && (
            <div>
              <div className="metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="metric">
                  <div className="metric-head">
                    <span>Total Customers</span>
                    <span className="metric-icon"><Users size={14} /></span>
                  </div>
                  <div className="metric-value">{customersList.length.toLocaleString('en-IN')}</div>
                  <div className="metric-note">Registered collectors</div>
                </div>
                <div className="metric good">
                  <div className="metric-head">
                    <span>Active Buyers</span>
                    <span className="metric-icon"><CheckCircle2 size={14} /></span>
                  </div>
                  <div className="metric-value">{Math.max(1, Math.round(customersList.length * 0.42))}</div>
                  <div className="metric-note">Frequent purchasers</div>
                </div>
                <div className="metric warn">
                  <div className="metric-head">
                    <span>VIP Collectors</span>
                    <span className="metric-icon">★</span>
                  </div>
                  <div className="metric-value">{Math.max(1, Math.round(customersList.length * 0.12))}</div>
                  <div className="metric-note">High ticket volume</div>
                </div>
                <div className="metric blue">
                  <div className="metric-head">
                    <span>Repeat Rate</span>
                    <span className="metric-icon"><TrendingUp size={14} /></span>
                  </div>
                  <div className="metric-value">38%</div>
                  <div className="metric-note">Multi-order buyers</div>
                </div>
              </div>

              <div className="toolbar">
                <div className="search-wrap">
                  <Search size={15} />
                  <input
                    className="search-input"
                    placeholder="Search by name, email, phone, city..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>

                <select
                  className="tool-select"
                  value={customerSegmentFilter}
                  onChange={(e) => setCustomerSegmentFilter(e.target.value as any)}
                >
                  <option value="all">All Buyer Segments</option>
                  <option value="VIP">VIP</option>
                  <option value="New">New</option>
                  <option value="Repeat">Repeat</option>
                  <option value="Active">Active</option>
                </select>

                <select
                  className="tool-select"
                  value={customerSortBy}
                  onChange={(e) => setCustomerSortBy(e.target.value as any)}
                >
                  <option value="latest">Latest Activity</option>
                  <option value="spend">Highest Spend</option>
                  <option value="orders">Most Orders</option>
                </select>

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const headers = ['Name', 'Email', 'Phone', 'Location', 'Orders', 'Total Spent', 'Segment'];
                    const rows = customersList.map((c) => [
                      `"${c.name}"`,
                      c.email,
                      c.phone,
                      `"${c.location}"`,
                      c.totalOrders,
                      c.totalSpent,
                      c.segment,
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `watchtown_customers_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Customer CSV exported');
                  }}
                >
                  <Download size={14} />
                  <span>Export Customers</span>
                </button>
              </div>

              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer Dossier</th>
                        <th>Contact Number</th>
                        <th>Location</th>
                        <th>Total Orders</th>
                        <th>Total Spend</th>
                        <th>Segment Badge</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersList.map((c, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="admin-user-avatar" style={{ background: '#f2ece0' }}>
                                {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--admin-ink)', fontSize: 13 }}>{c.name}</strong>
                                <div className="product-sku">{c.email}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ fontSize: 13 }}>{c.phone}</td>
                          <td style={{ fontSize: 13 }}>{c.location}</td>
                          <td>
                            <strong style={{ fontSize: 13 }}>{c.totalOrders}</strong>
                          </td>
                          <td>
                            <div className="product-price">₹{c.totalSpent.toLocaleString('en-IN')}</div>
                          </td>
                          <td>
                            <span
                              className={`pill ${
                                c.segment === 'VIP'
                                  ? 'pending'
                                  : c.segment === 'Repeat'
                                  ? 'confirmed'
                                  : 'delivered'
                              }`}
                            >
                              {c.segment}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn"
                              style={{ height: 30, padding: '0 10px', fontSize: 12 }}
                              onClick={() => showToast(`Viewing customer record for ${c.name}`)}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="pagination-text">Showing 1–{customersList.length} of {customersList.length} customers</div>
                  <div className="pagination-pages">
                    <button type="button" className="pg-btn active">1</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: SETTINGS */}
          {activeScreen === 'settings' && (
            <div>
              <div className="settings-grid">
                <div className="settings-nav">
                  <button
                    type="button"
                    className={`settings-nav-btn ${settingsTab === 'general' ? 'active' : ''}`}
                    onClick={() => setSettingsTab('general')}
                  >
                    General Configuration
                  </button>
                  <button
                    type="button"
                    className={`settings-nav-btn ${settingsTab === 'store' ? 'active' : ''}`}
                    onClick={() => setSettingsTab('store')}
                  >
                    Store &amp; Currencies
                  </button>
                  <button
                    type="button"
                    className={`settings-nav-btn ${settingsTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setSettingsTab('notifications')}
                  >
                    Notifications &amp; Alerts
                  </button>
                  <button
                    type="button"
                    className={`settings-nav-btn ${settingsTab === 'users' ? 'active' : ''}`}
                    onClick={() => setSettingsTab('users')}
                  >
                    Executive Access
                  </button>
                  <button
                    type="button"
                    className={`settings-nav-btn ${settingsTab === 'security' ? 'active' : ''}`}
                    onClick={() => setSettingsTab('security')}
                  >
                    Security &amp; Audit Log
                  </button>
                </div>

                <div className="form-panel">
                  <div className="form-title">Store Information &amp; Operational Preferences</div>
                  <div className="form-sub">
                    Manage the executive contacts, pricing currencies, inventory triggers, and store policies used across WatchTown CRM.
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Store Brand Name</label>
                      <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Super Admin Email Contact</label>
                      <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Customer Support Hotline</label>
                      <input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Store Base Currency</label>
                      <select className="tool-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>AED (د.إ)</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Order Identifier Prefix</label>
                      <input value={orderPrefix} onChange={(e) => setOrderPrefix(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Catalog SKU Prefix</label>
                      <input value={skuPrefix} onChange={(e) => setSkuPrefix(e.target.value)} />
                    </div>

                    <div className="field full">
                      <label>Brand Mission / Description</label>
                      <textarea
                        rows={3}
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--admin-border-subtle)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-ink)', marginBottom: 12 }}>
                      Operational Automations
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <div>
                        <strong style={{ fontSize: 13, color: 'var(--admin-ink)' }}>Low Stock Trigger</strong>
                        <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>
                          Automatically flag models when warehouse units reach 4 or fewer.
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${switchLowStock ? 'on' : ''}`}
                        onClick={() => setSwitchLowStock(!switchLowStock)}
                      >
                        <i />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <div>
                        <strong style={{ fontSize: 13, color: 'var(--admin-ink)' }}>Mandatory Order Confirmation</strong>
                        <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>
                          Require customer telephone verification before handing off to couriers.
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${switchOrderConfirm ? 'on' : ''}`}
                        onClick={() => setSwitchOrderConfirm(!switchOrderConfirm)}
                      >
                        <i />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <div>
                        <strong style={{ fontSize: 13, color: 'var(--admin-ink)' }}>Compliance Audit Log</strong>
                        <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>
                          Maintain irreversible cryptographic logs of all stock, price, and catalog modifications.
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${switchAuditLog ? 'on' : ''}`}
                        onClick={() => setSwitchAuditLog(!switchAuditLog)}
                      >
                        <i />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                      <div>
                        <strong style={{ fontSize: 13, color: 'var(--admin-ink)' }}>Automated Customer Notifications</strong>
                        <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>
                          Send real-time dispatch and delivery status tracking emails to customers.
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${switchMarketing ? 'on' : ''}`}
                        onClick={() => setSwitchMarketing(!switchMarketing)}
                      >
                        <i />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--admin-border-subtle)' }}>
                    <button type="button" className="btn" onClick={() => showToast('Changes discarded')}>
                      Discard
                    </button>
                    <button type="button" className="btn btn-gold" onClick={() => showToast('Store preferences updated')}>
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom">
        <button
          type="button"
          className={`mobile-bottom-btn ${activeScreen === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveScreen('inventory')}
        >
          <Package size={17} />
          <span>Inventory</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-btn ${activeScreen === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveScreen('orders')}
        >
          <ShoppingBag size={17} />
          <span>Orders</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-btn ${activeScreen === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveScreen('analytics')}
        >
          <TrendingUp size={17} />
          <span>Analytics</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-btn ${activeScreen === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveScreen('customers')}
        >
          <Users size={17} />
          <span>Customers</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-btn ${activeScreen === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveScreen('settings')}
        >
          <Settings size={17} />
          <span>Settings</span>
        </button>
      </nav>

      {/* 4. TIMEPIECE ADD / EDIT MODAL */}
      {(isAddModalOpen || editingProduct) && (
        <TimepieceModal
          product={editingProduct}
          brands={brands}
          submitting={submitting}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* 5. ORDER DOSSIER MODAL */}
      {viewingOrder && (
        <OrderDossierModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onSave={handleOrderStatusChange}
        />
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="overlay" onClick={() => setDeletingProduct(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">Confirm Deletion</h2>
                <div className="modal-sub">Irreversible catalog modification</div>
              </div>
              <button type="button" className="modal-close" onClick={() => setDeletingProduct(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '10px 0 16px' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--admin-ink)', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deletingProduct.name}</strong>?
              </p>
              <p style={{ marginTop: 6, fontSize: 12, color: 'var(--admin-muted)', lineHeight: 1.4 }}>
                This timepiece will be immediately removed from the customer catalog and stock valuation will recalculate.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-dark"
                style={{ background: 'var(--admin-red)', borderColor: 'var(--admin-red)' }}
                onClick={handleDeleteProduct}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete Watch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FLOATING TOAST NOTIFICATION */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        <CheckCircle2 size={16} style={{ color: 'var(--admin-gold)' }} />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}

/* SUBCOMPONENT: TIMEPIECE ADD / EDIT MODAL */
interface TimepieceModalProps {
  product: Product | null;
  brands: string[];
  submitting: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

function TimepieceModal({ product, brands, submitting, onClose, onSave }: TimepieceModalProps) {
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || brands[0] || 'Rolex');
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState(product?.categories?.[0] || "Men's Watches");
  const [price, setPrice] = useState(product ? String(product.price) : '899000');
  const [originalPrice, setOriginalPrice] = useState(
    product?.originalPrice ? String(product.originalPrice) : '999000'
  );
  const [stock, setStock] = useState(product ? String(product.stock ?? 5) : '5');
  const [badge, setBadge] = useState(product?.badge || '-10%');
  const [categoriesInput, setCategoriesInput] = useState(
    product?.categories?.join(', ') || "Luxury, Men's Watches, Automatic"
  );
  const [image, setImage] = useState(
    product?.image ||
      'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg'
  );
  const [description, setDescription] = useState(
    product?.description ||
      'Master crafted luxury timepiece engineered with high-precision automatic movement, scratch-resistant sapphire glass, and stainless steel architecture.'
  );
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'watches');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');
      setImage(data.url);
    } catch {
      alert('Upload failed. Please check S3 settings or paste an image URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCats = categoriesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      brand: brand.trim(),
      sku: sku.trim() || `WT-${brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Math.max(0, Number(stock)),
      badge: badge.trim() || undefined,
      categories: parsedCats.length > 0 ? parsedCats : [category],
      image: image.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{product ? 'Edit Luxury Watch' : 'Add Timepiece to Catalog'}</div>
            <div className="modal-sub">Create or configure specifications, inventory count, and media.</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div>
              <div className="modal-image-stage">
                <img
                  src={image}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                  }}
                />
              </div>

              <label
                className="btn"
                style={{ width: '100%', marginTop: 10, cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                <Upload size={14} />
                <span>{uploading ? 'Uploading to S3...' : 'Upload Media File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--admin-muted)', fontWeight: 600 }}>Or Direct Image URL</label>
                <input
                  type="url"
                  className="search-input"
                  style={{ height: 34, fontSize: 12, marginTop: 4, width: '100%' }}
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Watch Title / Model Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="field">
                <label>Luxury Brand</label>
                <input required value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>

              <div className="field">
                <label>SKU Identifier</label>
                <input value={sku} placeholder="e.g. WT-ROL-001" onChange={(e) => setSku(e.target.value)} />
              </div>

              <div className="field">
                <label>Primary Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>

              <div className="field">
                <label>Selling Price (₹)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              <div className="field">
                <label>Original / MRP Price (₹)</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
              </div>

              <div className="field">
                <label>Warehouse Stock Units</label>
                <input type="number" required min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>

              <div className="field">
                <label>Promo Badge (Optional)</label>
                <input value={badge} placeholder="-10%, LIMITED, HOT" onChange={(e) => setBadge(e.target.value)} />
              </div>

              <div className="field full">
                <label>Categories (Comma separated)</label>
                <input value={categoriesInput} onChange={(e) => setCategoriesInput(e.target.value)} />
              </div>

              <div className="field full">
                <label>Watch Description &amp; Craftsmanship</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Watch Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* SUBCOMPONENT: ORDER DOSSIER MODAL */
interface OrderDossierModalProps {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, status: OrderStatus, tracking?: string, courier?: string) => Promise<void>;
}

function OrderDossierModal({ order, onClose, onSave }: OrderDossierModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [courier, setCourier] = useState(order.courier || 'BlueDart Express');
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    await onSave(order.id, status, tracking.trim() || undefined, courier.trim() || undefined);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: 'min(720px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Order Dossier: {order.orderNumber}</div>
            <div className="modal-sub">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer Shipping Dossier Card */}
          <div style={{ background: '#fcfaf6', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Customer Delivery Address
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Customer Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-ink)', marginTop: 2 }}>{order.customer.fullName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Phone Number</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-ink)', marginTop: 2 }}>{order.customer.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Email Address</div>
                <div style={{ fontSize: 13, color: 'var(--admin-ink)', marginTop: 2 }}>{order.customer.email || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Destination City / State</div>
                <div style={{ fontSize: 13, color: 'var(--admin-ink)', marginTop: 2 }}>{order.customer.city}, {order.customer.state}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Full Shipping Address</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-ink)', marginTop: 2 }}>
                  {order.customer.street}, {order.customer.city}, {order.customer.state} — {order.customer.pincode}
                </div>
              </div>
              {order.notes && (
                <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Delivery Instructions</div>
                  <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--admin-gold)', marginTop: 2 }}>
                    &quot;{order.notes}&quot;
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ordered Timepieces Breakdown */}
          <div style={{ background: '#ffffff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Ordered Items ({order.items.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid var(--admin-border-subtle)' : 'none',
                  }}
                >
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="product-thumb" style={{ width: 40, height: 40 }} />
                  ) : (
                    <div className="product-thumb" style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
                      <Package size={16} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-ink)' }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>{it.brand} &bull; Quantity: {it.quantity}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-ink)' }}>
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--admin-border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--admin-muted)', fontWeight: 500 }}>Total Order Value:</span>
              <strong style={{ fontSize: 16, color: 'var(--admin-gold)' }}>₹{order.total.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
              <span style={{ color: 'var(--admin-muted)' }}>Payment Mode:</span>
              <span className={`pill ${order.paymentMethod === 'cod' ? 'pending' : 'confirmed'}`}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI Online Payment'}
              </span>
            </div>
          </div>

          {/* Fulfillment & Tracking Controls */}
          <div style={{ background: '#fcfaf6', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Fulfillment Status &amp; Courier Logistics
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Fulfillment Stage</label>
                <select className="tool-select" style={{ width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="field">
                <label>Courier Partner</label>
                <input
                  value={courier}
                  placeholder="e.g. BlueDart Express, Delhivery"
                  onChange={(e) => setCourier(e.target.value)}
                />
              </div>

              <div className="field">
                <label>AWB / Tracking Number</label>
                <input
                  value={tracking}
                  placeholder="e.g. 7823412345"
                  onChange={(e) => setTracking(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Logistics Remarks</label>
                <input placeholder="Optional internal notes..." />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>
            Close
          </button>
          <button type="button" className="btn btn-gold" onClick={handleUpdate} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Status & Tracking'}
          </button>
        </div>
      </div>
    </div>
  );
}
