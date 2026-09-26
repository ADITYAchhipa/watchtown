'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to sign in. Please verify your credentials.');
        setLoading(false);
        return;
      }

      if (data.user?.role !== 'admin') {
        setError('Access denied. Super administrator privileges required.');
        setLoading(false);
        return;
      }

      // Successful login
      router.push('/admin');
      router.refresh();
    } catch {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-wrapper">
      <div className="admin-auth-card">
        <div className="admin-auth-brand">
          <div className="brand-badge">WATCHTOWN</div>
          <div className="brand-sub">SUPER ADMIN PORTAL</div>
          <h2>Executive Sign In</h2>
          <p>Curated time. Precise control.</p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--redSoft)',
              border: '1px solid #f2c7c7',
              color: 'var(--red)',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 10,
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Super Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8f969b',
                }}
              />
              <input
                type="email"
                required
                className="search"
                style={{ paddingLeft: 34, height: 42, fontSize: 11 }}
                placeholder="admin@watchtown.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8f969b',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="search"
                style={{ paddingLeft: 34, paddingRight: 34, height: 42, fontSize: 11 }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#8f969b',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn gold"
            style={{
              width: '100%',
              height: 42,
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                Sign In to Workspace <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--line2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            fontSize: 9,
            color: 'var(--muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7a8288' }}>
            <ShieldCheck size={12} style={{ color: 'var(--gold)' }} />
            <span>Protected Executive System • Super Admin Only</span>
          </div>
          <Link href="/" style={{ color: 'var(--ink)', textDecoration: 'underline', marginTop: 4 }}>
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
