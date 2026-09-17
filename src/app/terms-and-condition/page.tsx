import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms and Conditions | WatchTown India',
  description: 'Terms of service, purchasing rules, warranty limitations, and legal notices governing your use of WatchTown.',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Terms &amp; Conditions</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
          Terms and Conditions
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 36 }}>
          Last Updated: March 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, color: '#374151', fontSize: 15, lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              1. Overview &amp; Replica Nature of Products
            </h2>
            <p>
              Welcome to WatchTown. All products showcased and sold on this platform are homage, inspired, and 7AA master replica timepieces intended for personal horological appreciation, styling, and recreation. WatchTown is an independent boutique and is not an authorized distributor or affiliate of original trademark holders (including Rolex, Patek Philippe, Audemars Piguet, Omega, or other referenced brands).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              2. Order Acceptance &amp; Price Integrity
            </h2>
            <p>
              Placing an order constitutes an offer to purchase. WatchTown reserves the right to accept or cancel orders in cases of pricing typographical errors, inventory stockouts, or fraudulent payment indicators. If an order is cancelled following payment, a prompt refund will be issued via the original payment source.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              3. Cash on Delivery Commitment
            </h2>
            <p>
              Customers selecting Cash on Delivery (COD) agree that placing an order represents a genuine commitment to receive and pay for the parcel. Deliberate refusal of confirmed shipments incurs substantial reverse logistics and packing costs, and repeat offenders will have their mobile numbers barred across courier networks.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              4. Limitation of Liability
            </h2>
            <p>
              WatchTown shall not be held liable for any indirect, incidental, or consequential damages arising from the use of products purchased on this site. Our maximum liability is strictly limited to the purchase price paid for the specific item in dispute.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              5. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These terms are governed by and construed in accordance with the laws of the Republic of India. Any legal proceedings or disputes arising shall fall under the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
