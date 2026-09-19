'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  Search,
  Download,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  LogOut,
  X,
  Minus,
  DollarSign,
  ShieldCheck,
  Tag,
  Store,
  Filter,
  ShoppingBag,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Eye,
  Upload,
} from 'lucide-react';
import { Product, InventoryStats, AuthSession, Order, OrderStats, OrderStatus } from '@/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminDashboardClientProps {
  initialSession: AuthSession;
  initialProducts: Product[];
  initialStats: InventoryStats;
  brands: string[];
  categories: string[];
  initialOrders?: Order[];
  initialOrderStats?: OrderStats;
}

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

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  // Product state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stats, setStats] = useState<InventoryStats>(initialStats);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orderStats, setOrderStats] = useState<OrderStats>(initialOrderStats);

  const [loading, setLoading] = useState(false);

  // Inventory Filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_desc' | 'price_asc' | 'stock_desc' | 'stock_asc' | 'name_asc'>('newest');

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Refresh live data
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
      addToast('Data refreshed successfully', 'info');
    } catch {
      addToast('Failed to refresh data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  // Quick Stock Adjustment
  const handleStockChange = async (productId: string | number, newStock: number) => {
    const validStock = Math.max(0, newStock);

    setProducts((prev) =>
      prev.map((p) =>
        String(p.id) === String(productId)
          ? { ...p, stock: validStock, inStock: validStock > 0 }
          : p
      )
    );

    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: validStock }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');

      addToast(`Stock updated to ${validStock} units`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stock';
      addToast(msg, 'error');
      refreshData();
    }
  };

  // Order Status Update
  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    trackingNumber?: string,
    courier?: string
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, trackingNumber, courier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder(data.order);
      }
      addToast(`Order ${data.order.orderNumber} status changed to ${newStatus.toUpperCase()}`);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating order';
      addToast(msg, 'error');
    }
  };

  // Delete product
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
      addToast(`Deleted "${deletingProduct.name}"`);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Product Form Handler
  const handleSaveProduct = async (formData: Partial<Product>) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update product');

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        );
        setEditingProduct(null);
        addToast(`Updated "${formData.name}"`);
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add product');

        setProducts((prev) => [data.product, ...prev]);
        setIsAddModalOpen(false);
        addToast(`Added new watch: "${formData.name}"`);
      }
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving product';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Inventory Export
  const exportInventoryToCSV = () => {
    const headers = ['SKU', 'Brand', 'Name', 'Price (INR)', 'Original Price (INR)', 'Stock', 'Valuation (INR)', 'Status'];
    const rows = products.map((p) => [
      p.sku || '',
      `"${p.brand || ''}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.price,
      p.originalPrice || p.price,
      p.stock ?? 0,
      (p.stock ?? 0) * p.price,
      (p.stock ?? 0) > 4 ? 'In Stock' : (p.stock ?? 0) > 0 ? 'Low Stock' : 'Out of Stock',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `watchtown-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Inventory CSV export ready!', 'info');
  };

  // CSV Orders Export
  const exportOrdersToCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'City', 'Total (INR)', 'Payment Mode', 'Status', 'Courier', 'Tracking'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customer.fullName.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.city}"`,
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
    link.setAttribute('download', `watchtown-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Orders CSV export ready!', 'info');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (search.trim()) {
          const s = search.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(s);
          const matchesBrand = (p.brand || '').toLowerCase().includes(s);
          const matchesSku = (p.sku || '').toLowerCase().includes(s);
          if (!matchesName && !matchesBrand && !matchesSku) return false;
        }
        if (selectedBrand !== 'all' && (p.brand || '').toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
        if (selectedCategory !== 'all' && !p.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) {
          return false;
        }
        const stock = p.stock ?? 0;
        if (stockStatus === 'in_stock' && stock <= 4) return false;
        if (stockStatus === 'low_stock' && (stock <= 0 || stock > 4)) return false;
        if (stockStatus === 'out_of_stock' && stock > 0) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_desc':
            return b.price - a.price;
          case 'price_asc':
            return a.price - b.price;
          case 'stock_desc':
            return (b.stock ?? 0) - (a.stock ?? 0);
          case 'stock_asc':
            return (a.stock ?? 0) - (b.stock ?? 0);
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'newest':
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
  }, [products, search, selectedBrand, selectedCategory, stockStatus, sortBy]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
        return false;
      }
      if (orderSearch.trim()) {
        const s = orderSearch.toLowerCase().trim();
        const matchNum = o.orderNumber.toLowerCase().includes(s);
        const matchName = o.customer.fullName.toLowerCase().includes(s);
        const matchPhone = o.customer.phone.includes(s);
        const matchCity = o.customer.city.toLowerCase().includes(s);
        if (!matchNum && !matchName && !matchPhone && !matchCity) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg)' }}>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-logo-badge">
            <ShieldCheck size={18} />
            WATCHTOWN CRM
          </span>
          <div className="admin-title-wrap">
            <h1>Executive Control &amp; Inventory Management</h1>
            <p>End-to-End Watch Catalog, Stock Valuation, and Customer Order Fulfillment</p>
          </div>
        </div>

        <div className="admin-nav-actions">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-secondary admin-btn-sm"
          >
            <Store size={14} /> View Storefront <ExternalLink size={12} />
          </a>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'var(--admin-surface)',
              borderRadius: 'var(--admin-radius-sm)',
              border: '1px solid var(--admin-border)',
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--admin-text-muted)' }}>Admin:</span>
            <strong style={{ color: 'var(--admin-text-main)' }}>
              {initialSession.name || initialSession.email}
            </strong>
          </div>

          <button
            onClick={handleLogout}
            className="admin-btn admin-btn-secondary admin-btn-sm"
            title="Sign out"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="admin-container">
        {/* Top Tab Switcher */}
        <div className="admin-tab-nav">
          <button
            className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={16} /> Inventory &amp; Products
            <span className="admin-count-pill">{products.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={16} /> Orders &amp; Fulfillment
            <span className="admin-count-pill">{orders.length}</span>
          </button>
        </div>

        {/* VIEW 1: INVENTORY & PRODUCTS */}
        {activeTab === 'inventory' && (
          <div>
            {/* KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total Catalog</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                    <Package size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value">{stats.totalProducts}</div>
                <div className="admin-kpi-sub">{stats.totalBrands} Luxury Brands</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Physical Units</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <Layers size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value">{stats.totalStock}</div>
                <div className="admin-kpi-sub">Warehouse units on shelf</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Stock Valuation</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#e5be42' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#d4af37' }}>
                  ₹{stats.totalValuation.toLocaleString('en-IN')}
                </div>
                <div className="admin-kpi-sub">Total inventory asset value</div>
              </div>

              <div
                className="admin-kpi-card"
                style={{ cursor: 'pointer', borderColor: stockStatus === 'low_stock' ? '#f59e0b' : undefined }}
                onClick={() => setStockStatus(stockStatus === 'low_stock' ? 'all' : 'low_stock')}
              >
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Low Stock Alert</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#fbbf24' }}>{stats.lowStockCount}</div>
                <div className="admin-kpi-sub" style={{ color: '#fbbf24' }}>&le; 4 units remaining</div>
              </div>

              <div
                className="admin-kpi-card"
                style={{ cursor: 'pointer', borderColor: stockStatus === 'out_of_stock' ? '#ef4444' : undefined }}
                onClick={() => setStockStatus(stockStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
              >
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Out of Stock</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#f87171' }}>{stats.outOfStockCount}</div>
                <div className="admin-kpi-sub" style={{ color: '#f87171' }}>0 units on shelf</div>
              </div>
            </div>

            {/* Inventory Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-box">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by watch name, SKU, brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="admin-filters-group">
                <select className="admin-select" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                  <option value="all">All Brands ({brands.length})</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>

                <select className="admin-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="admin-select" value={stockStatus} onChange={(e) => setStockStatus(e.target.value as typeof stockStatus)}>
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (&gt; 4)</option>
                  <option value="low_stock">Low Stock (1-4)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>

                <select className="admin-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
                  <option value="newest">Newest Arrival</option>
                  <option value="stock_asc">Stock (Low to High)</option>
                  <option value="stock_desc">Stock (High to Low)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="price_asc">Price (Low to High)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={refreshData} disabled={loading} className="admin-btn admin-btn-secondary" title="Refresh">
                  <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
                </button>
                <button onClick={exportInventoryToCSV} className="admin-btn admin-btn-secondary">
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={() => setIsAddModalOpen(true)} className="admin-btn admin-btn-primary">
                  <Plus size={16} /> Add Watch
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="admin-table-card">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product &amp; SKU</th>
                      <th>Brand &amp; Category</th>
                      <th>Price / Regular</th>
                      <th style={{ textAlign: 'center' }}>Stock &amp; Quick Adjust</th>
                      <th>Inventory Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                          No matching watches found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const stock = product.stock ?? 0;
                        const isLowStock = stock > 0 && stock <= 4;
                        const isOutOfStock = stock <= 0;

                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="admin-prod-cell">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="admin-prod-thumb"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                                  }}
                                />
                                <div className="admin-prod-details">
                                  <h4>{product.name}</h4>
                                  <div className="admin-prod-meta">
                                    <span className="admin-sku-tag">{product.sku || `WT-${product.id}`}</span>
                                    {product.badge && (
                                      <span className="admin-badge admin-badge-gold">
                                        <Tag size={10} /> {product.badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: '#f3f4f6', marginBottom: 4 }}>
                                {product.brand || 'Luxury Watch'}
                              </div>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {product.categories.slice(0, 2).map((c) => (
                                  <span key={c} style={{ fontSize: 11, background: 'rgba(255, 255, 255, 0.06)', padding: '1px 6px', borderRadius: 4, color: '#9ca3af' }}>
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 700, color: '#d4af37', fontSize: 14 }}>
                                ₹{product.price.toLocaleString('en-IN')}
                              </div>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <div style={{ fontSize: 11, color: '#6b7280', textDecoration: 'line-through' }}>
                                  ₹{product.originalPrice.toLocaleString('en-IN')}
                                </div>
                              )}
                            </td>

                            {/* Stock Stepper */}
                            <td style={{ textAlign: 'center' }}>
                              <div className="admin-stock-control">
                                <button
                                  type="button"
                                  className="admin-stock-btn"
                                  disabled={stock <= 0}
                                  onClick={() => handleStockChange(product.id, stock - 1)}
                                >
                                  <Minus size={13} />
                                </button>
                                <input
                                  type="number"
                                  className="admin-stock-input"
                                  value={stock}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    handleStockChange(product.id, isNaN(val) ? 0 : val);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="admin-stock-btn"
                                  onClick={() => handleStockChange(product.id, stock + 1)}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </td>

                            <td>
                              {isOutOfStock ? (
                                <span className="admin-badge admin-badge-danger">
                                  <AlertTriangle size={11} /> Out of Stock (0)
                                </span>
                              ) : isLowStock ? (
                                <span className="admin-badge admin-badge-warning">
                                  <AlertTriangle size={11} /> Low Stock ({stock})
                                </span>
                              ) : (
                                <span className="admin-badge admin-badge-success">
                                  <CheckCircle2 size={11} /> In Stock ({stock})
                                </span>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6 }}>
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="admin-btn admin-btn-secondary admin-btn-sm"
                                  title="Edit watch"
                                >
                                  <Edit2 size={13} /> Edit
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(product)}
                                  className="admin-btn admin-btn-danger admin-btn-sm"
                                  title="Delete watch"
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
            </div>
          </div>
        )}

        {/* VIEW 2: ORDERS & FULFILLMENT CRM */}
        {activeTab === 'orders' && (
          <div>
            {/* Orders KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total Sales Revenue</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#e5be42' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#d4af37' }}>
                  ₹{orderStats.totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="admin-kpi-sub">Total customer orders gross value</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total Orders</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value">{orderStats.totalOrders}</div>
                <div className="admin-kpi-sub">Placed customer watch orders</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Pending Verification</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#fbbf24' }}>
                  {orderStats.pendingCount}
                </div>
                <div className="admin-kpi-sub">Awaiting confirmation call</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">In Transit (Dispatched)</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <Truck size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#a78bfa' }}>
                  {orderStats.dispatchedCount}
                </div>
                <div className="admin-kpi-sub">Couriers out for delivery</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Delivered &amp; Paid</span>
                  <div className="admin-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="admin-kpi-value" style={{ color: '#34d399' }}>
                  {orderStats.deliveredCount}
                </div>
                <div className="admin-kpi-sub">Successfully fulfilled orders</div>
              </div>
            </div>

            {/* Orders Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-box">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by order #, customer name, phone, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="admin-filters-group">
                <select
                  className="admin-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={refreshData} disabled={loading} className="admin-btn admin-btn-secondary">
                  <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
                </button>
                <button onClick={exportOrdersToCSV} className="admin-btn admin-btn-secondary">
                  <Download size={14} /> Export Orders CSV
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="admin-table-card">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order &amp; Date</th>
                      <th>Customer Information</th>
                      <th>Ordered Watches</th>
                      <th>Amount &amp; Mode</th>
                      <th>Fulfillment Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                          No customer orders found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        return (
                          <tr key={order.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#f3f4f6', fontSize: 14 }}>
                                {order.orderNumber}
                              </div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                {new Date(order.createdAt).toLocaleString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: '#f3f4f6' }}>
                                {order.customer.fullName}
                              </div>
                              <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Phone size={11} /> {order.customer.phone}
                              </div>
                              <div style={{ fontSize: 11, color: '#6b7280' }}>
                                {order.customer.city}, {order.customer.state}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {order.items.map((it, idx) => (
                                  <div key={idx} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontWeight: 700, color: '#d4af37' }}>{it.quantity}x</span>
                                    <span style={{ color: '#e5e7eb', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {it.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 700, color: '#d4af37', fontSize: 14 }}>
                                ₹{order.total.toLocaleString('en-IN')}
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: '#9ca3af',
                                  textTransform: 'uppercase',
                                  display: 'inline-block',
                                  marginTop: 2,
                                }}
                              >
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Online'}
                              </span>
                            </td>

                            <td>
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                className={`admin-badge admin-order-badge-${order.status}`}
                                style={{ cursor: 'pointer', outline: 'none', border: 'none' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              {order.trackingNumber && (
                                <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 4, fontFamily: 'monospace' }}>
                                  {order.courier}: {order.trackingNumber}
                                </div>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => setViewingOrder(order)}
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                              >
                                <Eye size={13} /> View Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {(isAddModalOpen || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          isOpen={isAddModalOpen || !!editingProduct}
          brands={brands}
          categories={categories}
          submitting={submitting}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal-header">
              <h2>Confirm Deletion</h2>
              <button
                onClick={() => setDeletingProduct(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, color: 'var(--admin-text-main)', fontSize: 14 }}>
                Are you sure you want to delete <strong>{deletingProduct.name}</strong>?
              </p>
              <p style={{ marginTop: 8, color: 'var(--admin-text-dim)', fontSize: 12 }}>
                This will remove the item completely from the catalog and inventory valuation.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setDeletingProduct(null)} className="admin-btn admin-btn-secondary" disabled={submitting}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="admin-btn admin-btn-danger" disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete Watch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Invoice Details Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onStatusChange={handleOrderStatusChange}
        />
      )}

      {/* Toast Notification Container */}
      <div className="admin-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`admin-toast ${
              toast.type === 'error'
                ? 'admin-toast-error'
                : toast.type === 'success'
                ? 'admin-toast-success'
                : ''
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
            {toast.type === 'error' && <AlertTriangle size={16} style={{ color: '#ef4444' }} />}
            {toast.type === 'info' && <TrendingUp size={16} style={{ color: '#d4af37' }} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcomponent: Order Details Modal
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus, tracking?: string, courier?: string) => void;
}

function OrderDetailsModal({ order, onClose, onStatusChange }: OrderDetailsModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [courier, setCourier] = useState(order.courier || 'BlueDart Express');
  const [tracking, setTracking] = useState(order.trackingNumber || '');

  const handleUpdate = () => {
    onStatusChange(order.id, status, tracking.trim() || undefined, courier.trim() || undefined);
    onClose();
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 600 }}>
        <div className="admin-modal-header">
          <div>
            <h2>Order Details: {order.orderNumber}</h2>
            <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginTop: 2 }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Customer info */}
          <div style={{ background: 'var(--admin-surface)', padding: 16, borderRadius: 8, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Customer Shipping Address
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f3f4f6' }}>{order.customer.fullName}</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              {order.customer.street}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              Phone: <strong>{order.customer.phone}</strong> {order.customer.email && `• ${order.customer.email}`}
            </div>
            {order.notes && (
              <div style={{ fontSize: 12, color: '#d4af37', marginTop: 8, fontStyle: 'italic' }}>
                Note: &quot;{order.notes}&quot;
              </div>
            )}
          </div>

          {/* Items breakdown */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Ordered Items ({order.items.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    background: 'var(--admin-surface)',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={it.image} alt={it.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6' }}>{it.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{it.brand} &bull; Qty: {it.quantity}</div>
                    </div>
                  </div>
                  <strong style={{ color: '#d4af37', fontSize: 13 }}>₹{(it.price * it.quantity).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 15, fontWeight: 800 }}>
              <span style={{ color: 'var(--admin-text-muted)' }}>Total Order Value:</span>
              <span style={{ color: '#d4af37' }}>₹{order.total.toLocaleString('en-IN')} ({order.paymentMethod.toUpperCase()})</span>
            </div>
          </div>

          {/* Fulfillment update controls */}
          <div style={{ borderTop: '1px solid var(--admin-card-border)', paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Fulfillment &amp; Courier Tracking
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Order Status</label>
              <select className="admin-select" style={{ width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Courier Partner</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. BlueDart Express, Delhivery"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">AWB / Tracking Number</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. BD-89217498"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button onClick={onClose} className="admin-btn admin-btn-secondary">
            Close
          </button>
          <button onClick={handleUpdate} className="admin-btn admin-btn-primary">
            Save Status &amp; Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Product Add/Edit Modal
interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  brands: string[];
  categories: string[];
  submitting: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

function ProductFormModal({
  product,
  brands,
  submitting,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || brands[0] || 'Rolex');
  const [sku, setSku] = useState(product?.sku || '');
  const [price, setPrice] = useState(product ? String(product.price) : '2499');
  const [originalPrice, setOriginalPrice] = useState(
    product?.originalPrice ? String(product.originalPrice) : '4999'
  );
  const [stock, setStock] = useState(product ? String(product.stock ?? 10) : '15');
  const [badge, setBadge] = useState(product?.badge || '-50%');
  const [categoriesInput, setCategoriesInput] = useState(
    product?.categories?.join(', ') || "Watches, Men's Watches"
  );
  const [image, setImage] = useState(
    product?.image ||
      'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg'
  );
  const [description, setDescription] = useState(
    product?.description ||
      'Master crafted 7AA luxury replica with original Japanese automatic movement, solid stainless steel links, sapphire glass, and luxury brand gift box.'
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'watches');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setImage(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
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
      originalPrice: Number(originalPrice),
      stock: Math.max(0, Number(stock)),
      badge: badge.trim() || undefined,
      categories: parsedCats.length > 0 ? parsedCats : ['Watches'],
      image: image.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2>{product ? 'Edit Luxury Watch' : 'Add New Watch to Inventory'}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="admin-label" style={{ margin: 0 }}>Product Image</label>
                <label
                  className="admin-btn admin-btn-secondary"
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Upload size={13} />
                  {uploading ? 'Uploading to S3...' : 'Upload Image (S3)'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <img
                  src={image}
                  alt="Preview"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    objectFit: 'cover',
                    border: '1px solid var(--admin-border)',
                    background: '#181d29',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    required
                    className="admin-input"
                    value={image}
                    placeholder="https://... or S3 URL"
                    onChange={(e) => setImage(e.target.value)}
                  />
                  {uploadError ? (
                    <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
                      {uploadError}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 4 }}>
                      Upload directly to S3 or paste image URL
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Watch Title / Model</label>
              <input
                type="text"
                required
                className="admin-input"
                placeholder="e.g. Rolex Day-Date 40mm Olive Green Dial"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Brand</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  placeholder="e.g. Rolex, Patek Philippe, Audemars Piguet"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">SKU Identifier</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Auto-generated if blank"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  className="admin-input"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Original Price (₹)</label>
                <input
                  type="number"
                  className="admin-input"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Stock Quantity</label>
                <input
                  type="number"
                  required
                  className="admin-input"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Promo Badge</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. -50%, HOT, LIMITED"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Categories (Comma separated)</label>
              <input
                type="text"
                className="admin-input"
                placeholder="Watches, Men's Watches, Automatic Watches"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Product Description</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving Watch...' : product ? 'Update Watch' : 'Create & Add to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
