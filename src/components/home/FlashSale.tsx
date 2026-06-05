'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { IProduct } from '@/types';
import { useCountryStore } from '@/store/countryStore';
import { FiZap } from 'react-icons/fi';

export default function FlashSale() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { country } = useCountryStore();

  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFlashSale = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('flashSale', 'true');
        if (country && country !== 'ALL') {
          queryParams.append('country', country);
        }
        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching flash sale products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSale();
  }, [country]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 bg-error rounded-lg flex items-center justify-center shadow-md shadow-error/25">
              <FiZap size={18} className="text-white animate-pulse" />
              {/* Pulse live glow */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Flash Sale
            </h2>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1.5 ml-2.5">
            <span className="text-[10px] font-bold text-text-muted mr-1 hidden sm:inline uppercase tracking-wider">Ends in:</span>
            <div className="bg-secondary text-white font-bold text-sm sm:text-base px-2.5 py-1 rounded-lg shadow-sm font-mono min-w-[34px] text-center border border-white/5">
              {pad(timeLeft.hours)}
            </div>
            <span className="text-sm font-bold text-error">:</span>
            <div className="bg-secondary text-white font-bold text-sm sm:text-base px-2.5 py-1 rounded-lg shadow-sm font-mono min-w-[34px] text-center border border-white/5">
              {pad(timeLeft.minutes)}
            </div>
            <span className="text-sm font-bold text-error">:</span>
            <div className="bg-secondary text-white font-bold text-sm sm:text-base px-2.5 py-1 rounded-lg shadow-sm font-mono min-w-[34px] text-center border border-white/5">
              {pad(timeLeft.seconds)}
            </div>
          </div>
        </div>

        <a
          href="/products?flashSale=true"
          className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Shop All →
        </a>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 space-y-3 shadow-sm border border-border-light">
              <div className="aspect-square skeleton w-full rounded-lg" />
              <div className="h-4 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
              <div className="h-6 skeleton w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          No flash sale products available in this region.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
