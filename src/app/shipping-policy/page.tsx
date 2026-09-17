import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy | WatchTown India',
  description: 'Learn about our express shipping timelines, courier partners (BlueDart, Delhivery), live packaging video proof, and COD guidelines.',
};

export default function ShippingPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Shipping Policy</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
          Shipping &amp; Delivery Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 36 }}>
          Last Updated: March 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, color: '#374151', fontSize: 15, lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              1. Free Express Pan-India Shipping
            </h2>
            <p>
              WatchTown provides Free Express Delivery on all orders over ₹1,500 across India. For orders below ₹1,500, a standard handling fee of ₹99 applies. We partner with tier-1 air logistics providers including <strong>BlueDart, Delhivery, DTDC, and XpressBees</strong> to ensure rapid, secure transit.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              2. Processing &amp; Dispatch Timeline
            </h2>
            <p>
              Every timepiece undergoes a rigorous 5-point quality inspection (timekeeping accuracy, bezel alignment, date magnification, crown lock, and casing condition) prior to sealing. Orders placed before 3:00 PM IST are processed and dispatched within <strong>24 to 48 business hours</strong>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              3. Estimated Delivery Timelines
            </h2>
            <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
              <li><strong>Metro Cities (Mumbai, Delhi-NCR, Bangalore, Hyderabad, Chennai, Kolkata):</strong> 2 to 3 business days.</li>
              <li><strong>Tier-2 &amp; Tier-3 Cities:</strong> 3 to 5 business days.</li>
              <li><strong>Remote &amp; North-Eastern Regions:</strong> 5 to 7 business days.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              4. Live Video Proof &amp; Real-Time Tracking
            </h2>
            <p>
              To maintain complete transparency, our packaging team records an HD video proof of your specific watch being inspected and sealed in tamper-evident security packaging. As soon as the courier scans your package, an SMS and WhatsApp notification containing your <strong>AWB Tracking Number</strong> will be sent to your registered mobile number.
            </p>
            <p style={{ marginTop: 8 }}>
              You can track your shipment anytime via our <Link href="/track-order" style={{ color: '#d4af37', fontWeight: 600 }}>Live Tracking Portal</Link>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              5. Cash on Delivery (COD) Guidelines
            </h2>
            <p>
              For Cash on Delivery orders, our dispatch team may make a quick telephonic confirmation call to verify your shipping address and availability. Please ensure someone is present at the shipping address to receive the parcel and make payment to the delivery executive.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
