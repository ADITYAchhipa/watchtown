'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Key, Shield, ArrowRight } from 'lucide-react';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'admin',
          adminSecret,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Registration failed. Please check your details.');
        setLoading(false);
        return;
      }

      // Successful registration
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-wrapper">
      <div className="admin-auth-card" style={{ maxWidth: 480 }}>
        <div className="admin-auth-brand">
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="admin-logo-badge">
              <Shield size={18} />
              WATCHTOWN
            </span>
          </div>
          <h2>Register Administrator</h2>
          <p>Create a verified admin profile for WatchTown inventory CRM</p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                }}
              />
              <input
                type="text"
                required
                className="admin-input"
                style={{ paddingLeft: 38 }}
                placeholder="e.g. Vikram Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                }}
              />
              <input
                type="email"
                required
                className="admin-input"
                style={{ paddingLeft: 38 }}
                placeholder="name@watchtown.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                  }}
                />
                <input
                  type="password"
                  required
                  className="admin-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Min 8 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                  }}
                />
                <input
                  type="password"
                  required
                  className="admin-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="admin-label">Admin Security Key</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Key
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                }}
              />
              <input
                type="text"
                required
                className="admin-input"
                style={{ paddingLeft: 38, fontFamily: 'monospace' }}
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', marginTop: 8, padding: '12px' }}
          >
            {loading ? (
              'Registering Account...'
            ) : (
              <>
                <UserPlus size={16} /> Complete Registration & Access CRM <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: '1px solid var(--admin-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--admin-text-dim)',
          }}
        >
          <Link href="/admin/login" style={{ color: '#d4af37' }}>
            Already have an account? Sign in &rarr;
          </Link>
          <Link href="/" style={{ color: 'var(--admin-text-muted)' }}>
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
