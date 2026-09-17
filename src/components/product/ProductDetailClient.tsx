'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Lock,
  Heart,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 4;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(product, quantity);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* Breadcrumb navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: '#6b7280',
          marginBottom: 32,
        }}
      >
        <Link href="/" style={{ color: '#111827', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: '#111827', fontWeight: 600 }}>Shop</Link>
        <span>/</span>
        <span>{product.brand || 'Luxury Watch'}</span>
        <span>/</span>
        <span style={{ color: '#9ca3af', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 48,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Image Gallery */}
        <div>
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              paddingTop: '100%',
            }}
          >
            <img
              src={selectedImage}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: 16,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://watchtown.in/wp-content/uploads/2025/11/Coach-Delancey-Rose-Gold-Black-Dial-36mm-1-600x600.jpg';
              }}
            />

            {product.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: '#e11d48',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 6,
                  letterSpacing: 0.5,
                }}
              >
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Actions */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
            {product.brand || 'WatchTown Luxury'} &bull; SKU: {product.sku || `WT-${product.id}`}
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#111827',
              margin: '8px 0 12px 0',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, fontSize: 13 }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <strong style={{ color: '#111827' }}>{product.rating || '4.9'}</strong>
            <span style={{ color: '#6b7280' }}>({product.reviewCount || 18} Customer Reviews)</span>
          </div>

          {/* Pricing Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              padding: '16px 20px',
              background: '#f9fafb',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#059669',
                background: '#ecfdf5',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              FREE SHIPPING &amp; COD
            </span>
          </div>

          {/* Inventory Status Notice */}
          <div style={{ marginBottom: 24 }}>
            {isOutOfStock ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  color: '#b91c1c',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={16} /> Currently Out of Stock — Pre-orders accepted via WhatsApp
              </div>
            ) : isLowStock ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 6,
                  color: '#b45309',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={16} /> Urgent Stock: Only {stock} pieces remaining in warehouse!
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 6,
                  color: '#047857',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} /> In Stock — Quality Tested &bull; Dispatches within 24 Hours
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            {/* Quantity Stepper */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#ffffff',
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
              >
                -
              </button>
              <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: quantity >= stock ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                }}
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '14px 24px',
                borderRadius: 8,
                border: 'none',
                background: isOutOfStock ? '#e5e7eb' : isAdded ? '#10b981' : '#111827',
                color: isOutOfStock ? '#9ca3af' : '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <ShoppingBag size={18} />
              {isOutOfStock ? 'Out of Stock' : isAdded ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '14px 24px',
                borderRadius: 8,
                border: 'none',
                background: isOutOfStock ? '#e5e7eb' : 'linear-gradient(135deg, #d4af37, #c19a27)',
                color: isOutOfStock ? '#9ca3af' : '#0b0d11',
                fontWeight: 800,
                fontSize: 14,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Buy Now (COD) <ArrowRight size={18} />
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              style={{
                padding: '14px 18px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: isInWishlist(product.id) ? 'rgba(225, 29, 72, 0.08)' : '#ffffff',
                color: isInWishlist(product.id) ? '#e11d48' : '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={18} fill={isInWishlist(product.id) ? '#e11d48' : 'none'} />
              <span>{isInWishlist(product.id) ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 28, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Product Overview &amp; Craftsmanship
            </h3>
            <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {product.description ||
                'This master-crafted 7AA luxury replica delivers precision timekeeping, solid 316L stainless steel architecture, scratch-resistant sapphire crystal glass, and exact weight fidelity. Comes complete with a luxury branded watch box and warranty documentation.'}
            </p>
          </div>

          {/* Specifications Table */}
          <div
            style={{
              background: '#f9fafb',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                padding: '12px 18px',
                background: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 700,
                fontSize: 13,
                color: '#111827',
              }}
            >
              Watch Specifications
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280', width: '40%' }}>Brand</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600, color: '#111827' }}>
                    {product.brand || 'Luxury Replica'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280' }}>Grade Quality</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600, color: '#111827' }}>
                    7AA Premium Master Copy
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280' }}>Case Material</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600, color: '#111827' }}>
                    Solid 316L Stainless Steel
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 18px', color: '#6b7280' }}>Glass Type</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600, color: '#111827' }}>
                    Scratch-Proof Sapphire Crystal
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 18px', color: '#6b7280' }}>Delivery &amp; COD</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600, color: '#10b981' }}>
                    Available Across All India Pincodes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Trust Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#4b5563' }}>
              <Truck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <strong>Free Express Shipping</strong>
                <div style={{ color: '#9ca3af' }}>3-5 days delivery with live SMS tracking</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#4b5563' }}>
              <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <strong>HD Packing Video Proof</strong>
                <div style={{ color: '#9ca3af' }}>Live video recorded before dispatch</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 24 }}>
            You May Also Like
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {relatedProducts.slice(0, 4).map((rel) => (
              <Link
                key={rel.id}
                href={`/product/${rel.id}`}
                style={{
                  textDecoration: 'none',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                }}
              >
                <img
                  src={rel.image}
                  alt={rel.name}
                  style={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                    {rel.brand}
                  </div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '4px 0 8px 0', lineHeight: 1.3 }}>
                    {rel.name}
                  </h4>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    ₹{rel.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
