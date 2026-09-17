'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  items: Product[];
  totalCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string | number) => void;
  toggleWishlist: (product: Product) => boolean; // returns true if now in wishlist
  isInWishlist: (productId: string | number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'watchtown_wishlist_v1';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved wishlist:', e);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save wishlist to storage:', e);
    }
  }, [items, initialized]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => String(p.id) === String(product.id))) {
        return prev;
      }
      return [product, ...prev];
    });
  };

  const removeFromWishlist = (productId: string | number) => {
    setItems((prev) => prev.filter((p) => String(p.id) !== String(productId)));
  };

  const toggleWishlist = (product: Product): boolean => {
    const exists = items.some((p) => String(p.id) === String(product.id));
    if (exists) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const isInWishlist = (productId: string | number): boolean => {
    return items.some((p) => String(p.id) === String(productId));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalCount: items.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
