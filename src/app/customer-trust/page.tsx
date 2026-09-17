import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Truck, Star, CheckCircle2, Play, ArrowRight, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Customer Trust & Live Dispatch Proof | WatchTown',
  description: 'Watch real live packaging and dispatch proofs, unboxing demonstrations, and verified customer testimonials.',
};

export default function CustomerTrustPage() {
  const reviews = [
    {
      name: 'Dr. Sameer Kulkarni',
      city: 'Pune, Maharashtra',
      rating: 5,
      date: 'March 2026',
      review: 'Ordered the Rolex Daytona Rainbow. The weight and finishing are genuinely stunning. Received live video of my watch before dispatch and it reached Pune within 48 hours. 10/10 recommended!',
      watch: 'Rolex Daytona Rainbow Gem-Set',
    },
    {
      name: 'Arjun Singhania',
      city: 'Delhi-NCR',
      rating: 5,
      date: 'February 2026',
      review: 'I was hesitant about buying first copies online, but WatchTown changed my mind. The packaging was bulletproof and the sweep movement of the Patek Philippe Nautilus is identical to original.',
      watch: 'Patek Philippe Nautilus 5711/1A',
    },
    {
      name: 'Rohan Mehta',
      city: 'Ahmedabad, Gujarat',
      rating: 5,
      date: 'February 2026',
      review: 'Best watch store in India. COD option gave me total security. Watch arrived in a luxury box with warranty card. Already ordered my second watch for my brother!',
      watch: 'Audemars Piguet Royal Oak Black Dial',
    },
    {
      name: 'Kavita Verma',
      city: 'Bangalore, Karnataka',
      rating: 5,
      date: 'January 2026',
      review: 'Bought the Coach Delancey Rose Gold for an anniversary gift. Extremely elegant craftsmanship and the glass is totally scratch-resistant. Thank you WatchTown team!',
      watch: 'Coach Delancey Rose Gold 36mm',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Customer Trust &amp; Dispatch Proof</span>
        </div>

        {/* Hero Title */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Total Transparency
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '8px 0 14px 0' }}>
            Live Packaging &amp; Customer Trust
          </h1>
          <p style={{ color: '#4b5563', fontSize: 16, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Every single WatchTown order is video-documented, quality-inspected, and dispatched with tamper-evident security seals. See why over 10,000+ horology lovers trust us.
          </p>
        </div>

        {/* Trust Badges Bar */}
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '30px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            textAlign: 'center',
            marginBottom: 50,
          }}
        >
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>100%</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 4 }}>HD Dispatch Proof</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Every single order recorded</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#d4af37' }}>4.8 / 5.0</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 4 }}>Verified Google Reviews</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>From 1,200+ authenticated buyers</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>7-Day</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 4 }}>Hassle-Free Replacement</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Transit damage coverage</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>Cash on Delivery</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 4 }}>Pan-India COD</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Pay only when received</div>
          </div>
        </div>

        {/* Dispatch Video Showcase */}
        <div
          style={{
            background: 'linear-gradient(135deg, #111827, #0b0d11)',
            color: '#ffffff',
            borderRadius: 20,
            padding: '40px 32px',
            marginBottom: 60,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1 }}>
                Live Verification
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: '8px 0 16px 0' }}>
                How We Pack &amp; Dispatch Your Watch
              </h2>
              <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                Before any parcel leaves our fulfillment hub, our technicians record a continuous 360-degree video inspecting timekeeping, date changes, clasp locking, and casing condition. The watch is placed on its collector pillow, sealed in bubble armor, and enclosed in a barcoded security flyer.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <a
                  href="https://chat.whatsapp.com/EqFzIkN7VAk4sEipabrqEU"
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
                  <MessageCircle size={16} /> Join WhatsApp Video Channel
                </a>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Precision Timegrapher rate &amp; beat-error calibration</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Microfiber polishing &amp; lint-free dust inspection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Shock-absorbent high-density bubble envelope sealing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Real-time AWB barcode generation with SMS link</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Grid */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Verified Buyer Testimonials
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Real reviews from verified customers who purchased through WatchTown
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {reviews.map((rev, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                    {[...Array(rev.rating)].map((_, r) => (
                      <Star key={r} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 16px 0', fontStyle: 'italic' }}>
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{rev.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{rev.city} • {rev.date}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#d4af37', marginTop: 4 }}>
                    Purchased: {rev.watch}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#111827',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: 30,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}
          >
            Explore Master Watch Collection <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
