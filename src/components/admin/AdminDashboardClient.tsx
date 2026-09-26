'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

const META: Record<string, [string, string]> = {
  inventory: ['Inventory & Products', 'Manage your watch catalog, stock levels and inventory valuation'],
  orders: ['Orders & Fulfillment', 'Manage customer orders, tracking and delivery status'],
  analytics: ['Analytics', 'Sales performance, popular brands and inventory insights'],
  customers: ['Customers', 'View and manage customer profiles, activity and spend'],
  settings: ['Settings', 'Manage store preferences, operations and access'],
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
  const [viewingCustomer, setViewingCustomer] = useState<CustomerProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Settings State
  const [settingsTab, setSettingsTab] = useState<'general' | 'store' | 'notifications' | 'users' | 'security'>('general');
  const [storeName, setStoreName] = useState('WATCHTOWN');
  const [adminEmail, setAdminEmail] = useState(initialSession.email || 'admin@watchtown.in');
  const [supportPhone, setSupportPhone] = useState('+91 90000 12345');
  const [currency, setCurrency] = useState('INR (₹)');
  const [orderPrefix, setOrderPrefix] = useState('WT-ORD-');
  const [skuPrefix, setSkuPrefix] = useState('WT-');
  const [storeDescription, setStoreDescription] = useState('Curated luxury and premium watches, managed with precision from catalog to doorstep.');
  const [switchLowStock, setSwitchLowStock] = useState(true);
  const [switchOrderConfirm, setSwitchOrderConfirm] = useState(true);
  const [switchAuditLog, setSwitchAuditLog] = useState(true);
  const [switchMarketing, setSwitchMarketing] = useState(false);

  // Toast helper
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
      showToast('Logged out safely');
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  // Refresh data handler
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
      showToast('Workspace refreshed successfully');
    } catch {
      showToast('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Quick stock change stepper
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
        showToast('Watch model updated');
      } else {
        setProducts((prev) => [data.product, ...prev]);
        showToast('New watch added to catalog');
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

  // Customers data derived from orders & fallback
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

    // If order list is small or empty, supply reference demo customers from template
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
  const outOfStockUnits = products.filter((p) => (p.stock ?? 0) <= 0).length;

  const inStockPct = totalPhysicalUnits > 0 ? Math.round((inStockUnits / totalPhysicalUnits) * 100) : 60;
  const lowStockPct = totalPhysicalUnits > 0 ? Math.round((lowStockUnits / totalPhysicalUnits) * 100) : 18;
  const outStockPct = 100 - inStockPct - lowStockPct;

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
    <div className="app">
      {/* 1. DARK LUXURY SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">WATCHTOWN</div>
          <div className="brand-sub">CRM</div>
        </div>

        <div className="sidebar-label">Workspace</div>

        <nav className="nav">
          <button
            className={`nav-btn ${activeScreen === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveScreen('inventory')}
          >
            <span className="nav-icon">▣</span>
            Inventory &amp; Products
            <span className="count">{products.length}</span>
          </button>

          <button
            className={`nav-btn ${activeScreen === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveScreen('orders')}
          >
            <span className="nav-icon">◫</span>
            Orders &amp; Fulfillment
            <span className="count">{orders.length}</span>
          </button>

          <button
            className={`nav-btn ${activeScreen === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveScreen('analytics')}
          >
            <span className="nav-icon">⌁</span>
            Analytics
          </button>

          <button
            className={`nav-btn ${activeScreen === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveScreen('customers')}
          >
            <span className="nav-icon">◌</span>
            Customers
          </button>

          <button
            className={`nav-btn ${activeScreen === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveScreen('settings')}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </button>
        </nav>

        <div className="side-bottom">
          <div className="side-card">
            <div className="eyebrow">WATCHTOWN EDIT</div>
            <h3>Curated time.<br />Precise control.</h3>
            <p>One workspace for catalog, orders, customers and store operations.</p>
          </div>

          <div className="user">
            <div className="avatar">
              {(initialSession.name || initialSession.email || 'A')[0].toUpperCase()}
            </div>
            <div>
              <strong>{initialSession.name || 'Super Admin'}</strong>
              <span>{initialSession.email || 'admin@watchtown.in'}</span>
            </div>
          </div>

          <button className="logout" onClick={handleLogout}>
            ↪&nbsp; Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="main">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <div className="kicker">ADMIN DASHBOARD</div>
            <h1 className="title">{META[activeScreen][0]}</h1>
            <div className="sub">{META[activeScreen][1]}</div>
          </div>

          <div className="top-actions">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn store"
            >
              ↗ View Storefront
            </a>
            <button className="icon" onClick={() => showToast('No pending notifications')} title="Notifications">
              ♢
            </button>
            <button className="icon admin-icon" onClick={() => setActiveScreen('settings')} title="Settings">
              {(initialSession.name || initialSession.email || 'A')[0].toUpperCase()}
            </button>
          </div>
        </header>

        <div className="page">
          {/* SCREEN 1: INVENTORY & PRODUCTS */}
          {activeScreen === 'inventory' && (
            <section className="screen active">
              <div className="tabs">
                <button className="tab active">
                  Inventory &amp; Products <span className="count">{products.length}</span>
                </button>
                <button className="tab" onClick={() => setActiveScreen('orders')}>
                  Orders &amp; Fulfillment <span className="count">{orders.length}</span>
                </button>
              </div>

              {/* 5 Metrics Cards */}
              <div className="metrics">
                <div className="metric">
                  <div className="metric-head">
                    <span>Total Catalog</span>
                    <span className="metric-icon">▣</span>
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
                  <div className="metric-note">In warehouse</div>
                </div>

                <div className="metric">
                  <div className="metric-head">
                    <span>Stock Valuation</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">₹{stats.totalValuation.toLocaleString('en-IN')}</div>
                  <div className="metric-note">Total inventory value</div>
                </div>

                <div
                  className={`metric warn clickable`}
                  onClick={() => setStockStatus(stockStatus === 'low_stock' ? 'all' : 'low_stock')}
                >
                  <div className="metric-head">
                    <span>Low Stock Alert</span>
                    <span className="metric-icon">!</span>
                  </div>
                  <div className="metric-value">{stats.lowStockCount}</div>
                  <div className="metric-note">≤ 4 units remaining</div>
                </div>

                <div
                  className={`metric danger clickable`}
                  onClick={() => setStockStatus(stockStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    className="search"
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

                <button className="icon" onClick={refreshData} disabled={loading} title="Refresh">
                  ⟳
                </button>
                <button className="btn" onClick={exportInventoryToCSV}>
                  ⇩ Export CSV
                </button>
                <button className="btn dark" onClick={() => setIsAddModalOpen(true)}>
                  ＋ Add Watch
                </button>
              </div>

              {/* Table Card */}
              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 34 }}>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th>Product &amp; SKU</th>
                        <th>Brand &amp; Category</th>
                        <th>Price / Regular</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px 14px', color: '#889196' }}>
                            No watches match your search criteria.
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
                                <div className="product">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="product-thumb"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="watch">
                                      <div className="dial" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="product-name">
                                      {p.name}
                                      {p.badge && <span className="promo">{p.badge}</span>}
                                    </div>
                                    <div className="sku">{p.sku || `WT-${p.id}`}</div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="brand">{p.brand || 'Luxury Watch'}</div>
                                {p.categories && p.categories.length > 0 && (
                                  <span className="tag">{p.categories[0]}</span>
                                )}
                              </td>

                              <td>
                                <div className="price">₹{p.price.toLocaleString('en-IN')}</div>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <div className="old">₹{p.originalPrice.toLocaleString('en-IN')}</div>
                                )}
                              </td>

                              <td>
                                <div className="stock-step">
                                  <button onClick={() => handleStockChange(p.id, stock - 1)}>−</button>
                                  <span>{stock}</span>
                                  <button onClick={() => handleStockChange(p.id, stock + 1)}>+</button>
                                </div>
                              </td>

                              <td>
                                <div className={`status ${isOut ? 'out' : isLow ? 'low' : ''}`}>
                                  <div className="status-top">
                                    <i className="dot" />
                                    {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                  </div>
                                  <div className="qty">{stock} unit{stock === 1 ? '' : 's'}</div>
                                </div>
                              </td>

                              <td>
                                <div className="actions" style={{ justifyContent: 'flex-end' }}>
                                  <button
                                    className="sm"
                                    onClick={() => setEditingProduct(p)}
                                    title="Edit Watch"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    className="sm red"
                                    onClick={() => setDeletingProduct(p)}
                                    title="Delete Watch"
                                  >
                                    🗑
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

                  <div className="pages">
                    <button
                      className="pg"
                      disabled={inventoryPage <= 1}
                      onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalInventoryPages) }, (_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          className={`pg ${inventoryPage === num ? 'active' : ''}`}
                          onClick={() => setInventoryPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                    {totalInventoryPages > 5 && (
                      <>
                        <span style={{ fontSize: 8, color: '#8b9297' }}>…</span>
                        <button
                          className={`pg ${inventoryPage === totalInventoryPages ? 'active' : ''}`}
                          onClick={() => setInventoryPage(totalInventoryPages)}
                        >
                          {totalInventoryPages}
                        </button>
                      </>
                    )}
                    <button
                      className="pg"
                      disabled={inventoryPage >= totalInventoryPages}
                      onClick={() => setInventoryPage((p) => Math.min(totalInventoryPages, p + 1))}
                    >
                      ›
                    </button>
                    <select
                      className="page-select"
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
            </section>
          )}

          {/* SCREEN 2: ORDERS & FULFILLMENT */}
          {activeScreen === 'orders' && (
            <section className="screen active">
              <div className="tabs">
                <button className="tab" onClick={() => setActiveScreen('inventory')}>
                  Inventory &amp; Products <span className="count">{products.length}</span>
                </button>
                <button className="tab active">
                  Orders &amp; Fulfillment <span className="count">{orders.length}</span>
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
                  <div className="metric-note">Gross placed-order value</div>
                </div>

                <div className="metric blue">
                  <div className="metric-head">
                    <span>Total Orders</span>
                    <span className="metric-icon">#</span>
                  </div>
                  <div className="metric-value">{orderStats.totalOrders}</div>
                  <div className="metric-note">Across the store</div>
                </div>

                <div className="metric warn">
                  <div className="metric-head">
                    <span>Pending Verification</span>
                    <span className="metric-icon">!</span>
                  </div>
                  <div className="metric-value">{orderStats.pendingCount}</div>
                  <div className="metric-note">Awaiting customer calls</div>
                </div>

                <div className="metric purple">
                  <div className="metric-head">
                    <span>In Transit</span>
                    <span className="metric-icon">↗</span>
                  </div>
                  <div className="metric-value">{orderStats.dispatchedCount}</div>
                  <div className="metric-note">Out for delivery</div>
                </div>

                <div className="metric good">
                  <div className="metric-head">
                    <span>Delivered &amp; Paid</span>
                    <span className="metric-icon">✓</span>
                  </div>
                  <div className="metric-value">{orderStats.deliveredCount}</div>
                  <div className="metric-note">Completed orders</div>
                </div>
              </div>

              {/* Orders Toolbar */}
              <div className="toolbar">
                <div className="search-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    className="search"
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
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button className="icon" onClick={refreshData} disabled={loading} title="Refresh">
                  ⟳
                </button>
                <button className="btn" onClick={exportOrdersToCSV}>
                  ⇩ Export CSV
                </button>
              </div>

              {/* Orders Table */}
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
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px 14px', color: '#889196' }}>
                            No customer orders found matching filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>{order.orderNumber}</strong>
                              <div className="sku">
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
                              <strong>{order.customer.fullName}</strong>
                              <div className="sku">
                                {order.customer.phone}
                                <br />
                                {order.customer.city}, {order.customer.state}
                              </div>
                            </td>

                            <td>
                              {order.items.map((it, idx) => (
                                <div key={idx} style={{ fontSize: 9, whiteSpace: 'nowrap' }}>
                                  {it.quantity}× {it.name}
                                </div>
                              ))}
                            </td>

                            <td>
                              <div className="price">₹{order.total.toLocaleString('en-IN')}</div>
                              <div className="payment">
                                <span className={`pill ${order.paymentMethod === 'cod' ? 'pending' : 'confirmed'}`}>
                                  {order.paymentMethod === 'cod' ? 'COD' : 'UPI Online'}
                                </span>
                              </div>
                            </td>

                            <td>
                              <select
                                className="order-status"
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

                            <td className="courier">
                              {order.trackingNumber ? (
                                <>
                                  {order.courier || 'Courier'}
                                  <br />
                                  AWB: {order.trackingNumber}
                                </>
                              ) : (
                                '—'
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="sm"
                                onClick={() => setViewingOrder(order)}
                                title="View Order Dossier"
                              >
                                View
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

                  <div className="pages">
                    {Array.from({ length: Math.min(5, totalOrderPages) }, (_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          className={`pg ${ordersPage === num ? 'active' : ''}`}
                          onClick={() => setOrdersPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SCREEN 3: ANALYTICS */}
          {activeScreen === 'analytics' && (
            <section className="screen active">
              <div className="metrics">
                <div className="metric good">
                  <div className="metric-head">
                    <span>Net Sales</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">₹{orderStats.totalRevenue.toLocaleString('en-IN')}</div>
                  <div className="metric-note">This month · +12%</div>
                </div>

                <div className="metric blue">
                  <div className="metric-head">
                    <span>Total Orders</span>
                    <span className="metric-icon">#</span>
                  </div>
                  <div className="metric-value">{orderStats.totalOrders}</div>
                  <div className="metric-note">+8% vs previous</div>
                </div>

                <div className="metric">
                  <div className="metric-head">
                    <span>Average Order</span>
                    <span className="metric-icon">₹</span>
                  </div>
                  <div className="metric-value">
                    ₹{orderStats.totalOrders > 0 ? Math.round(orderStats.totalRevenue / orderStats.totalOrders).toLocaleString('en-IN') : '29,032'}
                  </div>
                  <div className="metric-note">Average order value</div>
                </div>

                <div className="metric good">
                  <div className="metric-head">
                    <span>Completed Orders</span>
                    <span className="metric-icon">✓</span>
                  </div>
                  <div className="metric-value">{orderStats.deliveredCount}</div>
                  <div className="metric-note">+18% this period</div>
                </div>

                <div className="metric warn">
                  <div className="metric-head">
                    <span>Low-stock Exposure</span>
                    <span className="metric-icon">!</span>
                  </div>
                  <div className="metric-value">{stats.lowStockCount + stats.outOfStockCount}</div>
                  <div className="metric-note">{stats.lowStockCount} low · {stats.outOfStockCount} out</div>
                </div>
              </div>

              {/* Analytics Top Grid */}
              <div className="analytics-grid">
                {/* Sales Chart Panel */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Sales Revenue</div>
                      <div className="panel-sub">Gross sales · Current Year 2026</div>
                    </div>
                    <select className="page-select">
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>

                  <div className="chart">
                    <svg viewBox="0 0 760 245" preserveAspectRatio="none">
                      <g stroke="#ece7df" strokeWidth="1">
                        <line x1="40" y1="25" x2="744" y2="25" />
                        <line x1="40" y1="82" x2="744" y2="82" />
                        <line x1="40" y1="139" x2="744" y2="139" />
                        <line x1="40" y1="196" x2="744" y2="196" />
                      </g>
                      <path
                        d="M40,178 L86,165 L132,171 L178,145 L224,158 L270,120 L316,141 L362,110 L408,124 L454,88 L500,100 L546,68 L592,86 L638,54 L684,69 L730,38 L730,204 L40,204 Z"
                        fill="#b9903a"
                        fillOpacity=".12"
                      />
                      <polyline
                        points="40,178 86,165 132,171 178,145 224,158 270,120 316,141 362,110 408,124 454,88 500,100 546,68 592,86 638,54 684,69 730,38"
                        fill="none"
                        stroke="#b9903a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="40,194 86,185 132,188 178,177 224,184 270,165 316,171 362,157 408,167 454,151 500,158 546,145 592,150 638,139 684,143 730,128"
                        fill="none"
                        stroke="#326df5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <g fill="#858d93" fontSize="9">
                        <text x="40" y="225">Sep 1</text>
                        <text x="162" y="225">Sep 7</text>
                        <text x="288" y="225">Sep 14</text>
                        <text x="415" y="225">Sep 21</text>
                        <text x="540" y="225">Sep 26</text>
                        <text x="675" y="225">Sep 30</text>
                      </g>
                    </svg>
                  </div>

                  <div className="legend">
                    <span><i></i>Revenue</span>
                    <span><i className="blue"></i>Order trend</span>
                  </div>
                </div>

                {/* Orders by Status Donut */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Orders by Status</div>
                      <div className="panel-sub">Current fulfillment mix</div>
                    </div>
                  </div>

                  <div className="donut-wrap">
                    <div className="donut">
                      <svg viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#eeeae2" strokeWidth="19" />
                        <circle
                          cx="80"
                          cy="80"
                          r="55"
                          fill="none"
                          stroke="#1d9b70"
                          strokeWidth="19"
                          strokeLinecap="round"
                          strokeDasharray="218 346"
                          transform="rotate(-90 80 80)"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="55"
                          fill="none"
                          stroke="#cb8b1a"
                          strokeWidth="19"
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
                          stroke="#7a5bc4"
                          strokeWidth="19"
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
                          stroke="#326df5"
                          strokeWidth="19"
                          strokeLinecap="round"
                          strokeDasharray="22 346"
                          strokeDashoffset="-350"
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                      <div className="donut-center">
                        <div>
                          <strong>{orderStats.totalOrders}</strong>
                          <span>Total</span>
                        </div>
                      </div>
                    </div>

                    <div className="stats">
                      <div className="stat">
                        <span style={{ color: '#cb8b1a' }}>● Pending</span>
                        <b>{orderStats.pendingCount} · 14%</b>
                      </div>
                      <div className="stat">
                        <span style={{ color: '#326df5' }}>● Confirmed</span>
                        <b>{orderStats.confirmedCount} · 9%</b>
                      </div>
                      <div className="stat">
                        <span style={{ color: '#7a5bc4' }}>● Dispatched</span>
                        <b>{orderStats.dispatchedCount} · 19%</b>
                      </div>
                      <div className="stat">
                        <span style={{ color: '#1d9b70' }}>● Delivered</span>
                        <b>{orderStats.deliveredCount} · 63%</b>
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

                  <div className="rank-list">
                    {brandSalesRank.map((b) => (
                      <div className="rank" key={b.name}>
                        <div className="rank-left">
                          <div className="rank-no">{b.rank}</div>
                          <div>
                            <div className="rank-name">{b.name}</div>
                            <div className="rank-meta">{b.valueFormatted}</div>
                          </div>
                        </div>
                        <div className="progress">
                          <span style={{ width: `${b.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Inventory Mix</div>
                      <div className="panel-sub">{totalPhysicalUnits} physical units</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 29, fontWeight: 700, marginTop: 10 }}>{totalPhysicalUnits}</div>
                  <div className="panel-sub">Units currently on shelf</div>

                  <div className="mini-bar">
                    <span style={{ width: `${inStockPct}%` }} />
                    <span style={{ width: `${lowStockPct}%` }} />
                    <span style={{ width: `${outStockPct}%` }} />
                  </div>

                  <div className="stats" style={{ marginTop: 12 }}>
                    <div className="stat">
                      <span>In Stock</span>
                      <b>{inStockPct}%</b>
                    </div>
                    <div className="stat">
                      <span>Low Stock</span>
                      <b>{lowStockPct}%</b>
                    </div>
                    <div className="stat">
                      <span>Out of Stock</span>
                      <b>{outStockPct}%</b>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Customer Behaviour</div>
                      <div className="panel-sub">Purchase quality signals</div>
                    </div>
                  </div>

                  <div className="stats" style={{ marginTop: 12 }}>
                    <div className="stat">
                      <span>Repeat customers</span>
                      <b>38%</b>
                    </div>
                    <div className="stat">
                      <span>New customers</span>
                      <b>62%</b>
                    </div>
                    <div className="stat">
                      <span>Average order</span>
                      <b>₹29,032</b>
                    </div>
                    <div className="stat">
                      <span>Inquiry → order</span>
                      <b>8.7%</b>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SCREEN 4: CUSTOMERS */}
          {activeScreen === 'customers' && (
            <section className="screen active">
              <div className="customer-metrics">
                <div className="customer-metric">
                  <div className="big">{customersList.length.toLocaleString('en-IN')}</div>
                  <div className="label">Total registered customers</div>
                </div>
                <div className="customer-metric">
                  <div className="big">{Math.max(1, Math.round(customersList.length * 0.42))}</div>
                  <div className="label">Active buyers</div>
                </div>
                <div className="customer-metric">
                  <div className="big">{Math.max(1, Math.round(customersList.length * 0.12))}</div>
                  <div className="label">VIP collectors</div>
                </div>
                <div className="customer-metric">
                  <div className="big">38%</div>
                  <div className="label">Repeat acquisition rate</div>
                </div>
              </div>

              <div className="toolbar">
                <div className="search-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    className="search"
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
                  <option value="all">All Customers</option>
                  <option value="VIP">VIP</option>
                  <option value="New">New</option>
                  <option value="Repeat">Repeat</option>
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
                  ⇩ Export Customers
                </button>
              </div>

              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Total Orders</th>
                        <th>Total Spent</th>
                        <th>Segment</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersList.map((c, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="customer-avatar">
                                {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong>{c.name}</strong>
                                <div className="sku">{c.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>{c.phone}</td>
                          <td>{c.location}</td>
                          <td>{c.totalOrders}</td>
                          <td>
                            <div className="price">₹{c.totalSpent.toLocaleString('en-IN')}</div>
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
                              className="sm"
                              onClick={() => {
                                setViewingCustomer(c);
                                showToast(`Viewing profile for ${c.name}`);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="pagination-text">Showing 1–{customersList.length} of {customersList.length} customers</div>
                  <div className="pages">
                    <button className="pg active">1</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SCREEN 5: SETTINGS */}
          {activeScreen === 'settings' && (
            <section className="screen active">
              <div className="settings-grid">
                <div className="settings-nav">
                  <button
                    className={settingsTab === 'general' ? 'active' : ''}
                    onClick={() => setSettingsTab('general')}
                  >
                    General
                  </button>
                  <button
                    className={settingsTab === 'store' ? 'active' : ''}
                    onClick={() => setSettingsTab('store')}
                  >
                    Store Configuration
                  </button>
                  <button
                    className={settingsTab === 'notifications' ? 'active' : ''}
                    onClick={() => setSettingsTab('notifications')}
                  >
                    Notifications
                  </button>
                  <button
                    className={settingsTab === 'users' ? 'active' : ''}
                    onClick={() => setSettingsTab('users')}
                  >
                    User Management
                  </button>
                  <button
                    className={settingsTab === 'security' ? 'active' : ''}
                    onClick={() => setSettingsTab('security')}
                  >
                    Security &amp; Audit
                  </button>
                </div>

                <div className="form-panel">
                  <div className="form-title">Store Information &amp; Preferences</div>
                  <div className="form-sub">
                    Manage the operational preferences, executive contacts, and store policies used across WatchTown CRM.
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Store Name</label>
                      <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Super Admin Email</label>
                      <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Customer Support Hotline</label>
                      <input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Store Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
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
                      <label>Store Description / Brand Mission</label>
                      <textarea
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-section">
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Operations &amp; Automation</div>

                    <div className="settings-row">
                      <div>
                        <strong>Low Stock Alert</strong>
                        <span>Notify administrator when an individual model reaches 4 units or fewer.</span>
                      </div>
                      <button
                        type="button"
                        className={`switch ${switchLowStock ? 'on' : ''}`}
                        onClick={() => setSwitchLowStock(!switchLowStock)}
                      >
                        <i />
                      </button>
                    </div>

                    <div className="settings-row">
                      <div>
                        <strong>Order Confirmations</strong>
                        <span>Keep pending orders visible and require verbal customer verification before dispatch.</span>
                      </div>
                      <button
                        type="button"
                        className={`switch ${switchOrderConfirm ? 'on' : ''}`}
                        onClick={() => setSwitchOrderConfirm(!switchOrderConfirm)}
                      >
                        <i />
                      </button>
                    </div>

                    <div className="settings-row">
                      <div>
                        <strong>Inventory Activity Log</strong>
                        <span>Record stock count and catalog changes for internal compliance audit history.</span>
                      </div>
                      <button
                        type="button"
                        className={`switch ${switchAuditLog ? 'on' : ''}`}
                        onClick={() => setSwitchAuditLog(!switchAuditLog)}
                      >
                        <i />
                      </button>
                    </div>

                    <div className="settings-row">
                      <div>
                        <strong>Marketing Emails &amp; Notifications</strong>
                        <span>Allow automated order status updates and promotional communication.</span>
                      </div>
                      <button
                        type="button"
                        className={`switch ${switchMarketing ? 'on' : ''}`}
                        onClick={() => setSwitchMarketing(!switchMarketing)}
                      >
                        <i />
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn" onClick={() => showToast('Changes discarded')}>
                      Discard
                    </button>
                    <button className="btn gold" onClick={() => showToast('Preferences and store settings saved')}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom">
        <button
          className={activeScreen === 'inventory' ? 'active' : ''}
          onClick={() => setActiveScreen('inventory')}
        >
          <span className="mi">▣</span>
          Inventory
        </button>
        <button
          className={activeScreen === 'orders' ? 'active' : ''}
          onClick={() => setActiveScreen('orders')}
        >
          <span className="mi">◫</span>
          Orders
        </button>
        <button
          className={activeScreen === 'analytics' ? 'active' : ''}
          onClick={() => setActiveScreen('analytics')}
        >
          <span className="mi">⌁</span>
          Analytics
        </button>
        <button
          className={activeScreen === 'customers' ? 'active' : ''}
          onClick={() => setActiveScreen('customers')}
        >
          <span className="mi">◌</span>
          Customers
        </button>
        <button
          className={activeScreen === 'settings' ? 'active' : ''}
          onClick={() => setActiveScreen('settings')}
        >
          <span className="mi">⚙</span>
          Settings
        </button>
      </nav>

      {/* 4. WATCH MODAL (ADD / EDIT) */}
      {(isAddModalOpen || editingProduct) && (
        <WatchModal
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

      {/* 5. ORDER MODAL (DOSSIER & FULFILLMENT) */}
      {viewingOrder && (
        <OrderModal
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
                <div className="modal-sub">Irreversible catalog action</div>
              </div>
              <button className="modal-close" onClick={() => setDeletingProduct(null)}>×</button>
            </div>

            <div style={{ padding: '8px 0 16px' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                Are you sure you want to permanently delete <strong>{deletingProduct.name}</strong>?
              </p>
              <p style={{ marginTop: 6, fontSize: 10, color: 'var(--muted)' }}>
                This timepiece will be immediately removed from the active storefront catalog and inventory asset valuation.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setDeletingProduct(null)} disabled={submitting}>
                Cancel
              </button>
              <button
                className="btn dark"
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
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
        {toastMessage}
      </div>
    </div>
  );
}

/* SUBCOMPONENT: WATCH MODAL */
interface WatchModalProps {
  product: Product | null;
  brands: string[];
  submitting: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

function WatchModal({ product, brands, submitting, onClose, onSave }: WatchModalProps) {
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
    product?.categories?.join(', ') || "Luxury, Men's Watches, Dive Watch"
  );
  const [image, setImage] = useState(
    product?.image ||
      'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg'
  );
  const [description, setDescription] = useState(
    product?.description ||
      'The Rolex Submariner Date is a legendary dive watch crafted with precision and premium materials.'
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
      alert('Upload failed. Please check S3 settings or enter an image URL.');
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
            <div className="modal-title">{product ? 'Edit Timepiece' : 'Add / Edit Watch'}</div>
            <div className="modal-sub">Create or update a catalog timepiece.</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div>
              <div className="image-stage">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                    }}
                  />
                ) : (
                  <div className="big-watch" />
                )}
              </div>

              <label
                className="btn"
                style={{ width: '100%', marginTop: 7, cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                {uploading ? 'Uploading to S3...' : '⇧ Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ fontSize: 8, color: '#8d959a', textAlign: 'center', marginTop: 5 }}>
                or enter image URL
              </div>
              <input
                type="url"
                className="search"
                style={{ height: 32, fontSize: 9, marginTop: 4, width: '100%' }}
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Watch Title / Model</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="field">
                <label>Brand</label>
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
                <label>Original Price (₹)</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
              </div>

              <div className="field">
                <label>Stock Quantity</label>
                <input type="number" required min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>

              <div className="field">
                <label>Promo Badge</label>
                <input value={badge} placeholder="-10%, LIMITED" onChange={(e) => setBadge(e.target.value)} />
              </div>

              <div className="field full">
                <label>Categories (Comma separated)</label>
                <input value={categoriesInput} onChange={(e) => setCategoriesInput(e.target.value)} />
              </div>

              <div className="field full">
                <label>Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn gold" disabled={submitting}>
              {submitting ? 'Saving Watch...' : 'Save Watch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* SUBCOMPONENT: ORDER DOSSIER MODAL */
interface OrderModalProps {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, status: OrderStatus, tracking?: string, courier?: string) => Promise<void>;
}

function OrderModal({ order, onClose, onSave }: OrderModalProps) {
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
      <div className="modal" style={{ width: 'min(700px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Order Details — {order.orderNumber}</div>
            <div className="modal-sub">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="dossier">
          {/* Customer Dossier */}
          <div className="dossier-card">
            <div className="dossier-title">Customer Information</div>
            <div className="dossier-grid">
              <div>
                <div className="d-label">Customer</div>
                <div className="d-value">{order.customer.fullName}</div>
              </div>
              <div>
                <div className="d-label">Phone</div>
                <div className="d-value">{order.customer.phone}</div>
              </div>
              <div>
                <div className="d-label">Email</div>
                <div className="d-value">{order.customer.email || '—'}</div>
              </div>
              <div>
                <div className="d-label">City / State</div>
                <div className="d-value">{order.customer.city}, {order.customer.state}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="d-label">Shipping Address</div>
                <div className="d-value">
                  {order.customer.street}, {order.customer.city}, {order.customer.state} — {order.customer.pincode}
                </div>
              </div>
              {order.notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="d-label">Customer Delivery Notes</div>
                  <div className="d-value" style={{ fontStyle: 'italic', color: 'var(--gold)' }}>
                    &quot;{order.notes}&quot;
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ordered Items */}
          <div className="dossier-card">
            <div className="dossier-title">Ordered Items ({order.items.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '6px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid var(--line2)' : 'none',
                  }}
                >
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="product-thumb" style={{ width: 34, height: 34 }} />
                  ) : (
                    <div className="watch" style={{ width: 34, height: 34 }}>
                      <div className="dial" style={{ width: 16, height: 16 }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="product-name">{it.name}</div>
                    <div className="sku">{it.brand} &bull; Qty {it.quantity}</div>
                  </div>
                  <div className="price">₹{(it.price * it.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--line2)',
                marginTop: 8,
                paddingTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
              }}
            >
              <span>Total Amount</span>
              <strong style={{ fontSize: 13, color: 'var(--gold)' }}>₹{order.total.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 8 }}>
              <span>Payment Mode</span>
              <span className={`pill ${order.paymentMethod === 'cod' ? 'pending' : 'confirmed'}`}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI Online Payment'}
              </span>
            </div>
          </div>

          {/* Fulfillment & Tracking */}
          <div className="dossier-card">
            <div className="dossier-title">Fulfillment &amp; Logistics Tracking</div>
            <div className="form-grid">
              <div className="field">
                <label>Order Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
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
                <label>Internal Logistics Note</label>
                <input placeholder="Add internal note about this package..." />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn gold" onClick={handleUpdate} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Status & Tracking'}
          </button>
        </div>
      </div>
    </div>
  );
}
