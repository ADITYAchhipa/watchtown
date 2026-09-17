'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Search, ShoppingBag, Eye, Star, Filter, X, CheckCircle2, AlertTriangle, ArrowUpDown, Heart } from 'lucide-react';

interface ShopClientProps {
  initialProducts: Product[];
  brands: string[];
  categories: string[];
  initialSearch?: string;
  initialBrand?: string;
  initialCategory?: string;
  initialPriceRange?: 'all' | 'under_2500' | 'under_5000' | 'above_5000';
  initialSort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

export function ShopClient({
  initialProducts,
  brands,
  categories,
  initialSearch = '',
  initialBrand = 'all',
  initialCategory = 'all',
  initialPriceRange = 'all',
  initialSort = 'newest',
}: ShopClientProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products] = useState<Product[]>(initialProducts);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<'all' | 'under_2500' | 'under_5000' | 'above_5000'>(initialPriceRange);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc'>(initialSort);
  const [addedId, setAddedId] = useState<string | number | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (search.trim()) {
          const s = search.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(s);
          const matchesBrand = (p.brand || '').toLowerCase().includes(s);
          const matchesSku = (p.sku || '').toLowerCase().includes(s);
          if (!matchesName && !matchesBrand && !matchesSku) return false;
        }

        // Brand
        if (selectedBrand !== 'all' && (p.brand || '').toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Category
        if (selectedCategory !== 'all') {
          const catLower = selectedCategory.toLowerCase();
          const hasCategory =
            p.categories?.some((c) => c.toLowerCase().includes(catLower)) ||
            p.name.toLowerCase().includes(catLower);
          if (!hasCategory) return false;
        }

        // Price range
        if (priceRange === 'under_2500' && p.price > 2500) return false;
        if (priceRange === 'under_5000' && p.price > 5000) return false;
        if (priceRange === 'above_5000' && p.price < 5000) return false;

        // In stock only
        if (inStockOnly && (p.stock ?? 0) <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'newest':
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
  }, [products, search, selectedBrand, priceRange, inStockOnly, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToCart(product, 1);
    if (success) {
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #000000 100%)',
          color: '#ffffff',
          borderRadius: 16,
          padding: '40px 32px',
          marginBottom: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1 }}>
            Complete Catalog
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '6px 0', color: '#ffffff' }}>
            Luxury Watch Collection
          </h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>
            Showing {filteredProducts.length} certified 7AA master timepieces with Cash on Delivery
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
              fontSize: 13,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="newest">Sort by: Newest Arrival</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 36, alignItems: 'start' }}>
        {/* Sidebar Filters */}
        <aside
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 20,
            position: 'sticky',
            top: 90,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={16} /> Filters
            </h3>
            {(selectedBrand !== 'all' || priceRange !== 'all' || inStockOnly || search) && (
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setPriceRange('all');
                  setInStockOnly(false);
                  setSearch('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e11d48',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Search */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>
              Search Catalog
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search watches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* Brands Filter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>
              Luxury Brands
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              <button
                onClick={() => setSelectedBrand('all')}
                style={{
                  textAlign: 'left',
                  background: selectedBrand === 'all' ? '#000000' : 'transparent',
                  color: selectedBrand === 'all' ? '#ffffff' : '#374151',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                All Brands ({products.length})
              </button>
              {brands.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                const count = products.filter((p) => p.brand?.toLowerCase() === b.toLowerCase()).length;
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(isSelected ? 'all' : b)}
                    style={{
                      textAlign: 'left',
                      background: isSelected ? '#000000' : 'transparent',
                      color: isSelected ? '#ffffff' : '#374151',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 13,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{b}</span>
                    <span style={{ opacity: 0.6, fontSize: 11 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>
                Category
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    textAlign: 'left',
                    background: selectedCategory === 'all' ? '#000000' : 'transparent',
                    color: selectedCategory === 'all' ? '#ffffff' : '#374151',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                      style={{
                        textAlign: 'left',
                        background: isSelected ? '#000000' : 'transparent',
                        color: isSelected ? '#ffffff' : '#374151',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>
              Budget Range
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under_2500', label: 'Under ₹2,500' },
                { id: 'under_5000', label: 'Under ₹5,000' },
                { id: 'above_5000', label: 'Luxury (₹5,000+)' },
              ].map((tier) => (
                <label
                  key={tier.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === tier.id}
                    onChange={() => setPriceRange(tier.id as typeof priceRange)}
                  />
                  <span>{tier.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <strong>In Stock Items Only</strong>
            </label>
          </div>
        </aside>

        {/* Main Products Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f9fafb', borderRadius: 12 }}>
              <h3 style={{ fontSize: 18, color: '#111827' }}>No watches found matching filters</h3>
              <p style={{ color: '#6b7280', fontSize: 13 }}>Try relaxing your search criteria or resetting filters.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 24,
              }}
            >
              {filteredProducts.map((product) => {
                const stock = product.stock ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 4;
                const isJustAdded = addedId === product.id;

                return (
                  <div
                    key={product.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Badge */}
                    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {product.badge && (
                        <span
                          style={{
                            background: '#e11d48',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: 10,
                            padding: '3px 7px',
                            borderRadius: 4,
                          }}
                        >
                          {product.badge}
                        </span>
                      )}
                      {isLowStock && (
                        <span
                          style={{
                            background: '#f59e0b',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 10,
                            padding: '3px 7px',
                            borderRadius: 4,
                          }}
                        >
                          Only {stock} Left
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 3,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isInWishlist(product.id) ? '#e11d48' : '#6b7280',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      }}
                      title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={16} fill={isInWishlist(product.id) ? '#e11d48' : 'none'} />
                    </button>

                    {/* Image */}
                    <Link
                      href={`/product/${product.id}`}
                      style={{
                        position: 'relative',
                        paddingTop: '100%',
                        background: '#f9fafb',
                        display: 'block',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Link>

                    {/* Body */}
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
                          {product.brand}
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          style={{ textDecoration: 'none', color: '#111827' }}
                        >
                          <h3
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              margin: '0 0 8px 0',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              height: 38,
                            }}
                          >
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice && (
                            <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={isOutOfStock}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: 6,
                              border: 'none',
                              background: isOutOfStock ? '#e5e7eb' : isJustAdded ? '#10b981' : '#000000',
                              color: isOutOfStock ? '#9ca3af' : '#ffffff',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <ShoppingBag size={14} />
                            {isOutOfStock ? 'Out of Stock' : isJustAdded ? 'Added ✓' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
