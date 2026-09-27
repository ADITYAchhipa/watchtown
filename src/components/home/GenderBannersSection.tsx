'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PromoSlide {
  id: number;
  badge: string;
  title1: string;
  title2: string;
  subtitle: string;
  btnText: string;
  link: string;
  image: string;
  alt: string;
  bgGradient: string;
  accentColor: string;
}

const SLIDES: PromoSlide[] = [
  {
    id: 1,
    badge: '7AAA MASTER REPLICA EDITION',
    title1: 'WATCHES',
    title2: "FOR MEN'S",
    subtitle: 'Explore India’s most trusted collection of Swiss-crafted luxury timepieces from Rolex, AP, Patek Philippe & more.',
    btnText: 'SHOP MEN’S COLLECTION',
    link: '/shop?category=Men%27s+Watches',
    image: '/images/slider/mens-rolex.png',
    alt: "Watches For Men's Collection",
    bgGradient: 'radial-gradient(ellipse at 80% 50%, #1e1e1e 0%, #0c0c0c 50%, #000000 100%)',
    accentColor: '#ffee00',
  },
  {
    id: 2,
    badge: 'TIMELESS LUXURY & ELEGANCE',
    title1: 'WATCHES',
    title2: "FOR WOMEN'S",
    subtitle: 'Sophisticated dials, rose gold finishes, and diamond-accented timepieces designed for the modern woman.',
    btnText: 'SHOP WOMEN’S COLLECTION',
    link: '/shop?category=Women%27s+Watches',
    image: '/images/slider/womens-luxury.png',
    alt: "Watches For Women's Collection",
    bgGradient: 'radial-gradient(ellipse at 80% 50%, #201a14 0%, #0f0c08 50%, #000000 100%)',
    accentColor: '#ffd700',
  },
  {
    id: 3,
    badge: 'SWISS SELF-WINDING CALIBRE',
    title1: 'AUTOMATIC',
    title2: '& SKELETON',
    subtitle: 'Mechanical masterpieces featuring exposed skeleton gears, open-heart rotors, and seamless sweep seconds.',
    btnText: 'EXPLORE AUTOMATICS',
    link: '/shop?type=automatic-watches',
    image: '/images/slider/automatic-skeleton.png',
    alt: 'Automatic Skeleton Watches',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, #171f28 0%, #0b1016 50%, #000000 100%)',
    accentColor: '#00e5ff',
  },
  {
    id: 4,
    badge: 'ICONIC LUXURY HOROLOGY',
    title1: 'ROLEX',
    title2: 'MASTER EDITIONS',
    subtitle: 'Submariner, Daytona, Datejust 41 & GMT-Master II crafted with exact weight, ceramic bezels, and 904L steel.',
    btnText: 'SHOP ROLEX TIMEPIECES',
    link: '/shop?brand=Rolex',
    image: '/images/slider/rolex-master.png',
    alt: 'Rolex Luxury Editions',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, #102316 0%, #08120b 50%, #000000 100%)',
    accentColor: '#00e676',
  },
  {
    id: 5,
    badge: 'HIGH PERFORMANCE TIMEKEEPING',
    title1: 'CHRONOGRAPH',
    title2: '& SPORT EDITIONS',
    subtitle: 'Rugged luxury chronometers with triple sub-dials, tachymeter bezels, and motorsport-inspired aesthetics.',
    btnText: 'SHOP CHRONOGRAPHS',
    link: '/shop?type=chronograph-watches',
    image: '/images/slider/chronograph-sport.png',
    alt: 'Chronograph Sport Watches',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, #241818 0%, #120a0a 50%, #000000 100%)',
    accentColor: '#ff5252',
  },
];

export function GenderBannersSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch swipe support
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
    <div className="wt-single-promo-slider-section">
      <section
        className="wt-single-carousel-wrapper"
        aria-label="Featured Promo Banner Carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="wt-single-carousel-container">
          {/* Slides Track */}
          <div className="wt-single-track-overflow">
            <div
              className="wt-single-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {SLIDES.map((slide, idx) => (
                <div key={slide.id} className="wt-single-slide-item">
                  <div
                    className="wt-single-banner-card"
                    style={{ background: slide.bgGradient }}
                  >
                    {/* Left Content Area */}
                    <div className="wt-single-banner-content">
                      <div className="wt-single-badge">
                        <span className="wt-single-badge-dot" style={{ backgroundColor: slide.accentColor }} />
                        <span>{slide.badge}</span>
                      </div>

                      <h2 className="wt-single-banner-title">
                        <span className="wt-title-line-1">{slide.title1}</span>
                        <span className="wt-title-line-2">{slide.title2}</span>
                      </h2>

                      <p className="wt-single-banner-desc">{slide.subtitle}</p>

                      <Link
                        href={slide.link}
                        className="wt-single-banner-btn"
                        aria-label={`${slide.btnText}`}
                      >
                        <span>{slide.btnText}</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>

                    {/* Right Image Showcase */}
                    <div className="wt-single-banner-visual">
                      <div
                        className="wt-single-visual-glow"
                        style={{
                          background: `radial-gradient(circle, ${slide.accentColor}55 0%, ${slide.accentColor}18 50%, transparent 75%)`,
                        }}
                      />
                      <div className="wt-single-image-frame">
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          className="wt-single-watch-img wt-animated-watch"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          width={340}
                          height={340}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
