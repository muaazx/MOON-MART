'use client';

import React from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary py-16">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart size={40} className="text-error" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Your Wishlist is Empty</h1>
          <p className="text-text-secondary mb-6 max-w-sm mx-auto">
            Save your favorite items here so you can easily find them later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg"
          >
            <FiShoppingCart size={18} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">My Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            My Wishlist ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearWishlist}
            className="text-sm text-error hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <FiTrash2 size={14} />
            Clear All
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
