'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  ShoppingBag,
  Eye,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  X,
  Star,
  ShieldCheck,
  Truck,
  ArrowRight,
  Heart,
  ExternalLink,
} from 'lucide-react';

interface DynamicProductsCatalogProps {
  initialProducts: Product[];
}

export function DynamicProductsCatalog({ initialProducts }: DynamicProductsCatalogProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedId, setAddedId] = useState<string | number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (initialProducts.length === 0) {
    return null;
  }

  // Tabs
  const TABS = [
    { id: 'all', label: 'All Watches' },
    { id: 'rolex', label: 'Rolex' },
    { id: 'audemars piguet', label: 'Audemars Piguet' },
    { id: 'patek philippe', label: 'Patek Philippe' },
    { id: 'omega', label: 'Omega' },
    { id: 'tag heuer', label: 'Tag Heuer' },
    { id: 'automatic', label: 'Automatic' },
    { id: 'under_3000', label: 'Under ₹3,000' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === 'under_3000') {
        if (p.price >= 3000) return false;
      } else if (activeTab === 'automatic') {
        const isAuto =
          p.categories.some((c) => c.toLowerCase().includes('automatic')) ||
          p.name.toLowerCase().includes('automatic');
        if (!isAuto) return false;
      } else if (activeTab !== 'all') {
        const matchesBrand = (p.brand || '').toLowerCase().includes(activeTab);
        const matchesName = p.name.toLowerCase().includes(activeTab);
        if (!matchesBrand && !matchesName) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = (p.brand || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }

      return true;
    });
  }, [products, activeTab, searchQuery]);

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
    <section
      id="products-catalog"
      style={{
        padding: '50px 0 60px 0',
        background: '#ffffff',
        borderTop: '1px solid #f3f4f6',
      }}
    >
      <div className="container" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 20px' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fef3c7',
              color: '#92400e',
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 20,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            <Sparkles size={14} style={{ color: '#d97706' }} /> Premium 7AA Master Collection
          </div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-urbanist), sans-serif',
            }}
          >
            First Copy Luxury Watches
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 620, margin: '0 auto' }}>
            Top-quality 7AA master replicas crafted with surgical stainless steel, Japanese automatic movements, and luxury gift packaging.
          </p>
        </div>

        {/* Filter Navigation Tabs & Search */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 32,
            paddingBottom: 16,
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 25,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #000000' : '1px solid #e5e7eb',
                    background: isActive ? '#000000' : '#ffffff',
                    color: isActive ? '#ffffff' : '#4b5563',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div
            style={{
              position: 'relative',
              width: 260,
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: 20,
                border: '1px solid #d1d5db',
                fontSize: 13,
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
            <h3 style={{ fontSize: 18, color: '#111827' }}>No watches found</h3>
            <p style={{ fontSize: 14 }}>Try switching tabs or searching for a different watch name.</p>
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
                  {/* Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      zIndex: 2,
                    }}
                  >
                    {product.badge && (
                      <span
                        style={{
                          background: '#e11d48',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 4,
                          letterSpacing: 0.5,
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
                        ONLY {stock} LEFT!
                      </span>
                    )}
                    {isOutOfStock && (
                      <span
                        style={{
                          background: '#6b7280',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 10,
                          padding: '3px 7px',
                          borderRadius: 4,
                        }}
                      >
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  {/* Action Buttons: Wishlist & Quick View */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      zIndex: 3,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isInWishlist(product.id) ? '#e11d48' : '#6b7280',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'all 0.2s ease',
                      }}
                      title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={16} fill={isInWishlist(product.id) ? '#e11d48' : 'none'} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#111827',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'all 0.2s ease',
                      }}
                      title="Quick preview"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <Link
                    href={`/product/${product.id}`}
                    style={{
                      position: 'relative',
                      paddingTop: '100%',
                      background: '#f9fafb',
                      overflow: 'hidden',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={
                        product.image ||
                        'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg'
                      }
                      alt={product.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                      }}
                    />
                  </Link>

                  {/* Content */}
                  <div
                    style={{
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          marginBottom: 4,
                        }}
                      >
                        {product.brand || 'Luxury Watch'}
                      </div>

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
                        <Link
                          href={`/product/${product.id}`}
                          style={{
                            color: '#111827',
                            textDecoration: 'none',
                          }}
                        >
                          {product.name}
                        </Link>
                      </h3>

                      {/* Stars */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginBottom: 10,
                          fontSize: 12,
                          color: '#d97706',
                        }}
                      >
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 700 }}>{product.rating || '5.0'}</span>
                        <span style={{ color: '#9ca3af' }}>({product.reviewCount || 12})</span>
                      </div>
                    </div>

                    <div>
                      {/* Price & Discount */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#111827',
                          }}
                        >
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span
                            style={{
                              fontSize: 13,
                              color: '#9ca3af',
                              textDecoration: 'line-through',
                            }}
                          >
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Add to cart CTA */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isOutOfStock}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: 'none',
                          background: isOutOfStock
                            ? '#e5e7eb'
                            : isJustAdded
                            ? '#10b981'
                            : '#000000',
                          color: isOutOfStock ? '#9ca3af' : '#ffffff',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        {isOutOfStock ? (
                          'Out of Stock'
                        ) : isJustAdded ? (
                          <>
                            <Check size={16} /> Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={15} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          onClick={() => setQuickViewProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 800,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            }}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Image */}
            <div style={{ background: '#f9fafb', padding: 24, display: 'flex', alignItems: 'center' }}>
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                style={{ width: '100%', height: 'auto', borderRadius: 12, objectFit: 'contain' }}
              />
            </div>

            {/* Modal Details */}
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                  {quickViewProduct.brand} &bull; {quickViewProduct.sku || `WT-${quickViewProduct.id}`}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0', color: '#111827' }}>
                  {quickViewProduct.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span style={{ fontSize: 15, color: '#9ca3af', textDecoration: 'line-through' }}>
                      ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {quickViewProduct.badge && (
                    <span
                      style={{
                        background: '#e11d48',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {quickViewProduct.badge}
                    </span>
                  )}
                </div>

                {/* Stock alert */}
                <div style={{ marginBottom: 16 }}>
                  {(quickViewProduct.stock ?? 0) <= 0 ? (
                    <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
                      ✕ Currently Out of Stock
                    </span>
                  ) : (quickViewProduct.stock ?? 0) <= 4 ? (
                    <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>
                      ⚠ Only {quickViewProduct.stock} items remaining in stock!
                    </span>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>
                      ✓ In Stock ({quickViewProduct.stock} available units)
                    </span>
                  )}
                </div>

                <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  {quickViewProduct.description ||
                    'Premium 7AA master copy luxury timepiece with precision movement, sapphire crystal, solid stainless steel links, and luxury collector gift packaging.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={14} style={{ color: '#10b981' }} /> Free Express Shipping All Over India
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} style={{ color: '#10b981' }} /> Cash on Delivery (COD) Available
                  </div>
                </div>
              </div>

                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <Link
                    href={`/product/${quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#4b5563',
                      textDecoration: 'none',
                    }}
                  >
                    View Complete Watch Specifications & Gallery <ExternalLink size={14} />
                  </Link>
                </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <button
                  onClick={(e) => {
                    handleAddToCart(quickViewProduct, e);
                    setQuickViewProduct(null);
                  }}
                  disabled={(quickViewProduct.stock ?? 0) <= 0}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    background: '#000000',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: (quickViewProduct.stock ?? 0) <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>
                <a
                  href={`https://api.whatsapp.com/send?phone=919763642094&text=${encodeURIComponent(
                    `Hi WatchTown, I want to order the ${quickViewProduct.name} (₹${quickViewProduct.price}). Please share dispatch details.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px 18px',
                    borderRadius: 8,
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  WhatsApp <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
