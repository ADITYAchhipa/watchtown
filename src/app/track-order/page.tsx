'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Order, OrderStatus } from '@/types';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('orderId') || searchParams.get('id') || '';

  const [query, setQuery] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (searchVal: string) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // 1. Try exact order ID first
      const res = await fetch(`/api/orders/${encodeURIComponent(searchVal.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          setLoading(false);
          return;
        }
      }

      // 2. Try searching by phone or query
      const searchRes = await fetch(`/api/orders?search=${encodeURIComponent(searchVal.trim())}`);
      const searchData = await searchRes.json();
      if (searchData.orders && searchData.orders.length > 0) {
        setOrder(searchData.orders[0]);
      } else {
        setOrder(null);
        setError('No order found matching this Order ID or Phone Number. Please verify and retry.');
      }
    } catch {
      setError('Unable to fetch tracking details. Please check your network connection.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  // Timeline Steps calculation
  const getTimelineSteps = (status: OrderStatus) => {
    const steps = [
      { id: 'pending', title: 'Order Placed', desc: 'Received & Queued' },
      { id: 'confirmed', title: 'Quality Checked', desc: 'Inspected & Sealed' },
      { id: 'dispatched', title: 'Dispatched', desc: 'Handed to Courier' },
      { id: 'in_transit', title: 'In Transit', desc: 'En Route to City' },
      { id: 'delivered', title: 'Delivered', desc: 'Handed to Customer' },
    ];

    let activeIndex = 0;
    if (status === 'confirmed') activeIndex = 1;
    if (status === 'dispatched') activeIndex = 3;
    if (status === 'delivered') activeIndex = 4;
    if (status === 'cancelled') activeIndex = -1;

    return { steps, activeIndex };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 960, width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
        {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1 }}>
            Live Shipment Tracker
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '6px 0 10px 0' }}>
            Track Your WatchTown Order
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
            Enter your Order Number (e.g. WT-849201) or 10-digit mobile number to view live courier status and packing details.
          </p>
        </div>

        {/* Search Input Box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '28px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: 32,
          }}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search
                size={18}
                style={{ position: 'absolute', top: 14, left: 14, color: '#9ca3af' }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (WT-XXXXXX) or Mobile Number"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #1f2636, #0b0d11)',
                color: '#d4af37',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: 10,
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {loading ? 'Searching...' : 'Track Shipment'}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#fef2f2',
                borderRadius: 8,
                color: '#b91c1c',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Display */}
        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header info card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '24px 28px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                    Order Number
                  </span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{order.orderNumber}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 30,
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background:
                        order.status === 'delivered'
                          ? '#ecfdf5'
                          : order.status === 'dispatched'
                          ? '#eff6ff'
                          : order.status === 'cancelled'
                          ? '#fef2f2'
                          : '#fffbeb',
                      color:
                        order.status === 'delivered'
                          ? '#059669'
                          : order.status === 'dispatched'
                          ? '#2563eb'
                          : order.status === 'cancelled'
                          ? '#dc2626'
                          : '#d97706',
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background:
                          order.status === 'delivered'
                            ? '#059669'
                            : order.status === 'dispatched'
                            ? '#2563eb'
                            : order.status === 'cancelled'
                            ? '#dc2626'
                            : '#d97706',
                      }}
                    />
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              {order.status !== 'cancelled' ? (
                <div style={{ margin: '24px 0 32px 0' }}>
                  {(() => {
                    const { steps, activeIndex } = getTimelineSteps(order.status);
                    return (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                          position: 'relative',
                          gap: 8,
                        }}
                      >
                        {steps.map((st, i) => {
                          const isComplete = i <= activeIndex;
                          const isCurrent = i === activeIndex;
                          return (
                            <div key={st.id} style={{ textAlign: 'center', position: 'relative' }}>
                              {/* Step circle */}
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: isComplete ? '#10b981' : '#e5e7eb',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 8px auto',
                                  boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                                }}
                              >
                                {isComplete ? <Check size={16} /> : <span style={{ fontSize: 12, color: '#9ca3af' }}>{i + 1}</span>}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 600, color: isComplete ? '#111827' : '#9ca3af' }}>
                                {st.title}
                              </div>
                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{st.desc}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#fef2f2', borderRadius: 8, color: '#b91c1c', fontSize: 14 }}>
                  This order was cancelled. Please contact customer support on WhatsApp if you need further assistance.
                </div>
              )}

              {/* Courier & AWB Details */}
              {(order.trackingAwb || order.trackingNumber) && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={20} color="#334155" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Courier: <strong>{order.trackingCourier || order.courier || 'Standard Express'}</strong>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                        AWB Tracking No: {order.trackingAwb || order.trackingNumber}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(order.trackingAwb || order.trackingNumber || '')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {copiedAWB ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    {copiedAWB ? 'Copied!' : 'Copy AWB'}
                  </button>
                </div>
              )}
            </div>

            {/* Destination & Ordered Items Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
              {/* Items Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>
                  Ordered Timepieces ({order.items.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        paddingBottom: 14,
                        borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid #f3f4f6',
                      }}
                    >
                      {item.image && (
                        <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase' }}>
                          {item.brand}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111827', fontWeight: 700, fontSize: 15 }}>
                  <MapPin size={18} color="#d4af37" /> Delivery Destination
                </div>

                <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                  <strong style={{ color: '#111827' }}>{order.customer.fullName}</strong>
                  <br />
                  {order.customer.street}
                  <br />
                  {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                  <br />
                  Phone: {order.customer.phone}
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 6 }}>
                    <span>Payment Method:</span>
                    <strong style={{ color: '#111827', textTransform: 'uppercase' }}>{order.paymentMethod}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                    <span>Total Amount:</span>
                    <strong style={{ color: '#111827', fontSize: 16 }}>₹{(order.total ?? order.totalAmount ?? 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919763642094?text=Hi%20WatchTown,%20checking%20status%20for%20order%20${encodeURIComponent(order.orderNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: '#25D366',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 8,
                  }}
                >
                  <MessageCircle size={16} /> WhatsApp Fast-Track
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
