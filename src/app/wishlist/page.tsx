'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Heart, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Star } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = React.useState<string | number | null>(null);

  const handleMoveToCart = (product: (typeof items)[0]) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1240, width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
        {/* Header Title */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 32,
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37',
                }}
              >
                <Heart size={20} fill="#d4af37" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>
                My Wishlist ({items.length})
              </h1>
            </div>
            <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: 14 }}>
              Saved timepieces for your personal collection. High-demand items may sell out quickly.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#f3f4f6',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <Heart size={36} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 420, margin: '0 auto 24px auto' }}>
              You haven&apos;t saved any luxury watches yet. Explore our premier 7AA replica collection and tap the heart icon on watches you love.
            </p>
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#111827',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: 30,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {items.map((watch) => {
              const inStock = (watch.stock ?? 0) > 0;
              return (
                <div
                  key={watch.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Image wrapper */}
                  <div style={{ position: 'relative', paddingTop: '100%', background: '#f9fafb' }}>
                    <Link href={`/product/${watch.id}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watch.image}
                        alt={watch.name}
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

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(watch.id)}
                      title="Remove from Wishlist"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>

                    {watch.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: '#ef4444',
                          color: '#ffffff',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {watch.badge}
                      </span>
                    )}
                  </div>

                  {/* Body info */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase' }}>
                        {watch.brand || 'Luxury Watch'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#f59e0b' }}>
                        <Star size={12} fill="#f59e0b" />
                        <span style={{ fontWeight: 600, color: '#374151' }}>{watch.rating?.toFixed(1) || '4.8'}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px 0', lineHeight: 1.3, color: '#111827' }}>
                      <Link
                        href={`/product/${watch.id}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {watch.name}
                      </Link>
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto', marginBottom: 14 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                        ₹{watch.price.toLocaleString('en-IN')}
                      </span>
                      {watch.originalPrice && watch.originalPrice > watch.price && (
                        <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
                          ₹{watch.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div style={{ marginBottom: 12 }}>
                      {inStock ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={13} /> In Stock (COD Available)
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleMoveToCart(watch)}
                      disabled={!inStock}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        background: inStock ? '#111827' : '#9ca3af',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: inStock ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <ShoppingBag size={15} />
                      {addedId === watch.id ? 'Moved to Cart!' : 'Move to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
