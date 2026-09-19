'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';

export function PageInteractions() {
  const { totalCount: cartCount, subtotal, setIsCartOpen } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.role === 'admin') setIsAdmin(true);
      })
      .catch(err => console.error('Auth check failed', err));
  }, []);

  // 1. Synchronize dynamic cart and wishlist counts across header & mobile bars
  useEffect(() => {
    // Cart count (Amazon / modern app floating count badge)
    const cartBadgeEls = document.querySelectorAll('.wd-cart-badge, .wd-header-cart .wd-cart-number, .wd-header-cart .wd-tools-count');
    cartBadgeEls.forEach((el) => {
      el.textContent = `${cartCount}`;
    });

    // Cart subtotal
    const cartSubtotalEls = document.querySelectorAll('.wd-cart-subtotal .woocommerce-Price-amount bdi');
    cartSubtotalEls.forEach((el) => {
      el.innerHTML = `<span class="woocommerce-Price-currencySymbol">&#8377;</span>${subtotal.toLocaleString('en-IN')}.00`;
    });

    // Wishlist count
    const wishlistEls = document.querySelectorAll('.wd-header-wishlist .wd-tools-text, .wd-header-wishlist');
    wishlistEls.forEach((el) => {
      const existingBadge = el.querySelector('.watchtown-wishlist-badge');
      if (wishlistCount > 0) {
        if (!existingBadge) {
          const badge = document.createElement('span');
          badge.className = 'watchtown-wishlist-badge';
          badge.style.cssText =
            'background:#d4af37;color:#0b0d11;font-size:10px;font-weight:800;border-radius:10px;padding:1px 6px;margin-left:4px;display:inline-block;';
          badge.textContent = `${wishlistCount}`;
          el.appendChild(badge);
        } else {
          existingBadge.textContent = `${wishlistCount}`;
        }
      } else if (existingBadge) {
        existingBadge.remove();
      }
    });
  }, [cartCount, subtotal, wishlistCount]);

  // 2. Main DOM event listeners, drawers, live search, and link routing
  useEffect(() => {
    // -------------------------------------------------------------
    // Mobile Drawer Triggers
    // -------------------------------------------------------------
    const mobileOpeners = document.querySelectorAll(
      '.whb-wd-header-mobile-nav a, .wd-header-mobile-nav a, [data-mobile-menu-trigger]'
    );
    const mobileNav = document.querySelector('.mobile-nav') as HTMLElement | null;
    const cartOpeners = document.querySelectorAll('.cart-widget-opener a, .wd-header-cart a');
    const closeSide = document.querySelector('.wd-close-side') as HTMLElement | null;
    const closeButtons = document.querySelectorAll('.close-side-widget a, .close-side-widget');

    const openDrawer = (drawer: HTMLElement | null) => {
      if (!drawer) return;
      drawer.classList.add('wd-opened');
      if (closeSide) {
        closeSide.classList.add('wd-close-side-opened');
      }
      document.body.classList.add('wd-side-opened');
    };

    const closeAllDrawers = () => {
      if (mobileNav) mobileNav.classList.remove('wd-opened');
      if (closeSide) closeSide.classList.remove('wd-close-side-opened');
      document.body.classList.remove('wd-side-opened');
    };

    mobileOpeners.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer(mobileNav);
      });
    });

    cartOpeners.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setIsCartOpen(true);
      });
    });

    closeButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllDrawers();
      });
    });

    if (closeSide) {
      closeSide.addEventListener('click', () => {
        closeAllDrawers();
      });
    }

    // -------------------------------------------------------------
    // Live Search Autocomplete & Submit Interceptor
    // -------------------------------------------------------------
    const searchForms = document.querySelectorAll<HTMLFormElement>('form.searchform, .wd-search-form form');

    searchForms.forEach((form) => {
      const input = form.querySelector('input.s') as HTMLInputElement | null;
      const resultsWrapper = form.parentElement?.querySelector('.search-results-wrapper') as HTMLElement | null;
      const dropdownResults = form.parentElement?.querySelector('.wd-dropdown-results') as HTMLElement | null;
      const scrollContent = form.parentElement?.querySelector('.wd-scroll-content') as HTMLElement | null;

      if (!input) return;

      // Prevent native external action submission
      form.onsubmit = (e) => {
        e.preventDefault();
        const val = input.value.trim();
        if (val) {
          if (dropdownResults) dropdownResults.style.display = 'none';
          closeAllDrawers();
          router.push(`/shop?search=${encodeURIComponent(val)}`);
        }
      };

      // Live autocomplete input listener
      input.addEventListener('input', () => {
        const query = input.value.trim();
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!query || query.length < 2) {
          if (dropdownResults) dropdownResults.style.display = 'none';
          if (scrollContent) scrollContent.innerHTML = '';
          return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
          try {
            const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
            const data = await res.json();
            const products: Product[] = data.products || [];

            if (!scrollContent || !dropdownResults) return;

            if (products.length === 0) {
              const noResultDiv = document.createElement('div');
              noResultDiv.style.cssText = 'padding: 16px; text-align: center; color: #6b7280; font-size: 13px;';
              noResultDiv.textContent = `No matching watches found for "${query}"`;
              scrollContent.innerHTML = '';
              scrollContent.appendChild(noResultDiv);
              dropdownResults.style.display = 'block';
              return;
            }

            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'background:#ffffff; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.15); overflow:hidden; border:1px solid #e5e7eb;';
            
            const header = document.createElement('div');
            header.style.cssText = 'padding:10px 14px; background:#f9fafb; border-bottom:1px solid #e5e7eb; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase;';
            header.textContent = `Matching Timepieces (${products.length})`;
            wrapper.appendChild(header);

            products.forEach(p => {
              const row = document.createElement('div');
              row.className = 'search-result-row';
              row.setAttribute('data-product-id', String(p.id) || '');
              row.style.cssText = 'display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid #f3f4f6; cursor:pointer; transition:background 0.15s ease;';
              
              const img = document.createElement('img');
              img.src = p.image || '';
              img.alt = p.name || '';
              img.style.cssText = 'width:40px; height:40px; border-radius:6px; object-fit:cover; flex-shrink:0; background:#f3f4f6;';
              
              const info = document.createElement('div');
              info.style.cssText = 'flex:1; min-width:0;';
              
              const brand = document.createElement('div');
              brand.style.cssText = 'font-size:11px; color:#d4af37; font-weight:700; text-transform:uppercase;';
              brand.textContent = p.brand || 'Luxury';
              
              const name = document.createElement('div');
              name.style.cssText = 'font-size:13px; font-weight:600; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
              name.textContent = p.name || '';
              
              const price = document.createElement('div');
              price.style.cssText = 'font-size:12px; font-weight:700; color:#111827;';
              price.textContent = `₹${(p.price || 0).toLocaleString('en-IN')}`;
              
              info.appendChild(brand);
              info.appendChild(name);
              info.appendChild(price);
              
              row.appendChild(img);
              row.appendChild(info);
              wrapper.appendChild(row);
            });

            const viewAll = document.createElement('div');
            viewAll.className = 'search-view-all';
            viewAll.style.cssText = 'padding:10px; text-align:center; background:#f9fafb; font-size:12px; font-weight:700; color:#0b0d11; cursor:pointer;';
            viewAll.textContent = `View all results for "${query}" →`;
            wrapper.appendChild(viewAll);

            scrollContent.innerHTML = '';
            scrollContent.appendChild(wrapper);
            dropdownResults.style.display = 'block';

            // Wire up click on rows
            scrollContent.querySelectorAll('.search-result-row').forEach((row) => {
              row.addEventListener('click', () => {
                const prodId = row.getAttribute('data-product-id');
                if (prodId) {
                  dropdownResults.style.display = 'none';
                  closeAllDrawers();
                  router.push(`/product/${prodId}`);
                }
              });
            });

            // Wire up view all
            const viewAllBtn = scrollContent.querySelector('.search-view-all');
            if (viewAllBtn) {
              viewAllBtn.addEventListener('click', () => {
                dropdownResults.style.display = 'none';
                closeAllDrawers();
                router.push(`/shop?search=${encodeURIComponent(query)}`);
              });
            }
          } catch (err) {
            console.error('Search autocomplete failed:', err);
          }
        }, 220);
      });
    });

    // Close search dropdown on click outside
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.wd-search-form')) {
        document.querySelectorAll<HTMLElement>('.wd-dropdown-results').forEach((d) => {
          d.style.display = 'none';
        });
      }
    };
    document.addEventListener('click', handleDocumentClick);

    // -------------------------------------------------------------
    // Universal Smart Link Interceptor
    // -------------------------------------------------------------
    const handleUniversalLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore anchor jumps or javascript: links
      if (href.startsWith('#') || href.startsWith('javascript:')) return;

      // Don't intercept target="_blank" external links (e.g. WhatsApp / Social Media)
      if (
        target.target === '_blank' &&
        (href.includes('whatsapp.com') ||
          href.includes('wa.me') ||
          href.includes('instagram.com') ||
          href.includes('facebook.com') ||
          href.includes('youtube.com') ||
          href.includes('pinterest.com'))
      ) {
        return;
      }

      // Check if URL belongs to WatchTown
      const isWatchTownUrl =
        href.includes('watchtown.in') ||
        href.startsWith('/') ||
        (!href.startsWith('http://') && !href.startsWith('https://'));

      if (!isWatchTownUrl) return;

      // Intercept and route internally
      e.preventDefault();
      closeAllDrawers();

      // Normalize pathname
      let path = href.replace(/https?:\/\/(www\.)?watchtown\.in/, '');
      if (!path.startsWith('/')) path = `/${path}`;

      // Route mappings
      if (path === '/' || path === '') {
        router.push('/');
      } else if (path.includes('/product/')) {
        const slug = path.split('/product/')[1]?.replace(/\/$/, '');
        router.push(`/product/${slug}`);
      } else if (path.includes('/shop')) {
        router.push('/shop');
      } else if (path.includes('/cart')) {
        setIsCartOpen(true);
      } else if (path.includes('/wishlist')) {
        router.push('/wishlist');
      } else if (path.includes('/my-account')) {
        router.push('/account');
      } else if (path.includes('/track-you-order') || path.includes('/track-order')) {
        router.push('/track-order');
      } else if (
        path.includes('/dispatch-gallery') ||
        path.includes('/customer-trust') ||
        path.includes('/customer-reviews') ||
        path.includes('/live-dispatch-proof')
      ) {
        router.push('/customer-trust');
      } else if (path.includes('/about-us')) {
        router.push('/about-us');
      } else if (path.includes('/contact-us')) {
        router.push('/contact-us');
      } else if (path.includes('/frequently-asked-questions') || path.includes('/faq')) {
        router.push('/faq');
      } else if (path.includes('/shipping-policy')) {
        router.push('/shipping-policy');
      } else if (path.includes('/refund_returns')) {
        router.push('/refund_returns');
      } else if (path.includes('/privacy-policy')) {
        router.push('/privacy-policy');
      } else if (path.includes('/terms-and-condition')) {
        router.push('/terms-and-condition');
      } else if (path.includes('/product-category/brands/')) {
        const brand = path.split('/product-category/brands/')[1]?.replace(/\/$/, '').replace(/-watches|-watch/g, '').replace(/-/g, ' ');
        router.push(`/shop?brand=${encodeURIComponent(brand)}`);
      } else if (path.includes('/product-category/watch-types/')) {
        const type = path.split('/product-category/watch-types/')[1]?.replace(/\/$/, '').replace(/-/g, ' ');
        router.push(`/shop?category=${encodeURIComponent(type)}`);
      } else if (path.includes('/product-category/mens-watches')) {
        router.push('/shop?category=Men');
      } else if (path.includes('/product-category/womens-watches')) {
        router.push('/shop?category=Women');
      } else if (path.includes('under-2000')) {
        router.push('/shop?maxPrice=2000');
      } else if (path.includes('under-3000')) {
        router.push('/shop?maxPrice=3000');
      } else if (path.includes('under-5000')) {
        router.push('/shop?maxPrice=5000');
      } else if (path.includes('/product-category/')) {
        const cat = path.split('/product-category/')[1]?.replace(/\/$/, '').replace(/-/g, ' ');
        router.push(`/shop?category=${encodeURIComponent(cat)}`);
      } else {
        router.push('/shop');
      }
    };

    document.addEventListener('click', handleUniversalLinkClick);

    // -------------------------------------------------------------
    // SEO Collapsible Content Toggle
    // -------------------------------------------------------------
    const showMoreBtn = document.querySelector('.wd-collapsible-button a, .elementor-element-e3ec017 a');
    const collapsibleContent = document.querySelector('.wd-collapsible-content') as HTMLElement | null;
    if (showMoreBtn && collapsibleContent) {
      showMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        collapsibleContent.classList.toggle('wd-opened');
        collapsibleContent.style.maxHeight = collapsibleContent.classList.contains('wd-opened') ? 'none' : '';
      });
    }

    // -------------------------------------------------------------
    // FAQ Accordions in SEO Section
    // -------------------------------------------------------------
    const faqTitles = document.querySelectorAll('h3');
    faqTitles.forEach((title) => {
      if (
        title.textContent?.includes('What are first copy watches') ||
        title.textContent?.includes('Is it legal to buy') ||
        title.textContent?.includes('Are these watches working') ||
        title.textContent?.includes('Do you ship all over India')
      ) {
        const parent = title.parentElement;
        const answer = title.nextElementSibling as HTMLElement | null;
        if (parent && answer) {
          title.style.cursor = 'pointer';
          title.style.display = 'flex';
          title.style.justifyContent = 'space-between';
          title.style.alignItems = 'center';
          title.title = 'Click to expand/collapse';
          title.addEventListener('click', () => {
            const isHidden = answer.style.display === 'none';
            answer.style.display = isHidden ? 'block' : 'none';
          });
        }
      }
    });

    // -------------------------------------------------------------
    // Sticky Header Shadow on Scroll
    // -------------------------------------------------------------
    const header = document.querySelector('.whb-header') as HTMLElement | null;
    const handleScroll = () => {
      if (!header) return;
      if (window.scrollY > 120) {
        header.classList.add('whb-sticked');
      } else {
        header.classList.remove('whb-sticked');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('click', handleUniversalLinkClick);
      window.removeEventListener('scroll', handleScroll);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [setIsCartOpen, router]);

  if (!isAdmin) return null;

  return (
    // Discreet floating shortcut to Admin CRM for store administrators
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9990,
      }}
    >
      <button
        onClick={() => router.push('/admin')}
        style={{
          background: 'linear-gradient(135deg, #1f2636, #0b0d11)',
          color: '#d4af37',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: 30,
          padding: '8px 16px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = '#d4af37';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
        }}
        title="Access WatchTown Admin CRM & Inventory Panel"
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
          }}
        />
        Admin CRM
      </button>
    </div>
  );
}
