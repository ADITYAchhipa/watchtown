'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export function DynamicCartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
  } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 1500;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // WhatsApp Checkout message generator
  const generateWhatsAppUrl = () => {
    const lines = [
      `*WATCHTOWN LUXURY STORE ORDER* 🛍️`,
      `========================`,
      ...items.map(
        (it) => `• ${it.quantity}x *${it.name}* (₹${it.price.toLocaleString('en-IN')})`
      ),
      `========================`,
      `*Total Items:* ${totalCount}`,
      `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}`,
      `*Payment Preference:* Cash on Delivery (COD) / UPI`,
      `\nPlease confirm availability and dispatch my parcel.`,
    ];

    const message = encodeURIComponent(lines.join('\n'));
    // Use WhatsApp link from site config or direct phone
    return `https://api.whatsapp.com/send?phone=919763642094&text=${message}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          color: '#111827',
          zIndex: 9999,
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0b0d11',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={18} style={{ color: '#d4af37' }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Shopping Cart ({totalCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f9fafb',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#374151',
              marginBottom: 6,
            }}
          >
            <Truck size={15} style={{ color: '#10b981' }} />
            {amountNeeded > 0 ? (
              <span>
                Add <strong>₹{amountNeeded.toLocaleString('en-IN')}</strong> more for <strong>Free Express Shipping</strong>
              </span>
            ) : (
              <span style={{ color: '#059669', fontWeight: 600 }}>
                🎉 You have unlocked Free Express Shipping!
              </span>
            )}
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#e5e7eb',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: progressPercent >= 100 ? '#10b981' : '#d4af37',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
              }}
            >
              <ShoppingBag size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
                Your cart is empty
              </h4>
              <p style={{ fontSize: 13, marginTop: 6 }}>
                Explore our luxury first-copy watch collection and add your favorite timepieces.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Browse Watches
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    background: '#f9fafb',
                    borderRadius: 8,
                    border: '1px solid #f3f4f6',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 6,
                      objectFit: 'cover',
                      background: '#e5e7eb',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
                      {item.brand}
                    </div>
                    <h4
                      style={{
                        margin: '2px 0 6px 0',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </h4>
                    <div style={{ fontWeight: 700, color: '#000000', fontSize: 13 }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>

                    {/* Quantity controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          overflow: 'hidden',
                          background: '#ffffff',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#374151',
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          style={{
                            padding: '0 8px',
                            fontSize: 12,
                            fontWeight: 600,
                            minWidth: 20,
                            textAlign: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px 8px',
                            cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                            color: item.quantity >= item.stock ? '#d1d5db' : '#374151',
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: 4,
                        }}
                        title="Remove watch"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with subtotal and WhatsApp Order CTA */}
        {items.length > 0 && (
          <div
            style={{
              padding: '18px 20px',
              borderTop: '1px solid #e5e7eb',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontSize: 14,
                color: '#4b5563',
              }}
            >
              <span>Subtotal</span>
              <strong style={{ fontSize: 18, color: '#111827' }}>
                ₹{subtotal.toLocaleString('en-IN')}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: '#6b7280',
                marginBottom: 14,
              }}
            >
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              <span>Cash on Delivery (COD) &bull; 7-Day Replacement Guarantee</span>
            </div>

            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '14px',
                background: '#25D366',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              Order via WhatsApp <ArrowRight size={16} />
            </a>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#9ca3af',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
