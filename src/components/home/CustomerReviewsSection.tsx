'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  Star,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface WhatsAppReview {
  id: number;
  phone: string;
  avatarColor: string;
  avatarInitial: string;
  dateStr: string;
  watchModel: string;
  watchImage: string;
  userMessages: string[];
  adminMessages: string[];
  replyMessage: string;
  time: string;
  reaction: string;
}

const REVIEWS: WhatsAppReview[] = [
  {
    id: 1,
    phone: '+91 94*** 79360',
    avatarColor: '#5c2d91',
    avatarInitial: 'R',
    dateStr: '24 October 2025',
    watchModel: 'Audemars Piguet Royal Oak Skeleton',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-watches.png',
    userMessages: ['I want it ... Delivery timing ??'],
    adminMessages: ['First let this AP get delivered 👍', '4-5 days'],
    replyMessage: 'Received 🔥 Watch is insane bro! Skeleton movement is working smoothly & weight is heavy!',
    time: '12:45 pm',
    reaction: '❤️',
  },
  {
    id: 2,
    phone: '+91 78*** 21451',
    avatarColor: '#0078d4',
    avatarInitial: 'M',
    dateStr: '28 October 2025',
    watchModel: 'Rolex Daytona Cosmograph Chrono',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/rolex-luxury-watch.png',
    userMessages: ['Can you please send dispatch details?'],
    adminMessages: ['Shared tracking via SMS. Please drop review with photo!'],
    replyMessage: 'Absolutely love this watch! The design is sleek, the build feels premium, and it looks even better in person. 100% worth the buy!',
    time: '2:15 pm',
    reaction: '❤️',
  },
  {
    id: 3,
    phone: '+91 97*** 44314',
    avatarColor: '#0f7b0f',
    avatarInitial: 'S',
    dateStr: '2 November 2025',
    watchModel: 'Rolex Datejust 41 Mint Green Box Set',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/rolex-brand-watches.png',
    userMessages: ['Parcel delivered today morning.'],
    adminMessages: ['Can you please drop a review with received product picture? Appreciate your efforts ❤️'],
    replyMessage: 'Bhot vdiaa quality hai 👌 We are satisfy. Green dial color exact original matching!',
    time: '7:37 pm',
    reaction: '❤️',
  },
  {
    id: 4,
    phone: '+91 70*** 18919',
    avatarColor: '#b4009e',
    avatarInitial: 'A',
    dateStr: '15 November 2025',
    watchModel: 'Patek Philippe Nautilus Blue 5711',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-watches.png',
    userMessages: ['Send tracking link please.'],
    adminMessages: ['Delivered via BlueDart. Enjoy your new timepiece!'],
    replyMessage: 'Hey i recieved the parcel totally happy and satisfied thank you so much ❤️ Glass & finish 10/10!',
    time: '6:07 pm',
    reaction: '❤️',
  },
  {
    id: 5,
    phone: '+91 98*** 55102',
    avatarColor: '#d83b01',
    avatarInitial: 'V',
    dateStr: '20 November 2025',
    watchModel: 'Rolex Submariner Hulk Ceramic Bezel',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/rolex-brand-watches.png',
    userMessages: ['Bhai order deliver ho gaya.'],
    adminMessages: ['Awesome! How is the ceramic bezel and winding movement?'],
    replyMessage: 'Quality is top notch! Weight bilkul original jaisa heavy hai. Ceramic bezel shine is brilliant! Thanks for fast dispatch ❤️',
    time: '3:40 pm',
    reaction: '🔥',
  },
  {
    id: 6,
    phone: '+91 88*** 92430',
    avatarColor: '#008272',
    avatarInitial: 'K',
    dateStr: '29 November 2025',
    watchModel: 'Cartier Santos Two-Tone Rose Gold',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-women-watch.png',
    userMessages: ['Received the luxury box set today.'],
    adminMessages: ['Hope your fiancé loved the anniversary gift!'],
    replyMessage: 'Gifted this to my fiancé, she was surprised by the finishing and sapphire glass. Beautiful packaging! Will definitely buy again.',
    time: '8:20 pm',
    reaction: '❤️',
  },
  {
    id: 7,
    phone: '+91 91*** 63219',
    avatarColor: '#107c41',
    avatarInitial: 'D',
    dateStr: '5 December 2025',
    watchModel: 'Hublot Classic Fusion Titanium 42mm',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/automatic-luxury-watch.png',
    userMessages: ['Got it safely in Mumbai.'],
    adminMessages: ['Thank you! Let us know if you need any adjustments.'],
    replyMessage: 'Received via COD in Mumbai in 48 hours. Rubber strap quality and case polish is 10/10. Genuine seller 👏',
    time: '1:15 pm',
    reaction: '👍',
  },
  {
    id: 8,
    phone: '+91 99*** 11845',
    avatarColor: '#c239b3',
    avatarInitial: 'T',
    dateStr: '12 December 2025',
    watchModel: 'Tissot PRX Powermatic 80 Ice Blue',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/quartz-luxury-watches.png',
    userMessages: ['Checked the automatic rotor movement.'],
    adminMessages: ['Glad to hear! Keep enjoying the timepiece!'],
    replyMessage: 'Waffle dial texture is crisp and automatic rotor sweep is super smooth. Best price in India for 7AAA master quality.',
    time: '4:50 pm',
    reaction: '❤️',
  },
  {
    id: 9,
    phone: '+91 95*** 88372',
    avatarColor: '#004e8c',
    avatarInitial: 'H',
    dateStr: '18 December 2025',
    watchModel: 'Tag Heuer Aquaracer Chrono White Dial',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg',
    userMessages: ['Package delivered with security tape intact.'],
    adminMessages: ['Tested every chronograph function before dispatch!'],
    replyMessage: 'Chronograph buttons and sub-dials are working perfectly. Security sealed box was delivered safely by BlueDart.',
    time: '5:30 pm',
    reaction: '🔥',
  },
  {
    id: 10,
    phone: '+91 80*** 76214',
    avatarColor: '#8e562e',
    avatarInitial: 'P',
    dateStr: '24 December 2025',
    watchModel: 'Omega Speedmaster Professional Moonwatch',
    watchImage: 'https://watchtown.in/wp-content/uploads/2025/04/luxury-watches-brands.png',
    userMessages: ['This is my 2nd purchase from you guys.'],
    adminMessages: ['Thank you for being a regular collector with WatchTown!'],
    replyMessage: 'Second order from WatchTown! Trusted store for first copy watches. Live video dispatch proof gives 100% confidence. Keep up the good work!',
    time: '9:10 pm',
    reaction: '❤️',
  },
];

