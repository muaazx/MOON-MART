'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiTag } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useCountryStore } from '@/store/countryStore';
import { formatPrice, countryConfig } from '@/lib/currency';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();
  const { country } = useCountryStore();

  const activeCountry = country === 'ALL'
    ? (items[0]?.product.country || 'US')
    : country;
  const config = countryConfig[activeCountry];

  const subtotal = getSubtotal();
  const shippingFee = subtotal > config.shippingThreshold ? 0 : config.shippingFee;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary py-16">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Your Cart is Empty</h1>
          <p className="text-text-secondary mb-6 max-w-sm mx-auto">
            Looks like you haven&apos;t added anything to your cart yet. Start shopping and find amazing deals!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg"
          >
            <FiArrowLeft size={18} />
            Continue Shopping
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
          <span className="text-text-primary font-medium">Shopping Cart</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 flex items-center justify-between">
              <h1 className="text-lg font-bold text-text-primary">
                Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h1>
              <button
                onClick={clearCart}
                className="text-sm text-error hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <FiTrash2 size={14} />
                Clear All
              </button>
            </div>

            {/* Items */}
            {items.map((item) => {
              const displayPrice = item.product.discountPrice || item.product.price;
              const itemTotal = displayPrice * item.quantity;
              const discountPercent = item.product.discountPrice
                ? Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)
                : 0;

              return (
                <div
                  key={item.product._id}
                  className="bg-white rounded-xl p-4 flex gap-4 animate-fade-in"
                >
                  {/* Image */}
                  <Link href={`/product/${item.product.slug}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={item.product.images[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="text-sm font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-text-muted mt-1">
                      Brand: {item.product.brand}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-primary font-bold">
                        {formatPrice(displayPrice, item.product.country)}
                      </span>
                      {item.product.discountPrice && (
                        <>
                          <span className="text-xs text-text-muted line-through">
                            {formatPrice(item.product.price, item.product.country)}
                          </span>
                          <span className="price-discount text-[10px]">-{discountPercent}%</span>
                        </>
                      )}
                    </div>

                    {/* Quantity + Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-bg-primary transition-colors text-text-secondary"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-bg-primary transition-colors text-text-secondary"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-text-primary">
                          {formatPrice(itemTotal, item.product.country)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-text-muted hover:text-error transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 sticky top-32">
              <h2 className="text-lg font-bold text-text-primary mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button className="bg-secondary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary-light transition-colors">
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal, activeCountry)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Shipping</span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-success' : ''}`}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, activeCountry)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-primary bg-primary-light p-2 rounded-lg">
                    🚚 Add {formatPrice(config.shippingThreshold - subtotal, activeCountry)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between text-base font-bold border-t border-border pt-3">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total, activeCountry)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full mt-5 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] block text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/"
                className="w-full mt-3 text-sm text-text-secondary text-center block hover:text-primary transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
