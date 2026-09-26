import React from 'react';
import Link from 'next/link';

export function GenderBannersSection() {
  return (
    <div className="elementor-element e-con-full e-flex e-con e-child wt-gender-banners-elementor-wrap">
      <div className="wt-gender-banners-section" aria-label="Shop By Gender">
        <div className="wt-gender-banners-container">
          {/* Men's Watch Banner */}
          <Link
            href="/shop?category=Men%27s+Watches"
            className="wt-gender-card wt-gender-card-men"
            aria-label="Shop Watches For Men's"
          >
            <div className="wt-gender-card-content">
              <h2 className="wt-gender-card-title">
                <span>WATCHES</span>
                <span>FOR MEN’S</span>
              </h2>
              <span className="wt-gender-btn">
                SHOP NOW
              </span>
            </div>
            <div className="wt-gender-card-image-wrap">
              <img
                src="/images/mens-watch-banner.jpg"
                alt="Watches For Men's"
                className="wt-gender-watch-img"
                loading="lazy"
                width={300}
                height={300}
              />
            </div>
          </Link>

          {/* Women's Watch Banner */}
          <Link
            href="/shop?category=Women%27s+Watches"
            className="wt-gender-card wt-gender-card-women"
            aria-label="Shop Watches For Women's"
          >
            <div className="wt-gender-card-content">
              <h2 className="wt-gender-card-title">
                <span>WATCHES</span>
                <span>FOR WOMEN’S</span>
              </h2>
              <span className="wt-gender-btn">
                SHOP NOW
              </span>
            </div>
            <div className="wt-gender-card-image-wrap">
              <img
                src="/images/womens-watch-banner.jpg"
                alt="Watches For Women's"
                className="wt-gender-watch-img"
                loading="lazy"
                width={300}
                height={300}
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
