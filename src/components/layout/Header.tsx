'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  PhoneCall,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface UserSession {
  id: string | number;
  name: string;
  email: string;
  role?: string;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalCount: cartCount, subtotal, setIsCartOpen } = useCart();
  const { totalCount: wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check user authentication
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else if (data.email) {
          setUser(data);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [pathname]);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live product search debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setIsSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchDropdownOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.refresh();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const openMobileDrawer = () => {
    const mobileNav = document.querySelector('.mobile-nav') as HTMLElement | null;
    const closeSide = document.querySelector('.wd-close-side') as HTMLElement | null;
    if (mobileNav) mobileNav.classList.add('wd-opened');
    if (closeSide) closeSide.classList.add('wd-close-side-opened');
    document.body.classList.add('wd-side-opened');
  };

  return (
    <header className="wt-luxury-header" role="banner">
      {/* 1. Top Announcement Bar */}
      <div className="wt-header-topbar">
        <div className="wt-header-container">
          <div className="wt-topbar-content">
            <div className="wt-topbar-badge">
              <Sparkles size={13} className="text-amber-400" />
              <span>India’s #1 Store for 7AAA First Copy Luxury Watches • Free Delivery Available</span>
            </div>
            <div className="wt-topbar-links">
              <Link href="/live-dispatch-proof" className="wt-topbar-link">
                Live Packing Proof
              </Link>
              <Link href="/track-order" className="wt-topbar-link">
                Track Order
              </Link>
              <Link href="/contact-us" className="wt-topbar-link">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header Row (Logo, Search, Phone Support, Cart) */}
      <div className="wt-header-main">
        <div className="wt-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Logo */}
          <Link href="/" className="wt-header-logo-link" aria-label="WatchTown Home">
            <img
              src="https://watchtown.in/wp-content/uploads/2025/04/watch-town-logo.svg"
              alt="WatchTown Luxury Watches"
              className="wt-header-logo-img"
              width={230}
              height={46}
            />
          </Link>

          {/* Luxury Search Bar */}
          <div className="wt-search-container" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="wt-search-form" role="search">
              <input
                type="text"
                className="wt-search-input"
                placeholder="Search luxury watches, Rolex, Fossil, Hublot, Patek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchDropdownOpen(true);
                }}
                aria-label="Search watches"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="wt-search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchDropdownOpen(false);
                  }}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: 46,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                className="wt-search-submit-btn"
                aria-label="Submit search"
                style={{
                  position: 'absolute',
                  right: 5,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  maxWidth: 36,
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  zIndex: 10,
                }}
              >
                <Search size={17} color="#ffffff" strokeWidth={2.4} style={{ display: 'block', margin: 'auto' }} />
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {isSearchDropdownOpen && searchResults.length > 0 && (
              <div className="wt-search-dropdown">
                <div className="wt-search-results-list">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="wt-search-result-item"
                      onClick={() => setIsSearchDropdownOpen(false)}
                    >
                      <img
                        src={product.image || 'https://watchtown.in/wp-content/uploads/2025/04/automatic-luxury-watch.png'}
                        alt={product.name}
                        className="wt-search-item-img"
                        width={44}
                        height={44}
                      />
                      <div className="wt-search-item-info">
                        <div className="wt-search-item-title">{product.name}</div>
                        <div className="wt-search-item-brand">{product.brand || 'Luxury Watch'}</div>
                      </div>
                      <div className="wt-search-item-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                  className="wt-search-view-all"
                  onClick={() => setIsSearchDropdownOpen(false)}
                >
                  View All Matching Watches <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
                </Link>
              </div>
            )}
          </div>

          {/* Right Action Icons: 24/7 Phone + Cart Pill */}
          <div className="wt-header-actions">
            {/* Phone Support */}
            <a href="tel:+919763642094" className="wt-phone-widget" aria-label="Customer Support">
              <div className="wt-phone-icon-wrap">
                <PhoneCall size={18} />
                <span className="wt-phone-pulse" />
              </div>
              <div className="wt-phone-text-wrap">
                <span className="wt-phone-label">Available 24/7</span>
                <span className="wt-phone-number">(+91) 9763642094</span>
              </div>
            </a>

            {/* Shopping Bag Button */}
            <button
              type="button"
              className="wt-cart-button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Shopping Bag"
            >
              <div className="wt-cart-icon-wrap">
                <ShoppingBag size={21} />
                <span className="wt-cart-badge">{cartCount}</span>
              </div>
              <span className="wt-cart-amount">
                ₹{subtotal.toLocaleString('en-IN')}.00
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sticky Navigation Bar & Menu Row */}
      <div className={`wt-header-nav-row ${isSticky ? 'is-sticky' : ''}`}>
        <div className="wt-header-container">
          <div className="wt-nav-row-inner">
            {/* Main Links */}
            <nav aria-label="Primary Navigation">
              <ul className="wt-main-nav-list">
                <li className="wt-nav-item">
                  <Link href="/" className={`wt-nav-link ${pathname === '/' ? 'active' : ''}`}>
                    Home
                  </Link>
                </li>

                {/* Shop with Interactive Mega Menu */}
                <li className="wt-nav-item">
                  <Link href="/shop" className={`wt-nav-link ${pathname === '/shop' ? 'active' : ''}`}>
                    Shop <ChevronDown className="wt-nav-chevron" />
                  </Link>
                  <div className="wt-mega-menu">
                    <div className="wt-mega-grid">
                      {/* Col 1: Categories */}
                      <div>
                        <div className="wt-mega-column-title">By Category</div>
                        <ul className="wt-mega-links">
                          <li>
                            <Link href="/shop?category=Men%27s+Watches" className="wt-mega-link">
                              <span>Men’s Watches</span>
                              <span className="wt-mega-badge gold">Hot</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?category=Women%27s+Watches" className="wt-mega-link">
                              <span>Women’s Watches</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?type=automatic-watches" className="wt-mega-link">
                              <span>Automatic Watches</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?type=chronograph-watches" className="wt-mega-link">
                              <span>Chronograph Watches</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?type=quartz-watches" className="wt-mega-link">
                              <span>Quartz Watches</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 2: Top Brands */}
                      <div>
                        <div className="wt-mega-column-title">Top Brands</div>
                        <ul className="wt-mega-links">
                          <li>
                            <Link href="/shop?brand=Rolex" className="wt-mega-link">
                              <span>Rolex</span>
                              <span className="wt-mega-badge">Trending</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Fossil" className="wt-mega-link">
                              <span>Fossil</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Patek+Philippe" className="wt-mega-link">
                              <span>Patek Philippe</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Audemars+Piguet" className="wt-mega-link">
                              <span>Audemars Piguet</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Hublot" className="wt-mega-link">
                              <span>Hublot</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Omega" className="wt-mega-link">
                              <span>Omega</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 3: More Brands */}
                      <div>
                        <div className="wt-mega-column-title">More Brands</div>
                        <ul className="wt-mega-links">
                          <li>
                            <Link href="/shop?brand=Cartier" className="wt-mega-link">
                              <span>Cartier</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Tissot" className="wt-mega-link">
                              <span>Tissot</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Seiko" className="wt-mega-link">
                              <span>Seiko</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Armani+Exchange" className="wt-mega-link">
                              <span>Armani Exchange</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=Diesel" className="wt-mega-link">
                              <span>Diesel</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?brand=G-Shock" className="wt-mega-link">
                              <span>Casio G-Shock</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 4: Shop By Budget & Features */}
                      <div>
                        <div className="wt-mega-column-title">Shop by Price</div>
                        <ul className="wt-mega-links">
                          <li>
                            <Link href="/shop?maxPrice=2000" className="wt-mega-link">
                              <span>Under ₹2,000</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?minPrice=2000&maxPrice=3000" className="wt-mega-link">
                              <span>₹2,000 - ₹3,000</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?minPrice=3000&maxPrice=5000" className="wt-mega-link">
                              <span>₹3,000 - ₹5,000</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?minPrice=5000" className="wt-mega-link">
                              <span>Premium 7AAA (₹5,000+)</span>
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop?sort=bestselling" className="wt-mega-link">
                              <span>Best Selling Watches</span>
                              <span className="wt-mega-badge gold">Top</span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Men's Watches */}
                <li className="wt-nav-item">
                  <Link
                    href="/shop?category=Men%27s+Watches"
                    className={`wt-nav-link ${pathname === '/shop' && typeof window !== 'undefined' && window.location.search.includes("Men's") ? 'active' : ''}`}
                  >
                    Men’s Watches
                  </Link>
                </li>

                {/* Women's Watches */}
                <li className="wt-nav-item">
                  <Link
                    href="/shop?category=Women%27s+Watches"
                    className={`wt-nav-link ${pathname === '/shop' && typeof window !== 'undefined' && window.location.search.includes("Women's") ? 'active' : ''}`}
                  >
                    Women’s Watches
                  </Link>
                </li>

                {/* Brands Dropdown */}
                <li className="wt-nav-item">
                  <Link href="/shop" className="wt-nav-link">
                    Brands <ChevronDown className="wt-nav-chevron" />
                  </Link>
                  <div className="wt-dropdown-menu">
                    <Link href="/shop?brand=Rolex" className="wt-dropdown-item">Rolex</Link>
                    <Link href="/shop?brand=Fossil" className="wt-dropdown-item">Fossil</Link>
                    <Link href="/shop?brand=Patek+Philippe" className="wt-dropdown-item">Patek Philippe</Link>
                    <Link href="/shop?brand=Audemars+Piguet" className="wt-dropdown-item">Audemars Piguet</Link>
                    <Link href="/shop?brand=Hublot" className="wt-dropdown-item">Hublot</Link>
                    <Link href="/shop?brand=Omega" className="wt-dropdown-item">Omega</Link>
                    <Link href="/shop?brand=Cartier" className="wt-dropdown-item">Cartier</Link>
                    <Link href="/shop?brand=Tissot" className="wt-dropdown-item">Tissot</Link>
                    <Link href="/shop" className="wt-dropdown-item" style={{ borderTop: '1px solid #f1f5f9', color: '#0f172a', fontWeight: 700 }}>
                      View All Brands →
                    </Link>
                  </div>
                </li>

                {/* Categories Dropdown */}
                <li className="wt-nav-item">
                  <Link href="/shop" className="wt-nav-link">
                    Categories <ChevronDown className="wt-nav-chevron" />
                  </Link>
                  <div className="wt-dropdown-menu">
                    <Link href="/shop?type=automatic-watches" className="wt-dropdown-item">Automatic Watches</Link>
                    <Link href="/shop?type=chronograph-watches" className="wt-dropdown-item">Chronograph Watches</Link>
                    <Link href="/shop?type=quartz-watches" className="wt-dropdown-item">Quartz Watches</Link>
                    <Link href="/shop?type=luxury-watches" className="wt-dropdown-item">Luxury Swiss Replicas</Link>
                    <Link href="/shop?type=casual-watches" className="wt-dropdown-item">Casual Everyday Watches</Link>
                  </div>
                </li>

                {/* Customer Trust Dropdown */}
                <li className="wt-nav-item">
                  <Link href="/customer-trust" className={`wt-nav-link ${pathname === '/customer-trust' ? 'active' : ''}`}>
                    Customer Trust <ChevronDown className="wt-nav-chevron" />
                  </Link>
                  <div className="wt-dropdown-menu">
                    <Link href="/live-dispatch-proof" className="wt-dropdown-item">
                      <CheckCircle2 size={15} color="#10b981" />
                      Live Packing & Dispatch Video
                    </Link>
                    <Link href="/customer-reviews" className="wt-dropdown-item">
                      <ShieldCheck size={15} color="#b45309" />
                      Customer Reviews & 4.8★ Rating
                    </Link>
                    <Link href="/dispatch-gallery" className="wt-dropdown-item">
                      <Package size={15} color="#2563eb" />
                      Dispatch Proof Gallery
                    </Link>
                    <Link href="/customer-trust" className="wt-dropdown-item">
                      <Sparkles size={15} color="#d97706" />
                      Why Choose WatchTown
                    </Link>
                  </div>
                </li>

                {/* Blog / FAQ */}
                <li className="wt-nav-item">
                  <Link href="/faq" className={`wt-nav-link ${pathname === '/faq' ? 'active' : ''}`}>
                    FAQ & Guides
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right Utilities: Wishlist & User Profile */}
            <div className="wt-nav-utilities">
              {/* Wishlist */}
              <Link href="/wishlist" className="wt-utility-link" aria-label="Wishlist">
                <Heart size={17} color="#ef4444" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="wt-utility-badge">{wishlistCount}</span>
                )}
              </Link>

              <div className="wt-utility-divider" />

              {/* User Account / Profile Dropdown */}
              <div className="wt-user-dropdown-wrap">
                {user ? (
                  <>
                    <Link href="/account" className="wt-utility-link" aria-label="My Account">
                      <User size={17} color="#0f172a" />
                      <span>{user.name?.split(' ')[0] || 'My Account'}</span>
                      <ChevronDown size={14} />
                    </Link>
                    <div className="wt-dropdown-menu wt-user-dropdown-menu">
                      <div className="wt-user-header">
                        <div className="wt-user-name">{user.name}</div>
                        <div className="wt-user-email">{user.email}</div>
                      </div>
                      <Link href="/account" className="wt-dropdown-item">
                        <User size={15} /> My Profile & Orders
                      </Link>
                      <Link href="/track-order" className="wt-dropdown-item">
                        <Package size={15} /> Track My Order
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="wt-dropdown-item" style={{ color: '#b45309', fontWeight: 700 }}>
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="wt-dropdown-item"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#dc2626' }}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <Link href="/account" className="wt-utility-link" aria-label="Login or Register">
                    <User size={17} />
                    <span>Login / Register</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Header Bar (Screen <= 1024px) */}
      <div className="wt-mobile-header">
        <div className="wt-mobile-top-bar">
          <button
            type="button"
            className="wt-mobile-menu-btn"
            onClick={openMobileDrawer}
            aria-label="Open Mobile Menu"
          >
            <Menu size={26} />
          </button>

          <Link href="/" aria-label="WatchTown Home">
            <img
              src="https://watchtown.in/wp-content/uploads/2025/04/watch-town-logo.svg"
              alt="WatchTown"
              style={{ maxHeight: 38, width: 'auto', filter: 'brightness(0)' }}
            />
          </Link>

          <div className="wt-mobile-actions">
            <Link href="/wishlist" aria-label="Wishlist" style={{ color: '#0f172a', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Heart size={22} color="#ef4444" />
              {wishlistCount > 0 && (
                <span className="wt-cart-badge" style={{ top: -6, right: -8, minWidth: 16, height: 16, fontSize: 9 }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
              style={{ background: 'none', border: 'none', color: '#0f172a', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <ShoppingBag size={22} color="#0f172a" />
              <span className="wt-cart-badge" style={{ top: -6, right: -8, minWidth: 16, height: 16, fontSize: 9 }}>
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="wt-mobile-search-row">
          <form onSubmit={handleSearchSubmit} className="wt-search-form" role="search">
            <input
              type="text"
              className="wt-search-input"
              style={{ height: 40, fontSize: 13 }}
              placeholder="Search Rolex, Fossil, Hublot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search watches"
            />
            <button
              type="submit"
              className="wt-search-submit-btn"
              aria-label="Submit search"
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                minWidth: 32,
                maxWidth: 32,
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                zIndex: 10,
              }}
            >
              <Search size={15} color="#ffffff" strokeWidth={2.4} style={{ display: 'block', margin: 'auto' }} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
