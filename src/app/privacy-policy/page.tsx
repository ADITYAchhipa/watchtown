import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | WatchTown India',
  description: 'Understand how WatchTown collects, protects, and handles your personal information, shipping data, and cookies.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Privacy Policy</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 36 }}>
          Last Updated: March 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, color: '#374151', fontSize: 15, lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              1. Information We Collect
            </h2>
            <p>
              When you place an order or interact with WatchTown, we collect personal information necessary to process and dispatch your timepieces:
            </p>
            <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
              <li>Full Name, Contact Mobile Number, and Email Address.</li>
              <li>Shipping Destination Address (Street, City, State, and Postal PIN Code).</li>
              <li>IP Address, device type, and browser session cookies for shopping cart persistence.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              2. How Your Data is Used
            </h2>
            <p>
              Your personal information is utilized strictly for order fulfillment, dispatch updates via SMS and WhatsApp, delivery coordination with courier executives, and customer service inquiries. We do not sell, lease, or rent customer records to third-party marketing companies.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              3. Data Security &amp; Encryption
            </h2>
            <p>
              Our storefront utilizes 256-bit SSL encryption across all browsing sessions and checkout pipelines. Customer passwords and sessions are hashed using salted cryptographic PBKDF2 algorithms, ensuring that credentials cannot be decrypted in plain text.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              4. Cookies &amp; Local Storage
            </h2>
            <p>
              We utilize temporary session cookies and local storage to preserve your shopping cart contents and wishlist selections across browser reloads. You can disable cookies in your browser settings, though doing so may reset your cart upon leaving the page.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              5. Contacting the Data Protection Officer
            </h2>
            <p>
              If you wish to view, update, or request the deletion of your customer records, please email <strong>privacy@watchtown.in</strong> or WhatsApp us at <strong>(+91) 9763642094</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
