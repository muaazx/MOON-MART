'use client';

import React, { useState, useEffect, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { IProduct } from '@/types';
import { FiSliders, FiX, FiCheck } from 'react-icons/fi';
import { useCountryStore } from '@/store/countryStore';

const categories = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty & Health',
  'Sports & Outdoors',
  'Groceries',
  'Baby & Toys',
  'Automotive',
  'Gaming',
];

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

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { country, setCountry } = useCountryStore();
  const currencySymbol = country === 'UK' ? '£' : '$';

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Reset category if query params change
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('q', searchQuery);
      if (selectedCategory) queryParams.append('category', selectedCategory);
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
  }, [searchQuery, selectedCategory, selectedBrand, sortOption, country]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
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
          <span className="text-text-primary font-medium">All Products</span>
        </div>

        {/* Banner info */}
        {searchQuery && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Search results for: <span className="font-bold text-text-primary">&quot;{searchQuery}&quot;</span>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Clear Search
            </button>
          </div>
        )}

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

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm text-text-primary mb-3">Category</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <FiCheck size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="border-t border-border pt-4">
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

            {/* Region / Country Filter */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-sm text-text-primary mb-3">Region / Country</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'All Regions', value: 'ALL' },
                  { label: 'United States 🇺🇸', value: 'US' },
                  { label: 'United Kingdom 🇬🇧', value: 'UK' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCountry(c.value as any)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      country === c.value
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                    }`}
                  >
                    <span>{c.label}</span>
                    {country === c.value && <FiCheck size={12} />}
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
                  aria-label="Sort products"
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
                {[...Array(8)].map((_, i) => (
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
                  We couldn&apos;t find any products matching your filters. Try clearing some selections or search for a different query.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Clear All Filters
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

      {/* ─── Mobile Filters Sidebar Modal ─── */}
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
              {/* Category */}
              <div>
                <h3 className="font-semibold text-sm text-text-primary mb-3">Category</h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(selectedCategory === cat ? '' : cat);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <FiCheck size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="border-t border-border pt-4">
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="bg-bg-primary min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading products catalog...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