export function CustomerReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const totalReviews = REVIEWS.length;

  // Responsive items visible
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 992) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, totalReviews - visibleCount);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay timer every 1.5s (1500ms) as requested
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 1500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section
      className="wt-customer-reviews-section"
      id="customer-reviews"
      aria-label="Customer Reviews"
      style={{
        padding: '60px 0 70px 0',
        background: '#0d1117',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.12) 0%, rgba(13, 17, 23, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container" style={{ maxWidth: 1360, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#f3ce5e',
              fontSize: 12,
              fontWeight: 700,
              padding: '5px 14px',
              borderRadius: 20,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            <ShieldCheck size={14} style={{ color: '#f3ce5e' }} /> 100% Genuine WhatsApp Testimonials
          </div>

          <h2
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 10px 0',
              fontFamily: 'var(--font-urbanist), sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            Customer Reviews
          </h2>

          <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 660, margin: '0 auto', lineHeight: 1.5 }}>
            Real delivery proofs, unboxing pictures, and verified chats from our 10,000+ satisfied buyers across India.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Reviews"
            className="wt-reviews-nav-btn wt-reviews-nav-prev"
            style={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(17, 24, 39, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Reviews"
            className="wt-reviews-nav-btn wt-reviews-nav-next"
            style={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(17, 24, 39, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Overflow Track */}
          <div style={{ overflow: 'hidden', borderRadius: 18, padding: '6px 2px' }}>
            <div
              style={{
                display: 'flex',
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                gap: 18,
              }}
            >
              {REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    flex: `0 0 calc(${100 / visibleCount}% - ${(18 * (visibleCount - 1)) / visibleCount}px)`,
                    minWidth: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* WhatsApp Screenshot Card */}
                  <div
                    className="wt-whatsapp-card"
                    style={{
                      background: '#121b22',
                      border: '1px solid #233138',
                      borderRadius: 18,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      height: 480,
                      position: 'relative',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    {/* Watermark Diagonal Banner */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 240,
                        left: -50,
                        width: '140%',
                        transform: 'rotate(-28deg)',
                        background: 'rgba(0, 0, 0, 0.85)',
                        borderTop: '1.5px solid #d4af37',
                        borderBottom: '1.5px solid #d4af37',
                        color: '#ffee00',
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 1.5,
                        textAlign: 'center',
                        padding: '4px 0',
                        zIndex: 4,
                        pointerEvents: 'none',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
                      }}
                    >
                      watchtown.in &bull; watchtown.in &bull; watchtown.in
                    </div>

                    {/* WhatsApp Header */}
                    <div
                      style={{
                        background: '#1f2c34',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #2a3942',
                        zIndex: 2,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowLeft size={16} color="#aebac1" />
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: rev.avatarColor,
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {rev.avatarInitial}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#e9edef' }}>
                            {rev.phone}
                          </div>
                          <div style={{ fontSize: 10, color: '#8696a0' }}>online</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#aebac1' }}>
                        <Video size={16} />
                        <Phone size={15} />
                        <MoreVertical size={16} />
                      </div>
                    </div>

                    {/* Chat Wallpaper & Bubbles Area */}
                    <div
                      style={{
                        flex: 1,
                        padding: '14px 10px',
                        background: '#0b141a',
                        backgroundImage: 'radial-gradient(circle, #182229 10%, transparent 11%)',
                        backgroundSize: '16px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Date Bubble */}
                      <div style={{ textAlign: 'center', marginBottom: 8 }}>
                        <span
                          style={{
                            background: '#182229',
                            color: '#8696a0',
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: 6,
                            display: 'inline-block',
                          }}
                        >
                          {rev.dateStr}
                        </span>
                      </div>

                      {/* Messages Flow */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 3 }}>
                        {/* Admin Message */}
                        {rev.adminMessages.map((msg, i) => (
                          <div
                            key={i}
                            style={{
                              alignSelf: 'flex-end',
                              background: '#005c4b',
                              color: '#e9edef',
                              borderRadius: '8px 8px 0px 8px',
                              padding: '6px 10px',
                              maxWidth: '85%',
                              fontSize: 12,
                              lineHeight: 1.4,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            }}
                          >
                            <p style={{ margin: 0 }}>{msg}</p>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 3,
                                fontSize: 9,
                                color: 'rgba(255,255,255,0.6)',
                                marginTop: 2,
                              }}
                            >
                              <span>12:41 pm</span>
                              <CheckCheck size={13} color="#53bdeb" />
                            </div>
                          </div>
                        ))}

                        {/* Customer Image Showcase Card inside bubble */}
                        <div
                          style={{
                            alignSelf: 'flex-start',
                            background: '#202c33',
                            borderRadius: '8px 8px 8px 0px',
                            padding: 6,
                            maxWidth: '92%',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          }}
                        >
                          <div
                            style={{
                              borderRadius: 6,
                              overflow: 'hidden',
                              background: '#111b21',
                              height: 140,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={rev.watchImage}
                              alt={rev.watchModel}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                padding: 6,
                              }}
                              loading="lazy"
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: 4,
                                right: 6,
                                background: 'rgba(0,0,0,0.7)',
                                color: '#ffffff',
                                fontSize: 9,
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              Photo • 1.2 MB
                            </span>
                          </div>

                          {/* Customer Review Text */}
                          <div style={{ padding: '6px 4px 2px 4px' }}>
                            <p
                              style={{
                                color: '#e9edef',
                                fontSize: 12,
                                lineHeight: 1.4,
                                margin: '0 0 4px 0',
                                fontWeight: 500,
                              }}
                            >
                              {rev.replyMessage}
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: 9,
                                color: '#8696a0',
                              }}
                            >
                              <span style={{ color: '#d4af37', fontWeight: 600 }}>
                                {rev.watchModel}
                              </span>
                              <span>{rev.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reaction / Heart Bubble */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#1f2c34',
                          border: '1px solid #2a3942',
                          borderRadius: 20,
                          padding: '4px 10px',
                          alignSelf: 'flex-start',
                          marginTop: 6,
                          fontSize: 11,
                          color: '#e9edef',
                          zIndex: 3,
                        }}
                      >
                        <span>WatchTown</span>
                        <span>{rev.reaction}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 24,
            }}
          >
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: currentIndex === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentIndex === idx ? '#d4af37' : 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Proof Video Link Banner */}
        <div
          style={{
            marginTop: 40,
            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, rgba(37, 211, 102, 0.1) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: 14,
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                Want to see live dispatch video of your watch before courier pickup?
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Join our official WhatsApp group for daily live packaging and unboxing clips.
              </div>
            </div>
          </div>

          <a
            href="https://chat.whatsapp.com/EqFzIkN7VAk4sEipabrqEU"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              padding: '10px 22px',
              borderRadius: 25,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
              transition: 'transform 0.2s ease',
            }}
          >
            <span>Join WhatsApp Community</span> &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
