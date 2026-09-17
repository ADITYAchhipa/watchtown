'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthSession, Order } from '@/types';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  Truck,
  Heart,
  ExternalLink,
  Lock,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Auth Form State (when not logged in)
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Active Account Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Check current session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setSession(data.session);
          // Fetch orders for customer
          fetch('/api/orders')
            .then((r) => r.json())
            .then((od) => {
              if (od.orders) {
                // Filter orders matching session email or phone
                const myOrders = od.orders.filter(
                  (o: Order) =>
                    (o.customer.email && o.customer.email.toLowerCase() === data.session.email.toLowerCase()) ||
                    (data.session.role === 'admin')
                );
                setOrders(myOrders);
              }
            })
            .catch((e) => console.error(e));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);

    try {
      const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/register';
      const body = isLoginTab
        ? { email, password }
        : { email, password, name, phone, role: 'customer' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }

      setSession(data.session);
      if (data.session.role === 'admin') {
        router.push('/admin');
      } else {
        // Refresh orders
        const ordRes = await fetch('/api/orders');
        const ordData = await ordRes.json();
        if (ordData.orders) {
          setOrders(
            ordData.orders.filter(
              (o: Order) => o.customer.email?.toLowerCase() === data.session.email.toLowerCase()
            )
          );
        }
      }
    } catch {
      setAuthError('Network error during authentication. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setOrders([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <div style={{ color: '#6b7280', fontSize: 16 }}>Loading your account...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
        {!session ? (
          /* Authentication Login / Register Card */
          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: '36px 32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.12)',
                    color: '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <User size={24} />
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
                  {isLoginTab ? 'Customer Sign In' : 'Create an Account'}
                </h1>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                  Access your orders, tracking updates, and personal watch collection
                </p>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setAuthError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 700,
                    fontSize: 14,
                    color: isLoginTab ? '#111827' : '#9ca3af',
                    borderBottom: isLoginTab ? '2px solid #d4af37' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(false);
                    setAuthError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 700,
                    fontSize: 14,
                    color: !isLoginTab ? '#111827' : '#9ca3af',
                    borderBottom: !isLoginTab ? '2px solid #d4af37' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fef2f2',
                    borderRadius: 8,
                    color: '#b91c1c',
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!isLoginTab && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                    }}
                  />
                </div>

                {!isLoginTab && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: 8,
                    background: 'linear-gradient(135deg, #1f2636, #0b0d11)',
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    padding: '12px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: submitting ? 'wait' : 'pointer',
                  }}
                >
                  {submitting ? 'Please wait...' : isLoginTab ? 'Sign In to Account' : 'Complete Registration'}
                </button>
              </form>

              {/* Admin Portal Shortcut */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                <Link
                  href="/admin/login"
                  style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', fontWeight: 600 }}
                >
                  Store Administrator? Access Admin Portal &rarr;
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div>
            {/* Header User Profile Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #111827 0%, #0b0d11 100%)',
                color: '#ffffff',
                borderRadius: 16,
                padding: '32px',
                marginBottom: 32,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {session.role === 'admin' ? 'Store Administrator' : 'Verified Customer'}
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 4px 0', color: '#ffffff' }}>
                    Welcome back, {session.name}
                  </h2>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>{session.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {session.role === 'admin' && (
                  <Link
                    href="/admin"
                    style={{
                      background: '#d4af37',
                      color: '#0b0d11',
                      padding: '10px 18px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    Open Admin CRM <ExternalLink size={14} />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>

            {/* Account Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  background: activeTab === 'orders' ? '#111827' : '#ffffff',
                  color: activeTab === 'orders' ? '#ffffff' : '#374151',
                  border: '1px solid #e5e7eb',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Package size={16} /> My Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  background: activeTab === 'profile' ? '#111827' : '#ffffff',
                  color: activeTab === 'profile' ? '#ffffff' : '#374151',
                  border: '1px solid #e5e7eb',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <User size={16} /> Profile Details
              </button>
              <Link
                href="/wishlist"
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Heart size={16} color="#d4af37" /> Saved Wishlist
              </Link>
            </div>

            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      padding: '50px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <Package size={40} color="#9ca3af" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>No Orders Found Yet</h3>
                    <p style={{ color: '#6b7280', fontSize: 14, margin: '6px 0 20px 0' }}>
                      Orders placed using your email or phone will automatically appear here.
                    </p>
                    <Link
                      href="/shop"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#111827',
                        color: '#ffffff',
                        padding: '10px 24px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Shop Watches <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 12,
                          border: '1px solid #e5e7eb',
                          padding: '20px 24px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #f3f4f6', paddingBottom: 14, marginBottom: 14 }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                              Order ID
                            </span>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{ord.orderNumber}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>
                              Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: ord.status === 'delivered' ? '#ecfdf5' : '#eff6ff',
                                color: ord.status === 'delivered' ? '#059669' : '#2563eb',
                              }}
                            >
                              {ord.status}
                            </span>
                            <Link
                              href={`/track-order?orderId=${ord.orderNumber}`}
                              style={{
                                background: '#f3f4f6',
                                color: '#111827',
                                padding: '6px 14px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Truck size={14} /> Live Tracking
                            </Link>
                          </div>
                        </div>

                        {/* Items list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {ord.items.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span style={{ color: '#111827', fontWeight: 600 }}>
                                {it.quantity}x {it.name} ({it.brand})
                              </span>
                              <span style={{ fontWeight: 700, color: '#111827' }}>
                                ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>
                            Delivery to: {ord.customer.city}, {ord.customer.state} ({ord.customer.pincode})
                          </span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                            Total: ₹{(ord.total ?? ord.totalAmount ?? 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  padding: '32px',
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px 0', color: '#111827' }}>
                  Account Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Name
                    </label>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginTop: 4 }}>{session.name}</div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Email Address
                    </label>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginTop: 4 }}>{session.email}</div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      Role
                    </label>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginTop: 4, textTransform: 'capitalize' }}>
                      {session.role}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
