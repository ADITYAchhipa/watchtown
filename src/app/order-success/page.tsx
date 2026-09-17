'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Truck, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Order } from '@/types';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error('Error fetching order details:', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          {/* Animated Success Badge */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.1)',
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
            Thank You! Your Order is Confirmed
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px 0' }}>
            Your luxury watch order has been received and scheduled for dispatch inspection.
          </p>

          {/* Order Details Card */}
          {order && (
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 24,
                textAlign: 'left',
                margin: '24px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 14,
                  borderBottom: '1px solid #e5e7eb',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                    ORDER IDENTIFIER
                  </div>
                  <strong style={{ fontSize: 16, color: '#111827' }}>{order.orderNumber}</strong>
                </div>

                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 20,
                  }}
                >
                  Status: {order.status.toUpperCase()}
                </span>
              </div>

              {/* Delivery info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13, marginBottom: 16 }}>
                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 600 }}>DELIVERING TO</span>
                  <strong style={{ color: '#111827' }}>{order.customer.fullName}</strong>
                  <div style={{ color: '#4b5563', marginTop: 2 }}>
                    {order.customer.street}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                  </div>
                  <div style={{ color: '#4b5563', marginTop: 2 }}>Phone: {order.customer.phone}</div>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 600 }}>PAYMENT SUMMARY</span>
                  <div style={{ color: '#111827', fontWeight: 600 }}>
                    Mode: {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Instant UPI'}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#d4af37', marginTop: 4 }}>
                    Total Payable: ₹{order.total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
                  ORDERED TIMEPIECES ({order.items.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {order.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600, color: '#111827' }}>
                          {it.quantity}x {it.name}
                        </span>
                      </div>
                      <strong style={{ color: '#111827' }}>₹{(it.price * it.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {order && (
              <a
                href={`https://api.whatsapp.com/send?phone=919763642094&text=${encodeURIComponent(
                  `Hi WatchTown, I have placed order ${order.orderNumber} for ₹${order.total}. Please confirm packing and dispatch video.`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                }}
              >
                Fast-Track on WhatsApp <ArrowRight size={16} />
              </a>
            )}

            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#000000',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                padding: '12px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              <Home size={16} /> Back to WatchTown Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
