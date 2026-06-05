'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiShoppingCart, FiStar, FiChevronRight, FiMinus, FiPlus, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { IProduct } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/currency';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product?._id || ''));

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          setActiveImage(data.data.images[0] || '/placeholder.jpg');
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-bg-primary min-h-screen py-10">
        <div className="container-main max-w-5xl space-y-6">
          <div className="h-6 skeleton w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="space-y-3">
              <div className="aspect-square skeleton w-full rounded-lg" />
              <div className="flex gap-2">
                <div className="w-16 h-16 skeleton rounded" />
                <div className="w-16 h-16 skeleton rounded" />
                <div className="w-16 h-16 skeleton rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 skeleton w-3/4" />
              <div className="h-5 skeleton w-1/4" />
              <div className="h-8 skeleton w-1/3" />
              <div className="h-10 skeleton w-1/2" />
              <div className="h-12 skeleton w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-bg-primary min-h-[70vh] flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold text-text-primary">Product Not Found</p>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Sorry, we couldn&apos;t find the product you were looking for. It may have been removed or the link is incorrect.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const displayPrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/checkout';
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    if (!isInWishlist) {
      toast.success(`${product.name} saved to wishlist!`);
    } else {
      toast.error('Removed from wishlist');
    }
  };

  // Convert map or object specifications to array
  const specsList = Object.entries(product.specifications || {});

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted mb-5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <FiChevronRight size={12} />
          <Link href={`/category/${product.category}`} className="hover:text-primary transition-colors">
            {product.categoryName || 'Category'}
          </Link>
          <FiChevronRight size={12} />
          <span className="text-text-primary font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            {/* Active Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden border border-border bg-gray-50 max-h-[400px] w-full mx-auto">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 badge badge-sale text-xs px-2.5 py-1">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-50 flex-shrink-0 relative transition-all ${
                      activeImage === img ? 'border-primary shadow-sm scale-95' : 'border-border hover:border-text-secondary'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      className="object-cover p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Meta Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              {/* Brand & Stock status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold bg-bg-primary text-text-secondary px-3 py-1 rounded-full">
                  Brand: {product.brand}
                </span>
                {product.stock > 0 ? (
                  product.stock <= 5 ? (
                    <span className="text-xs font-bold text-error animate-pulse">
                      ⚠️ Only {product.stock} left in stock!
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-success flex items-center gap-1">
                      ● In Stock
                    </span>
                  )
                ) : (
                  <span className="text-xs font-bold text-text-muted">Out of Stock</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-star">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={15}
                      className={i < Math.floor(product.rating) ? 'fill-current' : 'text-star-empty'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-text-primary">{product.rating}</span>
                <span className="text-text-muted text-xs">|</span>
                <span className="text-xs text-primary hover:underline cursor-pointer">
                  {product.reviewCount} Reviews
                </span>
                <span className="text-text-muted text-xs">|</span>
                <span className="text-xs text-text-secondary">{product.sold} Sold</span>
              </div>

              {/* Divider */}
              <div className="border-b border-border" />

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-extrabold text-2xl sm:text-3xl">
                    {formatPrice(displayPrice, product.country)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-text-secondary line-through">
                      {formatPrice(product.price, product.country)}
                    </span>
                  )}
                </div>
                {product.discountPrice && (
                  <p className="text-xs text-success font-semibold">
                    You save {formatPrice(product.price - product.discountPrice, product.country)} ({discountPercent}% OFF)
                  </p>
                )}
              </div>

              {/* Description summary */}
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 pt-3">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden bg-bg-primary shadow-inner">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-border/60 transition-colors text-text-secondary cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-bold border-x border-border/80">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-border/60 transition-colors text-text-secondary cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-secondary hover:bg-secondary-light text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 text-center text-sm cursor-pointer"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer hover-glow-primary"
                  >
                    <FiShoppingCart size={18} />
                    Add to Cart
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-text-muted text-white font-bold py-3.5 rounded-xl cursor-not-allowed text-center text-sm"
                >
                  Out of Stock
                </button>
              )}
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`p-3.5 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isInWishlist
                    ? 'border-error bg-red-50 text-error'
                    : 'border-border text-text-secondary hover:border-error hover:text-error hover:bg-red-50/10'
                }`}
                aria-label="Toggle wishlist"
              >
                <FiHeart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Specifications Tab */}
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden p-6 mt-6">
          <h2 className="text-base sm:text-lg font-bold text-text-primary mb-4 border-b border-border pb-3">
            Product Specifications
          </h2>
          {specsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {specsList.map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-border-light py-2 text-sm">
                  <span className="text-text-secondary font-medium">{key}</span>
                  <span className="text-text-primary font-bold text-right">{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No specific specifications provided for this product.</p>
          )}
        </div>

        {/* Shipping & Returns Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border border-border-light flex gap-3 shadow-sm">
            <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center shrink-0">
              <FiTruck size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">Free Shipping</h3>
              <p className="text-[11px] text-text-secondary mt-1">
                Get free delivery on orders over {product.country === 'UK' ? '£40.00' : '$50.00'}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border-light flex gap-3 shadow-sm">
            <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center shrink-0">
              <FiRefreshCw size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">7 Days Returns</h3>
              <p className="text-[11px] text-text-secondary mt-1">Easy return option if not satisfied with purchase</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border-light flex gap-3 shadow-sm">
            <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center shrink-0">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">100% Genuine</h3>
              <p className="text-[11px] text-text-secondary mt-1">Directly sourced products from original brands</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-border-light p-6 mt-6">
          <h2 className="text-base sm:text-lg font-bold text-text-primary mb-5 border-b border-border pb-3">
            Customer Reviews ({product.reviewCount})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Rating score card */}
            <div className="text-center md:border-r border-border pb-6 md:pb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-text-primary">{product.rating}</p>
              <div className="flex justify-center text-star my-2">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'fill-current' : 'text-star-empty'}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted">Based on product satisfaction ratings</p>
            </div>

            {/* Center rating bar breakdowns */}
            <div className="md:col-span-2 space-y-2 max-w-md mx-auto w-full">
              {[5, 4, 3, 2, 1].map((stars) => {
                // Mock distribution
                const percents = [75, 15, 6, 2, 2];
                const pct = percents[5 - stars];
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="w-3 text-right">{stars}</span>
                    <FiStar size={12} className="fill-current text-star" />
                    <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                      <div className="bg-star h-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Reviews list */}
          <div className="mt-8 space-y-4 border-t border-border pt-6">
            {[
              { author: 'Asim A.', rating: 5, date: 'May 24, 2026', comment: 'Extremely satisfied with the purchase! The packaging was excellent and delivery was within 2 days. Highly recommended!' },
              { author: 'Fatima R.', rating: 4, date: 'April 15, 2026', comment: 'Very nice product. Exactly as shown in description. Fits well and specs are accurate. Just taking 1 star off because courier called 3 times.' },
              { author: 'Bilal K.', rating: 5, date: 'March 09, 2026', comment: 'Excellent quality product. Value for money is top-tier. Will buy again from Moon Mart!' }
            ].map((rev, i) => (
              <div key={i} className="border-b border-border-light pb-4 last:border-b-0 space-y-1">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className="font-bold text-text-primary">{rev.author}</span>
                  <span>{rev.date}</span>
                </div>
                <div className="flex text-star py-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={12}
                      className={i < rev.rating ? 'fill-current' : 'text-star-empty'}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
