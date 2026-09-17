'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Quality & Craftsmanship',
    q: 'What does "7AA Master Quality" mean?',
    a: '7AA is the highest echelon of luxury replica watch manufacturing. Unlike lower-tier market copies, 7AA watches feature exact 1:1 case dimensions, authentic weight, sapphire crystal glass, precise ceramic bezels, and high-beat Japanese or Swiss-clone automatic movements that sweep seamlessly.',
  },
  {
    category: 'Quality & Craftsmanship',
    q: 'Are all chronographs and sub-dials functional?',
    a: 'Yes! Every sub-dial, chronograph push-button, date magnifier, and complications on our 7AA timepieces are fully functional and calibrated prior to dispatch.',
  },
  {
    category: 'Quality & Craftsmanship',
    q: 'Are the watches waterproof?',
    a: 'Our watches feature water-resistant gaskets rated for daily wear (sweat, light rain, hand-washing). However, we strongly recommend against swimming or submerging luxury replica timepieces to protect movement longevity.',
  },
  {
    category: 'Shipping & Delivery',
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes! Cash on Delivery is available across 19,000+ postal PIN codes in India. You can inspect the sealed courier package and pay the delivery courier in cash or via UPI at your doorstep.',
  },
  {
    category: 'Shipping & Delivery',
    q: 'How long does delivery take?',
    a: 'Orders are dispatched within 24 to 48 hours following thorough physical & mechanical inspection. Metro cities typically receive delivery in 2-3 business days, and all other Indian locations in 3-5 business days via BlueDart, Delhivery, or DTDC Express.',
  },
  {
    category: 'Shipping & Delivery',
    q: 'Will I receive dispatch proof and tracking details?',
    a: 'Absolutely! As soon as your watch is packaged, we share a live packaging video proof along with the courier AWB tracking number via WhatsApp and SMS.',
  },
  {
    category: 'Returns & Replacement',
    q: 'What is your 7-Day Replacement Policy?',
    a: 'If your watch arrives damaged in transit or encounters a mechanical defect, we provide an immediate 7-day doorstep replacement. Simply share a short unboxing video with our WhatsApp concierge, and we will arrange a reverse courier pickup and dispatch a brand-new unit.',
  },
  {
    category: 'Returns & Replacement',
    q: 'Does the watch come with a warranty box?',
    a: 'Every WatchTown timepiece arrives safely packed in our signature rigid luxury collector box with foam cushioning, watch pillow, and warranty certificate card.',
  },
];

export default function FaqPage() {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 3]);

  const toggleAccordion = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '50px 20px 80px 20px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link> &rsaquo; <span>Frequently Asked Questions</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Help &amp; Answers
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '8px 0 12px 0' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: '#4b5563', fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
            Got questions about 7AA quality, Cash on Delivery, or tracking? Find answers below or chat with us.
          </p>
        </div>

        {/* Accordions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isOpen ? '#f3f4f6' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', paddingRight: 16 }}>
                    {faq.q}
                  </span>
                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      color: '#6b7280',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px 24px', color: '#4b5563', fontSize: 14, lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div
          style={{
            marginTop: 48,
            background: 'linear-gradient(135deg, #1f2636, #0b0d11)',
            color: '#ffffff',
            borderRadius: 16,
            padding: '36px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#d4af37', margin: '0 0 8px 0' }}>
            Still have a question in mind?
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 440, margin: '0 auto 20px auto' }}>
            Our watch consultants are available on WhatsApp 24/7 to provide video demonstrations and answer any doubts.
          </p>
          <a
            href="https://wa.me/919763642094?text=Hi%20WatchTown,%20I%20have%20a%20question%20about%20your%20watches"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#25D366',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: 30,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Chat with Concierge &rarr;
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
