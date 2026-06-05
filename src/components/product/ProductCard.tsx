'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { IProduct } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/currency';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product._id));

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice || product.price;

  return (
    <div className="product-card bg-bg-card rounded-2xl overflow-hidden shadow-sm border border-border-light hover:border-primary/20 hover:shadow-xl transition-all duration-300 group relative flex flex-col justify-between h-full">
      <div>
        {/* Image & Overlay Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-2xl">
          <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercent > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm tracking-wider uppercase">
                -{discountPercent}% Off
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Quick Actions (visible on hover) */}
          <div className="product-actions absolute bottom-3.5 left-3 right-3 flex justify-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product);
              }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 scale-95 hover:scale-105 active:scale-90 cursor-pointer ${
                isInWishlist
                  ? 'bg-error text-white border border-error'
                  : 'bg-white/90 backdrop-blur-md text-text-primary hover:bg-error hover:text-white border border-white/20'
              }`}
              aria-label="Add to wishlist"
            >
              <FiHeart className="w-4 h-4 md:w-5 md:h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-hover border border-primary/10 transition-all duration-300 scale-95 hover:scale-105 active:scale-90 cursor-pointer"
              aria-label="Add to cart"
            >
              <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <Link
              href={`/product/${product.slug}`}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-md text-text-primary flex items-center justify-center shadow-lg hover:bg-secondary hover:text-white border border-white/20 transition-all duration-300 scale-95 hover:scale-105 active:scale-90"
              aria-label="Quick view"
            >
              <FiEye className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col justify-between">
          <div>
            {/* Category */}
            {product.categoryName && (
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                {product.categoryName}
              </p>
            )}

            {/* Title */}
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-sm sm:text-base font-semibold text-text-primary line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[3rem]">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center text-star">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={11}
                    className={i < Math.floor(product.rating) ? 'fill-current' : 'text-star-empty'}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-text-secondary">
                {product.rating}
              </span>
              <span className="text-[10px] text-text-muted">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          <div>
            {/* Price */}
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mt-3">
              <span className="text-base sm:text-xl font-extrabold text-primary">
                {formatPrice(displayPrice, product.country)}
              </span>
              {product.discountPrice && (
                <span className="text-xs sm:text-sm text-text-muted line-through font-medium">
                  {formatPrice(product.price, product.country)}
                </span>
              )}
            </div>

            {/* Discount Save Tag */}
            {discountPercent > 0 && (
              <div className="mt-1.5">
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-100/60">
                  Save {discountPercent}%
                </span>
              </div>
            )}

            {/* Stock Indicator */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-[10px] text-error font-semibold mt-1.5 animate-pulse">
                ⚠️ Only {product.stock} left!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
