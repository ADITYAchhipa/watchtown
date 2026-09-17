'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Contact Us</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Customer Concierge
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '8px 0 12px 0' }}>
            We&apos;re Here to Help 24/7
          </h1>
          <p style={{ color: '#4b5563', fontSize: 15, maxWidth: 580, margin: '0 auto' }}>
            Have a question about watch specifications, order status, or live dispatch proofs? Reach our concierge team via WhatsApp or phone.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>
          {/* Contact Details Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* WhatsApp Priority Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #064e3b, #065f46)',
                color: '#ffffff',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 4px 15px rgba(6, 78, 59, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>WhatsApp Concierge</h3>
                  <div style={{ fontSize: 12, color: '#a7f3d0' }}>Instant reply within 5 minutes</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#d1fae5', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Chat directly with our luxury watch curators. Ask for live 360° video demonstrations, strap sizing advice, or dispatch confirmation.
              </p>
              <a
                href="https://wa.me/919763642094?text=Hi%20WatchTown,%20I%20have%20an%20inquiry%20regarding%20watches"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                Chat on WhatsApp Now &rarr;
              </a>
            </div>

            {/* Direct Contact Cards */}
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Phone size={20} color="#d4af37" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Phone Hotline</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 2 }}>(+91) 9763642094</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Mon - Sun, 10:00 AM - 10:00 PM IST</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Mail size={20} color="#d4af37" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Email Inquiries</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 2 }}>support@watchtown.in</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Response within 24 business hours</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <MapPin size={20} color="#d4af37" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Fulfillment Hub</div>
                  <div style={{ fontSize: 14, color: '#374151', marginTop: 2 }}>
                    WatchTown Logistics &amp; Inspection Center, Andheri East, Mumbai, Maharashtra, India 400069
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Send Us a Message
            </h3>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 24px 0' }}>
              Fill out the form below and our team will get back to you promptly.
            </p>

            {submitted ? (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 12,
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: 18, fontWeight: 700, color: '#065f46', margin: 0 }}>Message Received!</h4>
                <p style={{ fontSize: 13, color: '#047857', margin: '8px 0 0 0' }}>
                  Thank you, {name}. Our concierge specialist will contact you via WhatsApp or phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Optional"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Your Message / Watch of Interest *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us which watch model you're looking for or how we can assist you..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Send size={15} /> Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
