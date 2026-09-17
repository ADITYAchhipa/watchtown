'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, totalCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const FREE_SHIPPING_THRESHOLD = 1500;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (code === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied('WELCOME10 (10% Off)');
      setCouponInput('');
    } else if (code === 'WATCHTOWN500' && subtotal >= 3000) {
      setDiscountAmount(500);
      setCouponApplied('WATCHTOWN500 (₹500 Off)');
      setCouponInput('');
    } else if (code === 'WATCHTOWN500' && subtotal < 3000) {
      setCouponError('Coupon WATCHTOWN500 requires a minimum cart value of ₹3,000.');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 for 10% discount.');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setDiscountAmount(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1240, width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
        {/* Title */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
              }}
            >
              <ShoppingBag size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>
                Shopping Cart ({totalCount} {totalCount === 1 ? 'item' : 'items'})
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
                Review and adjust your order before fast dispatch
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                cursor: 'pointer',
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
              Empty Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
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
              <ShoppingBag size={36} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Your Cart is Currently Empty
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 420, margin: '0 auto 24px auto' }}>
              Discover handcrafted master copy luxury watches from Rolex, Audemars Piguet, Omega, and more with free Cash on Delivery.
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
              }}
            >
              Explore Watches <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Two Column Cart Layout */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 32, alignItems: 'start' }}>
            {/* Left: Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Free Shipping Progress Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={16} color="#10b981" />
                    {amountNeeded === 0
                      ? 'Congratulations! You unlocked Free Express Shipping'
                      : `Add ₹${amountNeeded.toLocaleString('en-IN')} more for Free Express Shipping`}
                  </span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{progressToFreeShipping}%</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progressToFreeShipping}%`,
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ padding: '16px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                  Product Details &amp; Quantity
                </div>

                <div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '20px',
                        display: 'flex',
                        gap: 18,
                        alignItems: 'center',
                        borderBottom: '1px solid #f3f4f6',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#f3f4f6',
                          flexShrink: 0,
                        }}
                      >
                        <Link href={`/product/${item.id}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Link>
                      </div>

                      {/* Product Name & Brand */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase' }}>
                          {item.brand || 'Luxury Watch'}
                        </span>
                        <h4 style={{ margin: '4px 0 6px 0', fontSize: 15, fontWeight: 600, color: '#111827' }}>
                          <Link href={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {item.name}
                          </Link>
                        </h4>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: 32,
                            height: 32,
                            background: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4b5563',
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          style={{
                            width: 36,
                            textAlign: 'center',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#111827',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          style={{
                            width: 32,
                            height: 32,
                            background: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4b5563',
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total for item */}
                      <div style={{ width: 100, textAlign: 'right', fontWeight: 700, fontSize: 16, color: '#111827' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        title="Remove from Cart"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 6,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '24px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                position: 'sticky',
                top: 20,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px 0', color: '#111827' }}>
                Order Summary
              </h3>

              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>
                  Promo / Coupon Code
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 13,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#111827',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0 0' }}>{couponError}</p>
                )}
                {couponApplied && (
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ecfdf5',
                      color: '#059669',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag size={13} /> {couponApplied}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #e5e7eb', paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4b5563' }}>
                  <span>Subtotal ({totalCount} items)</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4b5563' }}>
                  <span>Shipping &amp; Handling</span>
                  <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#10b981' : '#111827' }}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#059669' }}>
                    <span>Coupon Discount</span>
                    <span style={{ fontWeight: 600 }}>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Grand Total</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => router.push('/checkout')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                  color: '#0b0d11',
                  border: 'none',
                  padding: '14px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                  marginBottom: 12,
                }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <Link
                href="/shop"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4b5563',
                  textDecoration: 'none',
                }}
              >
                &larr; Continue Shopping
              </Link>

              {/* Trust badges */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span>100% Quality Inspection Before Dispatch</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Cash on Delivery Available Across India</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
