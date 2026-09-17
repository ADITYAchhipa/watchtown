import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund and Returns Policy | WatchTown India',
  description: 'Understand our 7-day hassle-free replacement policy, unboxing video guidelines, and warranty claim procedures.',
};

export default function RefundReturnsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Refund &amp; Returns Policy</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
          Refund &amp; Returns Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 36 }}>
          Last Updated: March 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, color: '#374151', fontSize: 15, lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              1. 7-Day Replacement Guarantee
            </h2>
            <p>
              At WatchTown, we stand behind the craftsmanship of every 7AA timepiece we dispatch. If you receive a product that has been damaged in transit, possesses a manufacturing defect, or differs from what you ordered, you are eligible for an immediate <strong>doorstep replacement within 7 calendar days</strong> from the date of delivery.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              2. Mandatory Unboxing Video Requirement
            </h2>
            <p>
              To protect both our valued customers and our logistics chain against fraudulent claims, an <strong>unboxing video is mandatory</strong> for any transit damage or missing item claims:
            </p>
            <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
              <li>The video must begin from showing all 4 sides of the unopened, sealed courier flyer.</li>
              <li>The shipping label and tracking AWB barcode must be clearly visible.</li>
              <li>The video must be recorded in one continuous single cut without pauses or edits.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              3. Reverse Pickup &amp; Replacement Procedure
            </h2>
            <p>
              Once your unboxing video is verified by our customer concierge team via WhatsApp, we will:
            </p>
            <ol style={{ paddingLeft: 20, margin: '10px 0' }}>
              <li>Schedule a free reverse courier pickup from your delivery address.</li>
              <li>Simultaneously inspect and test a brand-new replacement watch.</li>
              <li>Dispatch the fresh unit via express courier with real-time tracking.</li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              4. Non-Returnable Conditions
            </h2>
            <p>
              Returns or replacements cannot be accepted under the following conditions:
            </p>
            <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
              <li>Watches where protective plastic film or tags have been removed.</li>
              <li>Watches altered by a local third-party technician or sized by removing links.</li>
              <li>Damage resulting from accidental dropping, water immersion, or rough handling.</li>
              <li>Claims raised after the 7-day delivery window has expired.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              5. How to Initiate a Replacement
            </h2>
            <p>
              Simply send a WhatsApp message to our concierge at <strong>(+91) 9763642094</strong> along with your Order Number (e.g. WT-849201) and unboxing clip. Our team responds within 2 hours during business hours.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
