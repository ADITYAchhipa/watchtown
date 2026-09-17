import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Award, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About WatchTown | India’s Premier First Copy Luxury Watch Destination',
  description: 'Learn about WatchTown, our commitment to 7AA master craftsmanship, rigorous multi-point inspection, and customer-first shopping experience.',
};

export default function AboutUsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>About Us</span>
        </div>

        {/* Hero title */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Our Heritage &amp; Promise
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '8px 0 16px 0' }}>
            About WatchTown
          </h1>
          <p style={{ color: '#4b5563', fontSize: 16, maxWidth: 680, margin: '0 auto', lineHeight: 1.6 }}>
            WatchTown was founded on a singular passion: bringing iconic, world-renowned horological designs within reach without compromising on weight, movement precision, or luxurious finishing.
          </p>
        </div>

        {/* Story Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center', marginBottom: 60 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 16 }}>
              Craftsmanship Beyond Ordinary Replicas
            </h2>
            <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
              In a marketplace flooded with low-tier copies, WatchTown operates strictly in the premium 7AA master-tier realm. Every watch in our collection is precision-engineered using surgical-grade 316L stainless steel, scratch-resistant sapphire crystal glass, and meticulously calibrated automatic or chronograph movements.
            </p>
            <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.7 }}>
              From the satisfying sweep of a Daytona chronograph second hand to the iconic octagonal bezel of an AP Royal Oak, we honor the intricate details that make luxury timepieces truly majestic.
            </p>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #1f2937, #111827)',
              borderRadius: 16,
              padding: '36px 32px',
              color: '#ffffff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#d4af37', marginBottom: 20 }}>
              The WatchTown Standard
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="#d4af37" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.5 }}>
                  <strong>Rigorous Quality Checks:</strong> Every single watch undergoes a 5-point physical &amp; mechanical inspection before packaging.
                </span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Truck size={20} color="#d4af37" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.5 }}>
                  <strong>Live Video Proof:</strong> We share live packaging and dispatch video proofs with real tracking details for complete transparency.
                </span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Award size={20} color="#d4af37" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.5 }}>
                  <strong>7-Day Replacement Warranty:</strong> Complete peace of mind with replacement coverage for transit damages or mechanical defects.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '36px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
            marginBottom: 60,
          }}
        >
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#111827' }}>10,000+</div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>Happy Customers Pan-India</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#d4af37' }}>4.8 ★</div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>Verified Google Customer Reviews</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#10b981' }}>100%</div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>Dispatch &amp; Packing Video Proof</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#111827' }}>50+</div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>Exclusive Luxury Brand Replicas</div>
          </div>
        </div>

        {/* CTA */}
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
            Explore Master Collection <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
