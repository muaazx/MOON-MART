'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { IProduct } from '@/types';
import { useCountryStore } from '@/store/countryStore';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { country } = useCountryStore();

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('featured', 'true');
        if (country && country !== 'ALL') {
          queryParams.append('country', country);
        }
        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [country]);

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Just For You ✨
        </h2>
        <a
          href="/products"
          className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          View All →
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
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
          No featured products available in this region.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
