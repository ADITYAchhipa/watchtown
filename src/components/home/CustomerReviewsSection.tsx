'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  ShieldCheck,
  Eye,
  X,
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

interface CustomerReviewsSectionProps {
  initialReviews?: WhatsAppReview[];
}

export function CustomerReviewsSection({ initialReviews }: CustomerReviewsSectionProps = {}) {
  const [reviews, setReviews] = useState<WhatsAppReview[]>(initialReviews && initialReviews.length > 0 ? initialReviews : REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error('Failed to fetch reviews on home:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  const totalReviews = reviews.length;

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
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    flex: `0 0 calc(${100 / visibleCount}% - ${(18 * (visibleCount - 1)) / visibleCount}px)`,
                    minWidth: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Whole Screenshot Card (No template) */}
                  <div
                    className="wt-review-card"
                    onClick={() => setLightboxImage(rev.watchImage)}
                    style={{
                      background: '#121b22',
                      border: '1px solid #233138',
                      borderRadius: 16,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      height: 520,
                      position: 'relative',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                      cursor: 'pointer',
                    }}
                    title="Click to view full screenshot"
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: '#070b0e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={rev.watchImage}
                        alt={rev.watchModel || 'Customer Review'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                        loading="lazy"
                      />

                      {/* View Full Hint Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'rgba(0, 0, 0, 0.72)',
                          backdropFilter: 'blur(6px)',
                          color: '#ffffff',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '5px 11px',
                          borderRadius: 20,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          pointerEvents: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        }}
                      >
                        <Eye size={13} style={{ color: '#f3ce5e' }} />
                        <span>View Full</span>
                      </div>

                      {/* Optional Bottom Caption Banner */}
                      {rev.watchModel && rev.watchModel !== 'test' && rev.watchModel !== 'Luxury Timepiece' && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
                            padding: '24px 14px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            pointerEvents: 'none',
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: '#f3ce5e', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rev.watchModel}
                            </div>
                            {rev.replyMessage && rev.replyMessage !== 'test' && (
                              <div style={{ color: '#cbd5e1', fontSize: 11, marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {rev.replyMessage}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              color: '#94a3b8',
                              background: 'rgba(255,255,255,0.1)',
                              padding: '2px 8px',
                              borderRadius: 12,
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              marginLeft: 8,
                            }}
                          >
                            {rev.dateStr}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal for Full View */}
      {lightboxImage && (
        <div
          className="wt-reviews-lightbox"
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.94)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#ffffff',
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            title="Close Full Screenshot View"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxImage}
            alt="Customer Review Screenshot Full View"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: '92vh',
              maxWidth: '92vw',
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9)',
            }}
          />
        </div>
      )}
    </section>
  );
}
