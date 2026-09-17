'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalCount, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = subtotal >= 1500 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your shopping cart is empty. Please add a watch before proceeding.');
      return;
    }

    if (phone.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile number for dispatch updates.');
      return;
    }

    if (pincode.trim().length < 6) {
      setError('Please provide a valid 6-digit postal PIN code.');
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((it) => ({
        productId: it.id,
        name: it.name,
        brand: it.brand,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          items: orderItems,
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Order placed successfully! Clear cart & redirect
      clearCart();
      router.push(`/order-success?orderId=${data.order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 20px 80px 20px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#111827', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/shop" style={{ color: '#111827', fontWeight: 600 }}>Shop</Link>
          <span>/</span>
          <span>Secure Checkout</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#000000',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827' }}>
              Express Checkout
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#6b7280' }}>
              All-India Cash on Delivery &bull; Safe Packaging &bull; Free Shipping over ₹1,500
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '60px 24px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}
          >
            <ShoppingBag size={52} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
            <h2 style={{ fontSize: 20, color: '#111827', margin: 0 }}>Your cart is empty</h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '8px 0 24px 0' }}>
              Add a watch to your cart before proceeding to checkout.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#000000',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Browse Luxury Catalog
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* Left Column: Delivery Details Form */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px 0', color: '#111827' }}>
                1. Shipping &amp; Contact Information
              </h2>

              {error && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '12px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 20,
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitOrder}>
                {/* Full Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      PHONE (FOR COURIER UPDATES) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      EMAIL (OPTIONAL)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    STREET ADDRESS / HOUSE NO. / LANDMARK *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat 204, Green Heights, Opp. Central Mall"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* City, State, PIN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      CITY *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      STATE *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      PIN CODE *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="400001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>
                    2. Payment Method
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 8,
                        border: paymentMethod === 'cod' ? '2px solid #000000' : '1px solid #d1d5db',
                        background: paymentMethod === 'cod' ? '#fdfdfd' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                          Cash on Delivery (COD)
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          Pay securely in cash or via UPI when the courier delivers your watch.
                        </div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 8,
                        border: paymentMethod === 'upi' ? '2px solid #000000' : '1px solid #d1d5db',
                        background: paymentMethod === 'upi' ? '#fdfdfd' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                          Instant UPI / Google Pay / PhonePe
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          Pay via QR code after order confirmation with dispatch priority.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Optional Notes */}
                <div style={{ marginTop: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    SPECIAL INSTRUCTIONS / LANDMARK (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, ring bell twice"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: 28,
                    padding: '16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#000000',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  }}
                >
                  {loading ? (
                    'Confirming Order...'
                  ) : (
                    <>
                      Confirm &amp; Place Order (₹{grandTotal.toLocaleString('en-IN')}) <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 28,
                position: 'sticky',
                top: 90,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 18px 0', color: '#111827' }}>
                Order Summary ({totalCount} items)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 6,
                        objectFit: 'cover',
                        border: '1px solid #e5e7eb',
                        background: '#f3f4f6',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                        {item.brand}
                      </div>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          margin: '2px 0 4px 0',
                          color: '#111827',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </h4>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Qty: {item.quantity} &times; ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4b5563', marginBottom: 8 }}>
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4b5563', marginBottom: 12 }}>
                  <span>Express Delivery</span>
                  {shippingFee === 0 ? (
                    <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                  ) : (
                    <strong>₹{shippingFee}</strong>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#111827',
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: 12,
                    marginTop: 8,
                  }}
                >
                  <span>Total Amount</span>
                  <span style={{ color: '#d4af37' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563' }}>
                  <ShieldCheck size={16} style={{ color: '#10b981' }} />
                  <span>7-Day Easy Replacement Guarantee</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563' }}>
                  <Truck size={16} style={{ color: '#10b981' }} />
                  <span>Verified Packaging &amp; Live Tracking via SMS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  <span>100% Genuine 7AA First-Copy Grade</span>
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
