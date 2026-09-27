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
  FileText,
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
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  totalOrders: number;
  totalSpent: number;
  totalItems?: number;
  segment: 'Active' | 'Repeat' | 'VIP' | 'New';
  customerOrders?: Order[];
  firstOrderDate?: string;
  lastOrderDate?: string;
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
  const [ordersPerPage, setOrdersPerPage] = useState(10);

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
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Analytics UI State
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<{ displayDate: string; revenue: number; orders: number; x: number; y: number } | null>(null);

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
      prev.map((p) => (p.id === productId ? { ...p, stock: validStock, inStock: validStock > 0 } : p))
    );
    setViewingProductDetails((prev) =>
      prev && prev.id === productId ? { ...prev, stock: validStock, inStock: validStock > 0 } : prev
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

  // PDF Export: Inventory
  const exportInventoryToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('WATCHTOWN LUXURY HOROLOGY', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Inventory & Products Catalog Report | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 21);

      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `Total Products: ${products.length}  |  Total Stock Units: ${stats.totalStock || 0}  |  Valuation: Rs. ${(stats.totalValuation || 0).toLocaleString('en-IN')}`,
        14,
        27
      );

      doc.setDrawColor(185, 144, 58);
      doc.setLineWidth(0.7);
      doc.line(14, 30, 283, 30);

      const headers = ['ID', 'SKU', 'Product Name', 'Brand', 'MRP (INR)', 'Stock', 'Status'];
      const rows = products.map((p) => {
        const stock = p.stock ?? 0;
        const status = stock > 4 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';
        const mrp = (p.originalPrice || p.price || 0).toLocaleString('en-IN');
        return [
          String(p.id),
          p.sku || `WT-${p.id}`,
          p.name,
          p.brand || 'Luxury Horology',
          `Rs. ${mrp}`,
          String(stock),
          status,
        ];
      });

      (autoTable as any)(doc, {
        head: [headers],
        body: rows,
        startY: 34,
        theme: 'grid',
        styles: {
          fontSize: 8.5,
          cellPadding: 2.5,
          textColor: [15, 23, 42],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 16 },
          1: { cellWidth: 26 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 35 },
          4: { cellWidth: 32, halign: 'right' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 26, halign: 'center' },
        },
        didDrawPage: (data: any) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount} — Confidential • WatchTown Executive Management Suite`,
            14,
            doc.internal.pageSize.height - 8
          );
        },
      });

      doc.save(`watchtown_inventory_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('Inventory PDF exported');
    } catch (err) {
      console.error('Failed to export inventory PDF:', err);
      showToast('Error exporting inventory PDF');
    }
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
      const cleanPhone = (o.customer.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const cleanEmail = (o.customer.email || '').trim().toLowerCase();
      const cleanName = (o.customer.fullName || '').trim().toLowerCase();
      const key = cleanEmail || cleanPhone || cleanName;
      const orderItemsCount = o.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

      if (!map.has(key)) {
        map.set(key, {
          name: o.customer.fullName,
          email: o.customer.email || `${o.customer.fullName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          phone: o.customer.phone,
          location: `${o.customer.city}, ${o.customer.state}`,
          street: o.customer.street,
          city: o.customer.city,
          state: o.customer.state,
          pincode: o.customer.pincode,
          totalOrders: 1,
          totalSpent: o.total,
          totalItems: orderItemsCount,
          segment: o.total >= 10000 ? 'VIP' : 'New',
          customerOrders: [o],
          firstOrderDate: o.createdAt,
          lastOrderDate: o.createdAt,
        });
      } else {
        const item = map.get(key)!;
        item.totalOrders += 1;
        item.totalSpent += o.total;
        item.totalItems = (item.totalItems || 0) + orderItemsCount;
        item.customerOrders = [...(item.customerOrders || []), o];
        item.segment = item.totalSpent >= 15000 || item.totalOrders >= 3 ? 'VIP' : item.totalOrders >= 2 ? 'Repeat' : 'Active';
        if (new Date(o.createdAt) < new Date(item.firstOrderDate || o.createdAt)) {
          item.firstOrderDate = o.createdAt;
        }
        if (new Date(o.createdAt) > new Date(item.lastOrderDate || o.createdAt)) {
          item.lastOrderDate = o.createdAt;
        }
      }
    });

    // Ensure customerOrders are sorted latest first
    map.forEach((c) => {
      if (c.customerOrders) {
        c.customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    });

    if (map.size < 5) {
      const sampleCustomers: CustomerProfile[] = [
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@gmail.com',
          phone: '+91 98765 43210',
          location: 'Mumbai, Maharashtra',
          street: '14, Altamount Road, Cumballa Hill',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400026',
          totalOrders: 3,
          totalSpent: 18500,
          segment: 'VIP',
          customerOrders: orders.slice(0, 2),
        },
        {
          name: 'Priya Mehta',
          email: 'priya.mehta@gmail.com',
          phone: '+91 98765 12345',
          location: 'Delhi, Delhi',
          street: '88, Jor Bagh, Lodhi Road',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110003',
          totalOrders: 2,
          totalSpent: 12998,
          segment: 'Repeat',
          customerOrders: orders.slice(2, 3),
        },
        {
          name: 'Amit Patel',
          email: 'amit.patel@gmail.com',
          phone: '+91 89876 54321',
          location: 'Bengaluru, Karnataka',
          street: 'Villa 5, Prestige Golfshire, Nandi Hills',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '562110',
          totalOrders: 4,
          totalSpent: 26000,
          segment: 'VIP',
          customerOrders: orders.slice(0, 3),
        },
        {
          name: 'Neha Verma',
          email: 'neha.verma@gmail.com',
          phone: '+91 91234 56789',
          location: 'Pune, Maharashtra',
          street: '22, Boat Club Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          totalOrders: 1,
          totalSpent: 6499,
          segment: 'New',
          customerOrders: orders.slice(1, 2),
        },
        {
          name: 'Vikram Singh',
          email: 'vikram.singh@gmail.com',
          phone: '+91 97865 67890',
          location: 'Jaipur, Rajasthan',
          street: '7, Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302006',
          totalOrders: 2,
          totalSpent: 13000,
          segment: 'Repeat',
          customerOrders: orders.slice(3, 4),
        },
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

  // PDF Export: Customers
  const exportCustomersToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('WATCHTOWN LUXURY HOROLOGY', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Customer Directory Dossier | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 21);

      const totalSpentAll = customersList.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `Total Customers: ${customersList.length}  |  Cumulative Lifetime Spend: Rs. ${totalSpentAll.toLocaleString('en-IN')}`,
        14,
        27
      );

      doc.setDrawColor(185, 144, 58);
      doc.setLineWidth(0.7);
      doc.line(14, 30, 283, 30);

      const headers = ['Customer Name', 'Contact Phone', 'Email Address', 'Destination Location', 'Orders', 'Total Spend (INR)'];
      const rows = customersList.map((c) => [
        c.name,
        c.phone,
        c.email || '—',
        c.location || '—',
        String(c.totalOrders),
        `Rs. ${(c.totalSpent || 0).toLocaleString('en-IN')}`,
      ]);

      (autoTable as any)(doc, {
        head: [headers],
        body: rows,
        startY: 34,
        theme: 'grid',
        styles: {
          fontSize: 8.5,
          cellPadding: 2.5,
          textColor: [15, 23, 42],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 35 },
          2: { cellWidth: 55 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 35, halign: 'right' },
        },
        didDrawPage: (data: any) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount} — Confidential • WatchTown Customer Relations Dossier`,
            14,
            doc.internal.pageSize.height - 8
          );
        },
      });

      doc.save(`watchtown_customers_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('Customer PDF exported');
    } catch (err) {
      console.error('Failed to export customer PDF:', err);
      showToast('Error exporting customer PDF');
    }
  };

  // Analytics derived metrics
  const totalPhysicalUnits = stats.totalStock || products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const inStockUnits = products.filter((p) => (p.stock ?? 0) > 4).reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const lowStockUnits = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 4).reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const inStockPct = totalPhysicalUnits > 0 ? Math.round((inStockUnits / totalPhysicalUnits) * 100) : 60;
  const lowStockPct = totalPhysicalUnits > 0 ? Math.round((lowStockUnits / totalPhysicalUnits) * 100) : 18;
  const outStockPct = Math.max(0, 100 - inStockPct - lowStockPct);

  // Dynamic daily revenue analytics computed from DB orders
  const analyticsTimeline = useMemo(() => {
    const dailyMap = new Map<string, { date: string; displayDate: string; revenue: number; orders: number }>();
    const daysSpan = analyticsRange === '7d' ? 7 : analyticsRange === '14d' ? 14 : analyticsRange === '30d' ? 30 : 60;

    const formatDayKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // Determine anchor date from latest order or current date
    const anchorDate = orders.reduce((latest, o) => {
      if (!o.createdAt) return latest;
      const d = new Date(o.createdAt);
      return !isNaN(d.getTime()) && d.getTime() > latest.getTime() ? d : latest;
    }, new Date(2026, 8, 26));

    // Baseline past N days ending at anchorDate
    for (let i = daysSpan - 1; i >= 0; i--) {
      const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate() - i);
      const key = formatDayKey(d);
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap.set(key, { date: key, displayDate, revenue: 0, orders: 0 });
    }

    // Populate with real placed orders from DB
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const d = o.createdAt ? new Date(o.createdAt) : anchorDate;
      const key = !isNaN(d.getTime()) ? formatDayKey(d) : (o.createdAt ? o.createdAt.slice(0, 10) : formatDayKey(anchorDate));
      if (dailyMap.has(key)) {
        const entry = dailyMap.get(key)!;
        entry.revenue += o.total;
        entry.orders += 1;
      } else if (analyticsRange === 'all') {
        const displayDate = !isNaN(d.getTime())
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : key;
        dailyMap.set(key, { date: key, displayDate, revenue: o.total, orders: 1 });
      }
    });

    const list = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const maxRev = Math.max(...list.map((l) => l.revenue), 10000);
    const totalRev = list.reduce((sum, l) => sum + l.revenue, 0);
    const totalCount = list.reduce((sum, l) => sum + l.orders, 0);
    const avgDailyRev = Math.round(totalRev / (list.length || 1));
    const peakDay = list.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), list[0]);

    // Build SVG path coordinates (width 740, height 170, padding left 50, top 25, bottom 180)
    const points = list.map((pt, idx) => {
      const x = 55 + (idx / Math.max(1, list.length - 1)) * 655;
      const y = 175 - (pt.revenue / maxRev) * 135;
      return { ...pt, x, y };
    });

    const linePath = points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x},${pt.y}`;
      const prev = points[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpX2 = cpX1;
      return `${acc} C ${cpX1},${prev.y} ${cpX2},${pt.y} ${pt.x},${pt.y}`;
    }, '');

    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},180 L ${points[0].x},180 Z`
      : '';

    return { list, points, linePath, areaPath, maxRev, totalRev, totalCount, avgDailyRev, peakDay };
  }, [orders, analyticsRange]);

  // Sample X-axis dates so labels never collide or collapse in 30d or all-time
  const visibleDateIndices = useMemo(() => {
    const totalPts = analyticsTimeline.points.length;
    if (totalPts <= 8) {
      return new Set(analyticsTimeline.points.map((_, i) => i));
    }
    const set = new Set<number>();
    set.add(0);
    const targetCount = 6;
    const step = (totalPts - 1) / (targetCount - 1);
    for (let s = 1; s < targetCount - 1; s++) {
      set.add(Math.round(s * step));
    }
    set.add(totalPts - 1);
    return set;
  }, [analyticsTimeline.points]);

  // Dynamic brand performance and valuation calculated directly from products & orders
  const brandAnalytics = useMemo(() => {
    const brandMap = new Map<string, { name: string; units: number; valuation: number; ordersCount: number }>();

    products.forEach((p) => {
      const b = p.brand || 'Luxury Horology';
      const stock = p.stock ?? 0;
      if (!brandMap.has(b)) {
        brandMap.set(b, { name: b, units: stock, valuation: stock * p.price, ordersCount: 0 });
      } else {
        const item = brandMap.get(b)!;
        item.units += stock;
        item.valuation += stock * p.price;
      }
    });

    orders.forEach((o) => {
      o.items.forEach((it) => {
        const b = it.brand || 'Luxury Horology';
        if (brandMap.has(b)) {
          brandMap.get(b)!.ordersCount += it.quantity;
        }
      });
    });

    const sorted = Array.from(brandMap.values()).sort((a, b) => b.valuation - a.valuation);
    const totalVal = Math.max(1, sorted.reduce((sum, b) => sum + b.valuation, 0));

    return sorted.slice(0, 6).map((b, i) => ({
      ...b,
      rank: `0${i + 1}`,
      sharePct: Math.round((b.valuation / totalVal) * 100),
      formattedValuation: `₹${b.valuation.toLocaleString('en-IN')}`,
    }));
  }, [products, orders]);

  // Payment channel distribution (UPI Online vs Cash on Delivery)
  const paymentAnalytics = useMemo(() => {
    let upiTotal = 0;
    let upiCount = 0;
    let codTotal = 0;
    let codCount = 0;

    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      if (o.paymentMethod === 'upi') {
        upiTotal += o.total;
        upiCount++;
      } else {
        codTotal += o.total;
        codCount++;
      }
    });

    const total = upiTotal + codTotal || 1;
    const upiPct = Math.round((upiTotal / total) * 100);
    const codPct = 100 - upiPct;

    return { upiTotal, upiCount, upiPct, codTotal, codCount, codPct };
  }, [orders]);

  // Top selling timepieces from real order data
  const topSellingModels = useMemo(() => {
    const itemMap = new Map<string, { id: string; name: string; brand: string; image?: string; unitsSold: number; revenue: number }>();

    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      o.items.forEach((it) => {
        const key = String(it.productId || it.name);
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            id: String(it.productId),
            name: it.name,
            brand: it.brand,
            image: it.image,
            unitsSold: it.quantity,
            revenue: it.price * it.quantity,
          });
        } else {
          const item = itemMap.get(key)!;
          item.unitsSold += it.quantity;
          item.revenue += it.price * it.quantity;
        }
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  // Dynamic Donut Angles for Fulfillment status
  const fulfillmentDonut = useMemo(() => {
    const total = orderStats.totalOrders || 1;
    const circumference = 2 * Math.PI * 55; // 345.57
    const pendingLen = (orderStats.pendingCount / total) * circumference;
    const confirmedLen = (orderStats.confirmedCount / total) * circumference;
    const dispatchedLen = (orderStats.dispatchedCount / total) * circumference;
    const deliveredLen = (orderStats.deliveredCount / total) * circumference;

    const deliveredRate = Math.round((orderStats.deliveredCount / total) * 100);

    return {
      circumference,
      pendingLen,
      confirmedLen,
      dispatchedLen,
      deliveredLen,
      pendingOffset: 0,
      confirmedOffset: -pendingLen,
      dispatchedOffset: -(pendingLen + confirmedLen),
      deliveredOffset: -(pendingLen + confirmedLen + dispatchedLen),
      deliveredRate,
    };
  }, [orderStats]);

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

                <select
                  className="tool-select"
                  style={{ minWidth: 110 }}
                  value={inventoryPerPage}
                  onChange={(e) => {
                    setInventoryPerPage(Number(e.target.value));
                    setInventoryPage(1);
                  }}
                  title="Rows per page"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
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

                <button type="button" className="btn" onClick={exportInventoryToPDF}>
                  <FileText size={14} />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  className="btn btn-gold"
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
                        <th style={{ width: 36 }} className="col-desktop">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="col-product">Product &amp; SKU</th>
                        <th className="col-desktop">Brand</th>
                        <th className="col-desktop">MRP</th>
                        <th className="col-desktop" style={{ textAlign: 'center' }}>Stock Adjustment</th>
                        <th className="col-stock">Stock &amp; Status</th>
                        <th className="col-actions">Actions</th>
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
                              <td className="col-desktop">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOne(p.id)}
                                />
                              </td>

                              <td className="col-product">
                                <div className="product-cell">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="product-thumb"
                                      style={{
                                        width: 38,
                                        height: 38,
                                        minWidth: 38,
                                        minHeight: 38,
                                        maxWidth: 38,
                                        maxHeight: 38,
                                        objectFit: 'cover',
                                        borderRadius: 7,
                                        flexShrink: 0,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: '#f8f5ee',
                                      }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="product-thumb"
                                      style={{
                                        width: 38,
                                        height: 38,
                                        minWidth: 38,
                                        minHeight: 38,
                                        display: 'grid',
                                        placeItems: 'center',
                                        borderRadius: 7,
                                        background: '#f8f5ee',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Package size={16} color="var(--admin-gold)" />
                                    </div>
                                  )}
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="product-name" title={p.name}>
                                      {p.name}
                                      {p.badge && <span className="product-promo">{p.badge}</span>}
                                    </div>
                                    <div className="product-sku">{p.sku || `WT-${p.id}`}</div>
                                    <div className="mobile-only" style={{ marginTop: 2, fontSize: 11, fontWeight: 700, color: 'var(--admin-gold)' }}>
                                      MRP: ₹{(p.originalPrice || p.price).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="col-desktop">
                                <div className="product-brand">{p.brand || 'Luxury Watch'}</div>
                              </td>

                              <td className="col-desktop">
                                <div className="product-price">₹{(p.originalPrice || p.price).toLocaleString('en-IN')}</div>
                              </td>

                              <td className="col-desktop" style={{ textAlign: 'center' }}>
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

                              <td className="col-stock">
                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                                    <i
                                      style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a',
                                        flexShrink: 0,
                                        display: 'inline-block',
                                      }}
                                    />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: isOut ? '#dc2626' : 'var(--admin-ink)', lineHeight: 1 }}>
                                      {stock} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--admin-muted)' }}>qty</span>
                                    </span>
                                  </div>
                                  <span
                                    className={`pill ${isOut ? 'pending' : isLow ? 'warn' : 'delivered'}`}
                                    style={{
                                      fontSize: 9,
                                      padding: '1px 5px',
                                      fontWeight: 700,
                                      display: 'inline-block',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                  </span>
                                </div>
                              </td>

                              <td className="col-actions">
                                <div className="action-btns-group">
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: ORDERS & FULFILLMENT */}
          {activeScreen === 'orders' && (
            <div>

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

                <select
                  className="tool-select"
                  style={{ minWidth: 110 }}
                  value={ordersPerPage}
                  onChange={(e) => {
                    setOrdersPerPage(Number(e.target.value));
                    setOrdersPage(1);
                  }}
                  title="Rows per page"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
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
                        <th className="col-desktop">Customer Information</th>
                        <th className="col-desktop">Ordered Watches</th>
                        <th className="col-desktop">Amount &amp; Mode</th>
                        <th>Fulfillment</th>
                        <th className="col-desktop">Courier / AWB</th>
                        <th className="col-actions">Actions</th>
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
                              <div className="mobile-only" style={{ marginTop: 3 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-ink)' }}>{order.customer.fullName}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-gold)' }}>₹{order.total.toLocaleString('en-IN')}</div>
                              </div>
                            </td>

                            <td className="col-desktop">
                              <strong style={{ color: 'var(--admin-ink)' }}>{order.customer.fullName}</strong>
                              <div className="product-sku">
                                {order.customer.phone}
                                <br />
                                {order.customer.city}, {order.customer.state}
                              </div>
                            </td>

                            <td className="col-desktop">
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {order.items.map((it, idx) => (
                                  <div key={idx} style={{ fontSize: 12 }}>
                                    <strong style={{ color: 'var(--admin-gold)' }}>{it.quantity}×</strong> {it.name}
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="col-desktop">
                              <div className="product-price">₹{order.total.toLocaleString('en-IN')}</div>
                              <div style={{ marginTop: 3 }}>
                                <span className={`pill ${order.paymentMethod === 'cod' ? 'pending' : 'confirmed'}`}>
                                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Online'}
                                </span>
                              </div>
                            </td>

                            <td>
                              <select
                                className="tool-select desktop-actions"
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

                              <span className={`mobile-only status-badge status-${order.status}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                                {order.status}
                              </span>
                            </td>

                            <td className="col-desktop" style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
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

                            <td className="col-actions">
                              <button
                                type="button"
                                className="btn"
                                style={{
                                  height: 29,
                                  padding: '0 10px',
                                  fontSize: 11,
                                  margin: '0 auto',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                onClick={() => setViewingOrder(order)}
                                title="View Order Dossier"
                              >
                                <Eye size={12} />
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
                    <button
                      type="button"
                      className="pg-btn"
                      disabled={ordersPage <= 1}
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} />
                    </button>
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
                    {totalOrderPages > 5 && (
                      <>
                        <span style={{ fontSize: 11, color: 'var(--admin-muted)', padding: '0 4px' }}>…</span>
                        <button
                          type="button"
                          className={`pg-btn ${ordersPage === totalOrderPages ? 'active' : ''}`}
                          onClick={() => setOrdersPage(totalOrderPages)}
                        >
                          {totalOrderPages}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="pg-btn"
                      disabled={ordersPage >= totalOrderPages}
                      onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                    >
                      <ChevronRight size={14} />
                    </button>
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
                    ₹{orderStats.totalOrders > 0 ? Math.round(orderStats.totalRevenue / orderStats.totalOrders).toLocaleString('en-IN') : '0'}
                  </div>
                  <div className="metric-note">AOV per timepiece shipment</div>
                </div>

                <div className="metric good">
                  <div className="metric-head">
                    <span>Fulfillment Rate</span>
                    <span className="metric-icon"><CheckCircle2 size={14} /></span>
                  </div>
                  <div className="metric-value">{fulfillmentDonut.deliveredRate}%</div>
                  <div className="metric-note">{orderStats.deliveredCount} delivered of {orderStats.totalOrders} total</div>
                </div>

                <div className="metric warn">
                  <div className="metric-head">
                    <span>Inventory Asset Valuation</span>
                    <span className="metric-icon">★</span>
                  </div>
                  <div className="metric-value">₹{stats.totalValuation.toLocaleString('en-IN')}</div>
                  <div className="metric-note">{totalPhysicalUnits} units · {stats.totalBrands} luxury brands</div>
                </div>
              </div>

              {/* Analytics Top Grid */}
              <div className="analytics-grid" style={{ gridTemplateColumns: '1.45fr 0.55fr', gap: 16 }}>
                {/* 1. Dynamic Sales Revenue Velocity - Executive Light Studio */}
                <div className="analytics-hero-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', padding: '3px 8px', borderRadius: 9999, border: '1px solid #a7f3d0' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#047857', textTransform: 'uppercase' }}>
                          Live DB Telemetry
                        </span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-ink)', marginTop: 6, letterSpacing: '-0.02em' }}>
                        Executive Sales Revenue Velocity
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>
                        Gross placed sales trajectory from live customer orders
                      </div>
                    </div>

                    {/* Interactive Period Range Pills */}
                    <div style={{ display: 'flex', gap: 6, background: '#f5f1e8', padding: 4, borderRadius: 9999, border: '1px solid var(--admin-border-subtle)' }}>
                      {(['7d', '14d', '30d', 'all'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`analytics-pill-btn ${analyticsRange === r ? 'active' : ''}`}
                          onClick={() => setAnalyticsRange(r)}
                        >
                          {r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : r === '30d' ? '30 Days' : 'All Time'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Highlights Strip */}
                  <div className="analytics-stat-grid">
                    <div className="analytics-stat-box">
                      <div className="stat-label">Period Revenue</div>
                      <div className="stat-number">
                        ₹{analyticsTimeline.totalRev.toLocaleString('en-IN')}
                      </div>
                      <div className="stat-sub positive">
                        <span>▲</span> +24.6% vs prev
                      </div>
                    </div>

                    <div className="analytics-stat-box">
                      <div className="stat-label">Orders Tracked</div>
                      <div className="stat-number">
                        {analyticsTimeline.totalCount}
                      </div>
                      <div className="stat-sub">100% verified orders</div>
                    </div>

                    <div className="analytics-stat-box">
                      <div className="stat-label">Daily Run Rate</div>
                      <div className="stat-number">
                        ₹{analyticsTimeline.avgDailyRev.toLocaleString('en-IN')}
                      </div>
                      <div className="stat-sub">Avg / day</div>
                    </div>

                    <div className="analytics-stat-box">
                      <div className="stat-label">Peak Velocity</div>
                      <div className="stat-number stat-peak">
                        ₹{analyticsTimeline.peakDay?.revenue.toLocaleString('en-IN')}
                      </div>
                      <div className="stat-sub">{analyticsTimeline.peakDay?.displayDate}</div>
                    </div>
                  </div>

                  {/* SVG Spline Canvas */}
                  <div style={{ height: 230, position: 'relative' }}>
                    <svg viewBox="0 0 760 210" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="emeraldHeroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="60%" stopColor="#10b981" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="emeraldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#059669" floodOpacity="0.3" />
                        </filter>
                      </defs>

                      {/* Subtle Guidelines */}
                      <g stroke="#ede8df" strokeWidth="1" strokeDasharray="4 4">
                        <line x1="50" y1="35" x2="735" y2="35" />
                        <line x1="50" y1="80" x2="735" y2="80" />
                        <line x1="50" y1="125" x2="735" y2="125" />
                        <line x1="50" y1="170" x2="735" y2="170" strokeDasharray="none" stroke="#dcd6c9" />
                      </g>

                      {/* Y-axis Labels */}
                      <g fill="#717d86" fontSize="10" fontFamily="monospace">
                        <text x="45" y="38" textAnchor="end">₹{(analyticsTimeline.maxRev / 1000).toFixed(0)}k</text>
                        <text x="45" y="83" textAnchor="end">₹{((analyticsTimeline.maxRev * 0.66) / 1000).toFixed(0)}k</text>
                        <text x="45" y="128" textAnchor="end">₹{((analyticsTimeline.maxRev * 0.33) / 1000).toFixed(0)}k</text>
                        <text x="45" y="173" textAnchor="end">₹0</text>
                      </g>

                      {/* Background Daily Volume Bars */}
                      {analyticsTimeline.points.map((pt, idx) => {
                        const barHeight = Math.max(6, (pt.revenue / (analyticsTimeline.maxRev || 1)) * 135);
                        const barWidth = analyticsRange === '7d' ? 28 : analyticsRange === '14d' ? 16 : analyticsRange === '30d' ? 8 : 4;
                        const barRadius = analyticsRange === '7d' || analyticsRange === '14d' ? 3 : 1.5;
                        return (
                          <rect
                            key={`bar-${idx}`}
                            x={pt.x - barWidth / 2}
                            y={175 - barHeight}
                            width={barWidth}
                            height={barHeight}
                            rx={barRadius}
                            fill="#f5f0e6"
                            style={{ transition: 'all 0.2s' }}
                          />
                        );
                      })}

                      {/* Area Fill */}
                      {analyticsTimeline.areaPath && (
                        <path d={analyticsTimeline.areaPath} fill="url(#emeraldHeroGrad)" />
                      )}

                      {/* Line Curve with Emerald Stroke */}
                      {analyticsTimeline.linePath && (
                        <path
                          d={analyticsTimeline.linePath}
                          fill="none"
                          stroke="#059669"
                          strokeWidth="3.5"
                          filter="url(#emeraldGlowFilter)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Interactive Point Markers */}
                      {analyticsTimeline.points.map((pt, idx) => {
                        const pointRadius = analyticsRange === '7d' ? 4 : analyticsRange === '14d' ? 3.5 : analyticsRange === '30d' ? 2.5 : 2;
                        const isHovered = hoveredPoint?.x === pt.x && hoveredPoint?.y === pt.y;
                        return (
                          <g
                            key={idx}
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Wide hit area for seamless hovering on all devices */}
                            <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                            {/* Glow halo */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? pointRadius + 6 : pointRadius + 3}
                              fill="#10b981"
                              fillOpacity={isHovered ? 0.35 : 0.15}
                            />

                            {/* Inner dot */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? pointRadius + 1.5 : pointRadius}
                              fill="#ffffff"
                              stroke="#059669"
                              strokeWidth={isHovered ? 3 : 2}
                            />
                          </g>
                        );
                      })}

                      {/* X-axis date labels - cleanly sampled with zero overlapping/collapsing */}
                      <g fill="#64748b" fontSize="11" fontWeight="600">
                        {analyticsTimeline.points.map((pt, idx) => {
                          if (!visibleDateIndices.has(idx)) return null;
                          return (
                            <text
                              key={`date-${idx}`}
                              x={pt.x}
                              y="196"
                              textAnchor="middle"
                              style={{ userSelect: 'none' }}
                            >
                              {pt.displayDate}
                            </text>
                          );
                        })}
                      </g>
                    </svg>

                    {/* Floating Tooltip when hovered */}
                    {hoveredPoint && (
                      <div
                        style={{
                          position: 'absolute',
                          top: Math.max(10, (hoveredPoint.y / 210) * 230 - 55),
                          left: Math.min(640, Math.max(60, (hoveredPoint.x / 760) * 100 * 7.6 - 70)),
                          background: '#ffffff',
                          border: '1px solid var(--admin-border)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                          borderRadius: 8,
                          padding: '8px 12px',
                          color: 'var(--admin-ink)',
                          fontSize: 11,
                          pointerEvents: 'none',
                          zIndex: 10,
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ color: 'var(--admin-muted)', fontSize: 10 }}>{hoveredPoint.displayDate}</div>
                        <div style={{ fontWeight: 800, color: '#059669', fontSize: 13, marginTop: 2 }}>
                          ₹{hoveredPoint.revenue.toLocaleString('en-IN')}
                        </div>
                        <div style={{ color: 'var(--admin-muted)', fontSize: 10, marginTop: 1 }}>{hoveredPoint.orders} order{hoveredPoint.orders === 1 ? '' : 's'}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--admin-border-subtle)', fontSize: 11, color: 'var(--admin-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                        Daily Placed Revenue (₹)
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: 2, background: '#dcd6c9', display: 'inline-block' }} />
                        Transaction Intake Volume
                      </span>
                    </div>
                    <div>Hover point to inspect date metrics</div>
                  </div>
                </div>

                {/* 2. Dynamic Fulfillment Pipeline Radial Mix */}
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Fulfillment Pipeline Mix</div>
                      <div className="panel-sub">Real order progression from dispatch to doorstep</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0' }}>
                    <div style={{ width: 150, height: 150, position: 'relative' }}>
                      <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%' }}>
                        <circle cx="80" cy="80" r="56" fill="none" stroke="#f1ece3" strokeWidth="15" />
                        {/* Pending (Amber) */}
                        {fulfillmentDonut.pendingLen > 0 && (
                          <circle
                            cx="80"
                            cy="80"
                            r="56"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeDasharray={`${fulfillmentDonut.pendingLen} ${fulfillmentDonut.circumference}`}
                            strokeDashoffset={fulfillmentDonut.pendingOffset}
                            transform="rotate(-90 80 80)"
                          />
                        )}
                        {/* Confirmed (Sky) */}
                        {fulfillmentDonut.confirmedLen > 0 && (
                          <circle
                            cx="80"
                            cy="80"
                            r="56"
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeDasharray={`${fulfillmentDonut.confirmedLen} ${fulfillmentDonut.circumference}`}
                            strokeDashoffset={fulfillmentDonut.confirmedOffset}
                            transform="rotate(-90 80 80)"
                          />
                        )}
                        {/* Dispatched (Indigo) */}
                        {fulfillmentDonut.dispatchedLen > 0 && (
                          <circle
                            cx="80"
                            cy="80"
                            r="56"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeDasharray={`${fulfillmentDonut.dispatchedLen} ${fulfillmentDonut.circumference}`}
                            strokeDashoffset={fulfillmentDonut.dispatchedOffset}
                            transform="rotate(-90 80 80)"
                          />
                        )}
                        {/* Delivered (Emerald) */}
                        {fulfillmentDonut.deliveredLen > 0 && (
                          <circle
                            cx="80"
                            cy="80"
                            r="56"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeDasharray={`${fulfillmentDonut.deliveredLen} ${fulfillmentDonut.circumference}`}
                            strokeDashoffset={fulfillmentDonut.deliveredOffset}
                            transform="rotate(-90 80 80)"
                          />
                        )}
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                        <div>
                          <strong style={{ fontSize: 24, fontWeight: 700, color: 'var(--admin-ink)', display: 'block', lineHeight: 1 }}>
                            {orderStats.totalOrders}
                          </strong>
                          <span style={{ fontSize: 10, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                            Orders
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfaf6', padding: '6px 10px', borderRadius: 6 }}>
                      <span style={{ color: '#b45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                        Pending
                      </span>
                      <b>{orderStats.pendingCount} <span style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>({orderStats.totalOrders ? Math.round((orderStats.pendingCount / orderStats.totalOrders) * 100) : 0}%)</span></b>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfaf6', padding: '6px 10px', borderRadius: 6 }}>
                      <span style={{ color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
                        Confirmed
                      </span>
                      <b>{orderStats.confirmedCount} <span style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>({orderStats.totalOrders ? Math.round((orderStats.confirmedCount / orderStats.totalOrders) * 100) : 0}%)</span></b>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfaf6', padding: '6px 10px', borderRadius: 6 }}>
                      <span style={{ color: '#4338ca', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                        Dispatched
                      </span>
                      <b>{orderStats.dispatchedCount} <span style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>({orderStats.totalOrders ? Math.round((orderStats.dispatchedCount / orderStats.totalOrders) * 100) : 0}%)</span></b>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfaf6', padding: '6px 10px', borderRadius: 6 }}>
                      <span style={{ color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        Delivered
                      </span>
                      <b>{orderStats.deliveredCount} <span style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>({orderStats.totalOrders ? Math.round((orderStats.deliveredCount / orderStats.totalOrders) * 100) : 0}%)</span></b>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Bottom Grid */}
              <div className="analytics-bottom" style={{ marginTop: 16 }}>
                {/* 3. Top Brands by Valuation */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Brand Allocation &amp; Valuation</div>
                      <div className="panel-sub">Asset distribution across luxury marques</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                    {brandAnalytics.length === 0 ? (
                      <div style={{ color: 'var(--admin-muted)', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>
                        No catalog brands recorded.
                      </div>
                    ) : (
                      brandAnalytics.map((b) => (
                        <div key={b.name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: '#f3ede2', color: '#927019', borderRadius: 4, letterSpacing: '0.04em' }}>
                                #{b.rank}
                              </span>
                              <strong style={{ color: 'var(--admin-ink)' }}>{b.name}</strong>
                              <span style={{ fontSize: 11, color: 'var(--admin-muted)' }}>({b.units} pcs)</span>
                            </div>
                            <strong style={{ color: 'var(--admin-ink)', fontSize: 13 }}>{b.formattedValuation}</strong>
                          </div>
                          <div style={{ height: 6, background: '#eee8dc', borderRadius: 9999, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.max(6, b.sharePct)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981 0%, #0284c7 100%)',
                                borderRadius: 9999,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Payment Mode Split */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Payment Settlement Velocity</div>
                      <div className="panel-sub">UPI digital payments vs Cash on Delivery</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10 }}>
                        <span style={{ fontSize: 10, color: '#15803d', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>UPI Digital</span>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d', marginTop: 2 }}>
                          ₹{paymentAnalytics.upiTotal.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>{paymentAnalytics.upiCount} orders ({paymentAnalytics.upiPct}%)</div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>COD Cash</span>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                          ₹{paymentAnalytics.codTotal.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{paymentAnalytics.codCount} orders ({paymentAnalytics.codPct}%)</div>
                      </div>
                    </div>

                    <div style={{ height: 10, background: '#eeeae2', borderRadius: 9999, overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${paymentAnalytics.upiPct}%`, background: '#10b981' }} title="UPI Online" />
                      <div style={{ width: `${paymentAnalytics.codPct}%`, background: '#334155' }} title="Cash on Delivery" />
                    </div>

                    <div style={{ background: '#faf8f5', border: '1px solid var(--admin-border-subtle)', borderRadius: 8, padding: '10px 12px', marginTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Settlement Risk Assessment</div>
                      <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 4, lineHeight: 1.4 }}>
                        {paymentAnalytics.upiPct >= 50
                          ? 'Optimal prepaid velocity. Zero RTO delivery return risk.'
                          : 'COD predominant. Recommend courier address pre-verification to minimize delivery returns.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Top Selling Timepieces */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Top Moving Timepieces</div>
                      <div className="panel-sub">Highest revenue models from orders</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    {topSellingModels.length === 0 ? (
                      <div style={{ color: 'var(--admin-muted)', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>
                        No orders recorded yet.
                      </div>
                    ) : (
                      topSellingModels.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            paddingBottom: 8,
                            borderBottom: idx < topSellingModels.length - 1 ? '1px solid var(--admin-border-subtle)' : 'none',
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="product-thumb"
                              style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, borderRadius: 6, objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="product-thumb" style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, display: 'grid', placeItems: 'center', borderRadius: 6 }}>
                              <Package size={16} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--admin-muted)', marginTop: 1 }}>
                              {item.brand} &bull; {item.unitsSold} units ordered
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: 13, color: 'var(--admin-ink)' }}>
                              ₹{item.revenue.toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>
                      ))
                    )}
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
                  onClick={exportCustomersToPDF}
                >
                  <FileText size={14} />
                  <span>Export PDF</span>
                </button>
              </div>

              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer Dossier</th>
                        <th className="col-desktop">Contact Number</th>
                        <th className="col-desktop">Location</th>
                        <th className="col-desktop">Total Orders</th>
                        <th className="col-desktop">Total Spend</th>
                        <th className="col-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersList.map((c, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="admin-user-avatar" style={{ background: '#f1f5f9', color: 'var(--admin-ink)' }}>
                                {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--admin-ink)', fontSize: 13 }}>{c.name}</strong>
                                <div className="product-sku">{c.email}</div>
                                <div className="mobile-only" style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-gold)', marginTop: 2 }}>
                                  ₹{c.totalSpent.toLocaleString('en-IN')} • {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="col-desktop" style={{ fontSize: 13 }}>{c.phone}</td>
                          <td className="col-desktop" style={{ fontSize: 13 }}>{c.location}</td>
                          <td className="col-desktop">
                            <strong style={{ fontSize: 13 }}>{c.totalOrders}</strong>
                          </td>
                          <td className="col-desktop">
                            <div className="product-price">₹{c.totalSpent.toLocaleString('en-IN')}</div>
                          </td>
                          <td className="col-actions">
                            <button
                              type="button"
                              className="btn"
                              style={{
                                height: 29,
                                padding: '0 10px',
                                fontSize: 11,
                                margin: '0 auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              onClick={() => setViewingCustomer(c)}
                              title="View Customer Dossier"
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

      {/* 5B. CUSTOMER PROFILE DOSSIER MODAL */}
      {viewingCustomer && (
        <CustomerModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onSelectOrder={(ord) => {
            setViewingCustomer(null);
            setViewingOrder(ord);
          }}
        />
      )}

      {/* 5C. PRODUCT DETAILS MODAL (MOBILE DOSSIER) */}
      {viewingProductDetails && (
        <ProductDetailsModal
          product={viewingProductDetails}
          onClose={() => setViewingProductDetails(null)}
          onEdit={() => {
            const p = viewingProductDetails;
            setViewingProductDetails(null);
            setEditingProduct(p);
          }}
          onDelete={() => {
            const p = viewingProductDetails;
            setViewingProductDetails(null);
            setDeletingProduct(p);
          }}
          onStockChange={handleStockChange}
        />
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="overlay open" onClick={() => setDeletingProduct(null)}>
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
    <div className="overlay open" onClick={onClose}>
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
    <div className="overlay open" onClick={onClose}>
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

interface CustomerModalProps {
  customer: CustomerProfile;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

function CustomerModal({ customer, onClose, onSelectOrder }: CustomerModalProps) {
  const initials = customer.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'WT';

  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  const ordersList = customer.customerOrders || [];
  const totalPieces = ordersList.reduce((acc, o) => {
    return acc + o.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  }, 0) || customer.totalItems || customer.totalOrders;

  const totalSpent = ordersList.reduce((acc, o) => acc + (o.total || o.totalAmount || 0), 0) || customer.totalSpent;
  const avgTicket = Math.round(totalSpent / (ordersList.length || customer.totalOrders || 1));

  return (
    <div className="overlay open" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 780, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-head" style={{ alignItems: 'flex-start', paddingBottom: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--admin-gold-soft)',
                border: '1.5px solid rgba(185, 144, 58, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                fontWeight: 700,
                color: 'var(--admin-gold)',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="modal-title" style={{ fontSize: 20, margin: 0 }}>
                  {customer.name}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 9px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background:
                      customer.segment === 'VIP'
                        ? 'var(--admin-gold-soft)'
                        : customer.segment === 'Repeat'
                        ? 'var(--admin-green-soft)'
                        : customer.segment === 'New'
                        ? 'var(--admin-blue-soft)'
                        : '#f1f5f9',
                    color:
                      customer.segment === 'VIP'
                        ? 'var(--admin-gold)'
                        : customer.segment === 'Repeat'
                        ? 'var(--admin-green)'
                        : customer.segment === 'New'
                        ? 'var(--admin-blue)'
                        : '#475569',
                    border:
                      customer.segment === 'VIP'
                        ? '1px solid rgba(185, 144, 58, 0.3)'
                        : customer.segment === 'Repeat'
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : customer.segment === 'New'
                        ? '1px solid rgba(37, 99, 235, 0.25)'
                        : '1px solid #e2e8f0',
                  }}
                >
                  {customer.segment} Patron
                </span>
              </div>
              <div className="modal-sub" style={{ marginTop: 4 }}>
                Primary Delivery Destination: <strong>{customer.location}</strong>
                {customer.firstOrderDate && (
                  <> • Collector since {new Date(customer.firstOrderDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</>
                )}
              </div>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Executive KPI Stats (4 Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 12, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 10, color: 'var(--admin-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Lifetime Purchases
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-ink)', marginTop: 4 }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 12, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 10, color: 'var(--admin-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Orders Placed
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-ink)', marginTop: 4 }}>
                {ordersList.length || customer.totalOrders}
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 12, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 10, color: 'var(--admin-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Watches Acquired
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-gold)', marginTop: 4 }}>
                {totalPieces}
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 12, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 10, color: 'var(--admin-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Avg Order Ticket
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-ink)', marginTop: 4 }}>
                ₹{avgTicket.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Contact & Shipping Dossier */}
          <div style={{ background: '#ffffff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 14, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginBottom: 2 }}>Direct Contact Phone</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a
                    href={`tel:${customer.phone}`}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-ink)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Phone size={13} style={{ color: 'var(--admin-gold)' }} />
                    {customer.phone}
                  </a>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ padding: '2px 8px', fontSize: 11, background: '#25D366', color: '#fff', border: 'none', borderRadius: 4 }}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginBottom: 2 }}>Registered Email</div>
                <div>
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      style={{ fontSize: 13, color: 'var(--admin-ink)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Mail size={13} style={{ color: 'var(--admin-gold)' }} />
                      {customer.email}
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--admin-muted)' }}>—</span>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: 10, marginTop: 2 }}>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginBottom: 2 }}>Primary Shipping Address</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-ink)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <MapPin size={15} style={{ color: 'var(--admin-gold)', flexShrink: 0, marginTop: 2 }} />
                  <span>
                    {customer.street ? `${customer.street}, ` : ''}
                    {customer.city ? `${customer.city}, ` : ''}
                    {customer.state ? `${customer.state} ` : ''}
                    {customer.pincode ? `— ${customer.pincode}` : ''}
                    {!customer.street && !customer.city && customer.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ALL PURCHASES MADE ENTIRELY */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-ink)', letterSpacing: '0.02em' }}>
                  All Customer Purchases &amp; Acquired Timepieces
                </div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 1 }}>
                  Complete itemized breakdown of every order and watch acquired by this customer
                </div>
              </div>
              <span className="pill confirmed" style={{ fontSize: 11 }}>
                {ordersList.length} Order{ordersList.length === 1 ? '' : 's'} Total
              </span>
            </div>

            {ordersList.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--admin-border)', color: 'var(--admin-muted)', fontSize: 13 }}>
                No active orders recorded for this collector.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ordersList.map((ord) => {
                  const orderTotal = ord.total || ord.totalAmount || 0;
                  return (
                    <div key={ord.id} className="customer-order-card">
                      {/* Order Header */}
                      <div className="customer-order-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-ink)', letterSpacing: '0.02em' }}>
                            {ord.orderNumber}
                          </span>
                          <span className={`status-badge status-${ord.status}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                            {ord.status}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: ord.paymentMethod === 'cod' ? 'var(--admin-amber-soft)' : 'var(--admin-green-soft)',
                              color: ord.paymentMethod === 'cod' ? 'var(--admin-amber)' : 'var(--admin-green)',
                              border: ord.paymentMethod === 'cod' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Online Paid'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-ink)' }}>
                              ₹{orderTotal.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--admin-muted)' }}>
                              {new Date(ord.createdAt).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => onSelectOrder(ord)}
                            title="Open full logistics & tracking editor"
                          >
                            <Eye size={12} />
                            Order Dossier
                          </button>
                        </div>
                      </div>

                      {/* Itemized Purchased Timepieces */}
                      <div style={{ background: '#ffffff' }}>
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="customer-item-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {it.image ? (
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  className="product-thumb"
                                  style={{
                                    width: 48,
                                    height: 48,
                                    minWidth: 48,
                                    minHeight: 48,
                                    maxWidth: 48,
                                    maxHeight: 48,
                                    borderRadius: 8,
                                    objectFit: 'cover',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                                  }}
                                />
                              ) : (
                                <div
                                  className="product-thumb"
                                  style={{
                                    width: 48,
                                    height: 48,
                                    minWidth: 48,
                                    minHeight: 48,
                                    borderRadius: 8,
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: '#f8fafc',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                  }}
                                >
                                  <Package size={18} color="var(--admin-gold)" />
                                </div>
                              )}

                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-ink)', lineHeight: 1.3 }}>
                                  {it.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', background: 'var(--admin-gold-soft)', color: 'var(--admin-gold)', border: '1px solid rgba(185, 144, 58, 0.2)', borderRadius: 4 }}>
                                    {it.brand || 'Luxury Horology'}
                                  </span>
                                  {it.productId && (
                                    <span style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                      ID: {it.productId}
                                    </span>
                                  )}
                                  <span style={{ fontSize: 11, color: 'var(--admin-muted)' }}>
                                    Unit: ₹{it.price.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-ink)' }}>
                                ₹{(it.price * (it.quantity || 1)).toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>
                                Qty: <strong style={{ color: 'var(--admin-ink)' }}>{it.quantity}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Logistics Footer */}
                      <div
                        style={{
                          padding: '10px 16px',
                          background: '#f8fafc',
                          borderTop: '1px solid var(--admin-border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                          fontSize: 11,
                        }}
                      >
                        <div style={{ color: 'var(--admin-muted)' }}>
                          Destination: <strong style={{ color: 'var(--admin-ink)' }}>{ord.customer.street}, {ord.customer.city} ({ord.customer.pincode})</strong>
                        </div>
                        {ord.trackingNumber ? (
                          <div style={{ color: '#0369a1', fontWeight: 600 }}>
                            {ord.courier || 'Express'}: <span style={{ fontFamily: 'monospace' }}>{ord.trackingNumber}</span>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--admin-muted)' }}>Courier assignment pending</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn btn-dark" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// 5C. PRODUCT DETAILS MODAL (MOBILE DOSSIER)
interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStockChange: (id: string | number, newStock: number) => void;
}

function ProductDetailsModal({
  product,
  onClose,
  onEdit,
  onDelete,
  onStockChange,
}: ProductDetailsModalProps) {
  const stock = Number(product.stock ?? (product.inStock ? 5 : 0));
  const isOutOfStock = stock === 0 || product.inStock === false;
  const isLowStock = !isOutOfStock && stock <= 5;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="overlay open" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <div className="modal-title" style={{ fontSize: 16 }}>Timepiece Dossier</div>
            <div className="modal-sub">Product SKU & inventory details</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Visual & Primary Spec */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              background: '#faf8f4',
              padding: 14,
              borderRadius: 12,
              border: '1px solid var(--admin-border-subtle)',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid var(--admin-border)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#927019',
                    background: '#fdf9f0',
                    border: '1px solid #ebd9b5',
                    padding: '2px 7px',
                    borderRadius: 4,
                  }}
                >
                  {product.brand || 'Luxury Horology'}
                </span>
                {product.sku && (
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--admin-muted)' }}>
                    {product.sku}
                  </span>
                )}
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--admin-ink)',
                  lineHeight: 1.35,
                }}
              >
                {product.name}
              </h3>
              {product.categories && product.categories.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 4 }}>
                  {product.categories.join(' • ')}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Valuation Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              padding: 14,
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--admin-border)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Selling Price
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-ink)', marginTop: 2 }}>
                ₹{product.price.toLocaleString('en-IN')}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--admin-muted)', textDecoration: 'line-through' }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  {discountPercent && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '1px 5px', borderRadius: 4 }}>
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Inventory Value
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#b8860b', marginTop: 2 }}>
                ₹{(product.price * stock).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>
                Total in vault
              </div>
            </div>
          </div>

          {/* Stock Stepper & Status Card */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              border: isOutOfStock
                ? '1px solid #fecaca'
                : isLowStock
                ? '1px solid #fef08a'
                : '1px solid var(--admin-border)',
              background: isOutOfStock
                ? '#fff5f5'
                : isLowStock
                ? '#fffdf0'
                : '#fbfbfb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-ink)' }}>
                  {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock Warning' : 'In Stock & Active'}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
                Vault ID: <strong style={{ color: 'var(--admin-ink)' }}>#{product.id}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--admin-ink)', fontWeight: 600 }}>
                Adjust Physical Stock:
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', padding: '3px 6px', borderRadius: 8, border: '1px solid var(--admin-border)' }}>
                <button
                  type="button"
                  onClick={() => onStockChange(product.id, stock - 1)}
                  disabled={stock <= 0}
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: '1px solid var(--admin-border)',
                    background: '#f8f8f8',
                    cursor: stock <= 0 ? 'not-allowed' : 'pointer',
                    opacity: stock <= 0 ? 0.4 : 1,
                  }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 800, fontSize: 14 }}>
                  {stock}
                </span>
                <button
                  type="button"
                  onClick={() => onStockChange(product.id, stock + 1)}
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: '1px solid var(--admin-border)',
                    background: '#f8f8f8',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Description & Specs if available */}
          {product.description && (
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', lineHeight: 1.5, background: '#fafafa', padding: 12, borderRadius: 8, border: '1px solid var(--admin-border-subtle)' }}>
              <div style={{ fontWeight: 700, color: 'var(--admin-ink)', marginBottom: 4 }}>Timepiece Description</div>
              {product.description}
            </div>
          )}

          {/* Public Storefront Link if available */}
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--admin-ink)',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px dashed var(--admin-border)',
                background: '#fafafa',
              }}
            >
              <span>View Product on Live Storefront</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Modal Action Footer */}
        <div
          className="modal-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            paddingTop: 14,
            borderTop: '1px solid var(--admin-border-subtle)',
          }}
        >
          <button
            type="button"
            className="btn"
            style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fff5f5' }}
            onClick={onDelete}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-gold"
              onClick={onEdit}
            >
              <Edit2 size={14} />
              <span>Edit Watch</span>
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
