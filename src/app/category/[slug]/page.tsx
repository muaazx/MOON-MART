'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { IProduct } from '@/types';
import { FiSliders, FiX, FiCheck } from 'react-icons/fi';
import { useCountryStore } from '@/store/countryStore';

const categoriesMap: Record<string, string> = {
  'electronics': 'Electronics',
  'fashion': 'Fashion',
  'home-living': 'Home & Living',
  'beauty-health': 'Beauty & Health',
  'sports-outdoors': 'Sports & Outdoors',
  'groceries': 'Groceries',
  'baby-toys': 'Baby & Toys',
  'automotive': 'Automotive',
  'books': 'Books',
  'gaming': 'Gaming',
};

const brands = [
  'Apple',
  'Samsung',
  'Sony',
  'Nike',
  'Adidas',
  'Dyson',
  'The Ordinary',
  'GlowUp',
  'BassBlast',
  'TechFit',
  'SoundMax',
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const categoryName = categoriesMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { country } = useCountryStore();
  const currencySymbol = country === 'UK' ? '£' : '$';

  const shippingNotice = country === 'ALL'
    ? 'free shipping on US & UK orders!'
    : country === 'US'
      ? 'free shipping on orders above $50.00'
      : 'free shipping on orders above £40.00';

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('category', categoryName);
      if (selectedBrand) queryParams.append('brand', selectedBrand);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (sortOption) queryParams.append('sort', sortOption);
      if (country && country !== 'ALL') queryParams.append('country', country);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [slug, selectedBrand, sortOption, country]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
  };

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{categoryName}</span>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-border-light relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
              {categoryName}
            </h1>
            <p className="text-sm text-text-secondary">
              Discover the latest and most popular items in our {categoryName} catalog. High quality products, incredible discounts, and {shippingNotice}
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center text-7xl font-bold bg-gradient-to-l from-primary to-transparent hidden md:flex select-none">
            🌙
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ─── Desktop Sidebar Filters ─── */}
          <aside className="hidden lg:block lg:col-span-1 space-y-5 bg-white p-5 rounded-xl shadow-sm h-fit">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-bold text-text-primary flex items-center gap-2">
                <FiSliders className="text-primary" /> Filters
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-xs text-error hover:underline font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Brands */}
            <div>
              <h3 className="font-semibold text-sm text-text-primary mb-3">Brand</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {brands.map((br) => (
                  <button
                    key={br}
                    onClick={() => setSelectedBrand(selectedBrand === br ? '' : br)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedBrand === br
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                    }`}
                  >
                    <span>{br}</span>
                    {selectedBrand === br && <FiCheck size={12} />}
                  </button>
                ))}
              </div>
            </div>

             {/* Price Filter */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-sm text-text-primary mb-3">Price Range ({currencySymbol})</h3>
              <form onSubmit={handlePriceApply} className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg outline-none focus:border-primary"
                />
                <span className="text-text-muted">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Go
                </button>
              </form>
            </div>
          </aside>

          {/* ─── Products Grid + Sorting ─── */}
          <section className="lg:col-span-3 space-y-4">
            {/* Top Bar (Sorting + Filter Toggle for Mobile) */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <span className="text-xs sm:text-sm text-text-secondary">
                Showing <span className="font-semibold text-text-primary">{products.length}</span> products
              </span>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-bg-primary"
                >
                  <FiSliders /> Filters
                </button>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-secondary outline-none focus:border-primary bg-white"
                  aria-label="Sort category products"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Popularity (Rating)</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 space-y-3 shadow-sm">
                    <div className="aspect-square skeleton w-full" />
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-4 skeleton w-1/2" />
                    <div className="h-6 skeleton w-1/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl p-8 text-center text-error font-medium">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center space-y-3">
                <p className="text-lg font-bold text-text-primary">No Products Found</p>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  We currently don&apos;t have any products seeded under {categoryName} matching these filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ─── Mobile Filters Drawer Modal ─── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white flex flex-col z-10 animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-text-primary text-base flex items-center gap-2">
                <FiSliders className="text-primary" /> Filters
              </h2>
              <button onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
                <FiX size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Brand */}
              <div>
                <h3 className="font-semibold text-sm text-text-primary mb-3">Brand</h3>
                <div className="space-y-1.5">
                  {brands.map((br) => (
                    <button
                      key={br}
                      onClick={() => {
                        setSelectedBrand(selectedBrand === br ? '' : br);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedBrand === br
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                      }`}
                    >
                      <span>{br}</span>
                      {selectedBrand === br && <FiCheck size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-sm text-text-primary mb-3">Price Range ({currencySymbol})</h3>
                <form
                  onSubmit={(e) => {
                    handlePriceApply(e);
                    setShowMobileFilters(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg outline-none focus:border-primary"
                  />
                  <span className="text-text-muted">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Go
                  </button>
                </form>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-border flex items-center gap-2">
              <button
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 py-2 border border-border rounded-lg text-xs font-bold text-text-secondary hover:bg-bg-primary"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
