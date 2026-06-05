'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCountryStore } from '@/store/countryStore';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiPackage,
  FiLogOut,
  FiGrid,
  FiSmartphone,
  FiTag,
  FiHome,
  FiFeather,
  FiActivity,
  FiCoffee,
  FiGift,
  FiTool,
} from 'react-icons/fi';

interface CategoryItem {
  name: string;
  slug: string;
  icon: React.ReactNode;
  color: string;
  subcats: string[];
}

const categories: CategoryItem[] = [
  { name: 'Electronics', slug: 'electronics', icon: <FiSmartphone size={16} />, color: 'bg-blue-50 text-blue-600', subcats: ['Phones', 'Laptops', 'Tablets', 'Cameras', 'Headphones'] },
  { name: 'Fashion', slug: 'fashion', icon: <FiTag size={16} />, color: 'bg-pink-50 text-pink-600', subcats: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Watches', 'Bags'] },
  { name: 'Home & Living', slug: 'home-living', icon: <FiHome size={16} />, color: 'bg-amber-50 text-amber-600', subcats: ['Furniture', 'Kitchen', 'Decor', 'Bedding', 'Lighting'] },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: <FiFeather size={16} />, color: 'bg-purple-50 text-purple-600', subcats: ['Skincare', 'Makeup', 'Perfumes', 'Hair Care', 'Supplements'] },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: <FiActivity size={16} />, color: 'bg-green-50 text-green-600', subcats: ['Fitness', 'Cycling', 'Camping', 'Running', 'Swimming'] },
  { name: 'Groceries', slug: 'groceries', icon: <FiCoffee size={16} />, color: 'bg-emerald-50 text-emerald-600', subcats: ['Snacks', 'Beverages', 'Dairy', 'Fresh Food', 'Pantry'] },
  { name: 'Baby & Toys', slug: 'baby-toys', icon: <FiGift size={16} />, color: 'bg-rose-50 text-rose-600', subcats: ['Diapers', 'Baby Food', 'Toys', 'Strollers', 'Clothing'] },
  { name: 'Automotive', slug: 'automotive', icon: <FiTool size={16} />, color: 'bg-slate-50 text-slate-600', subcats: ['Car Parts', 'Accessories', 'Tools', 'Oils', 'Tires'] },
];

export default function Header() {
  const { data: session } = useSession();
  const { country, setCountry } = useCountryStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const cartItemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const shippingNotice = country === 'ALL'
    ? 'Free shipping on US & UK orders!'
    : country === 'US'
      ? 'Free shipping on orders over $50.00'
      : 'Free shipping on orders over £40.00';

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* ─── Top Bar ─── */}
      <div className="bg-secondary text-white/80 text-sm hidden md:block">
        <div className="container-main flex justify-between items-center h-10">
          <div className="flex items-center gap-4">
            <span>Welcome to Moon Mart! 🌙</span>
            <span className="text-primary font-semibold">{shippingNotice}</span>
          </div>
          <div className="flex items-center gap-4">
            {mounted && (
              <div className="flex items-center gap-2 border-r border-white/20 pr-4">
                <span className="text-white/60">Region:</span>
                <button
                  onClick={() => setCountry('ALL')}
                  className={`hover:text-accent font-semibold transition-colors cursor-pointer ${
                    country === 'ALL' ? 'text-accent font-extrabold border-b border-accent' : ''
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCountry('US')}
                  className={`hover:text-accent font-semibold transition-colors cursor-pointer ${
                    country === 'US' ? 'text-accent font-extrabold border-b border-accent' : ''
                  }`}
                >
                  🇺🇸 US
                </button>
                <button
                  onClick={() => setCountry('UK')}
                  className={`hover:text-accent font-semibold transition-colors cursor-pointer ${
                    country === 'UK' ? 'text-accent font-extrabold border-b border-accent' : ''
                  }`}
                >
                  🇬🇧 UK
                </button>
              </div>
            )}
            <Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link>
            <span className="text-white/30">|</span>
            <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* ─── Main Header ─── */}
      <div className={`bg-primary transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="container-main flex items-center h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold text-2xl">
              🌙
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-2xl leading-tight tracking-tight">
                Moon<span className="text-accent">Mart</span>
              </h1>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="hidden md:block flex-1 max-w-2xl relative"
          >
            <div
              className={`flex items-center bg-white rounded-xl overflow-hidden transition-all duration-300 ${
                isSearchFocused ? 'ring-4 ring-accent/35 shadow-lg scale-[1.002]' : 'shadow-sm border border-transparent'
              }`}
            >
              <div className="pl-5 text-text-muted flex items-center justify-center">
                <FiSearch size={22} />
              </div>
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 px-4 py-3.5 text-base text-text-primary outline-none bg-transparent"
                id="search-input"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-light text-white px-8 py-3.5 transition-colors font-bold text-base cursor-pointer"
                aria-label="Search"
              >
                Search
              </button>
            </div>
          </form>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative text-white hover:text-accent transition-all duration-200 p-3 rounded-2xl hover:bg-white/10 hover:scale-105 active:scale-95"
              aria-label="Wishlist"
            >
              <FiHeart size={26} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-primary shadow-sm animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-white hover:text-accent transition-all duration-200 p-3 rounded-2xl hover:bg-white/10 hover:scale-105 active:scale-95"
              aria-label="Cart"
            >
              <FiShoppingCart size={26} />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-primary shadow-sm animate-scale-in">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {mounted && session ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden sm:flex items-center gap-2 text-white hover:text-accent transition-all duration-200 p-3 rounded-2xl hover:bg-white/10 outline-none hover:scale-105"
                >
                  <FiUser size={26} />
                  <span className="text-base font-bold hidden lg:inline max-w-[120px] truncate">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <FiChevronDown size={18} className="hidden lg:inline" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-border py-2 z-50 text-text-primary text-sm animate-slide-down">
                    <div className="px-4 py-2 border-b border-border-light">
                      <p className="font-semibold truncate text-xs">{session.user?.name}</p>
                      <p className="text-[10px] text-text-secondary truncate">{session.user?.email}</p>
                    </div>
                    {(session.user as { role?: string; email?: string | null })?.role === 'admin' && session.user?.email === 'admin@moonmart.com' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-bg-primary hover:text-primary transition-colors font-semibold text-primary border-b border-border-light"
                      >
                        <FiGrid size={16} /> Admin Portal
                      </Link>
                    )}
                    <Link
                      href="/account/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-bg-primary hover:text-primary transition-colors"
                    >
                      <FiPackage size={16} /> My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-bg-primary hover:text-error transition-colors border-t border-border-light mt-1 text-text-secondary"
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-3 text-white hover:text-accent transition-colors p-3 rounded-2xl hover:bg-white/10"
              >
                <FiUser size={26} />
                <span className="text-base font-bold hidden lg:inline">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="w-full relative"
          >
            <div
              className={`flex items-center bg-white rounded-xl overflow-hidden transition-all duration-300 ${
                isSearchFocused ? 'ring-2 ring-accent shadow-lg scale-[1.002]' : 'shadow-sm border border-transparent'
              }`}
            >
              <div className="pl-4 text-text-muted flex items-center justify-center">
                <FiSearch size={20} />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 px-3 py-2.5 text-sm text-text-primary outline-none bg-transparent"
                id="search-input-mobile"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-light text-white px-5 py-2.5 transition-colors font-bold text-sm cursor-pointer"
                aria-label="Search"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Category Navigation Bar ─── */}
      <div className="bg-white border-b border-border hidden md:block">
        <div className="container-main flex items-center h-14">
          {/* All Categories Dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-3 px-6 h-14 bg-secondary text-white font-bold text-base hover:bg-secondary-light transition-colors cursor-pointer rounded-b-xl shadow-md"
            >
              <FiGrid size={20} />
              <span>All Categories</span>
              <FiChevronDown
                size={18}
                className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Category Mega Menu */}
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-0 w-[700px] bg-white rounded-b-xl shadow-xl border border-border z-50 animate-slide-down overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="border-r border-border-light py-2 bg-white">
                    {categories.map((cat, index) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        onMouseEnter={() => setHoveredCategory(index)}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group ${
                          hoveredCategory === index
                            ? 'bg-primary-light text-primary font-bold border-l-4 border-primary pl-3'
                            : 'hover:bg-bg-primary text-text-primary hover:text-primary pl-4'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color} group-hover:scale-105 transition-transform shrink-0`}>
                          {cat.icon}
                        </span>
                        <span className="text-xs font-semibold">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="p-5 flex flex-col justify-between h-full bg-slate-50/50">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border-light pb-2">
                        Discover {categories[hoveredCategory]?.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {categories[hoveredCategory]?.subcats.map((sub) => (
                          <Link
                            key={sub}
                            href={`/products?category=${categories[hoveredCategory].slug}&sub=${encodeURIComponent(sub)}`}
                            className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group/sub"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-border group-hover/sub:bg-primary transition-colors" />
                            <span>{sub}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 p-3.5 bg-gradient-to-r from-primary/10 to-primary-hover/5 border border-primary/10 rounded-xl">
                      <p className="text-xs font-bold text-primary mb-1">🔥 Moon Deals!</p>
                      <p className="text-[10px] text-text-secondary">Special discounts up to 50% on selected {categories[hoveredCategory]?.name} items.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex items-center h-full ml-6 gap-6">
            {['Flash Sale', 'New Arrivals', 'Best Sellers', 'Brands', 'Deals'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  item === 'Flash Sale' ? 'text-error font-semibold' : 'text-text-secondary'
                }`}
              >
                {item === 'Flash Sale' && '⚡ '}
                {item}
              </Link>
            ))}
          </nav>

          {/* Right side: Track Order */}
          <div className="ml-auto flex items-center">
            <Link
              href="/account/orders"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <FiPackage size={15} />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="w-80 max-w-[85vw] h-full bg-white overflow-y-auto animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile User Section */}
            <div className="p-4 bg-primary text-white">
              {mounted && session ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FiUser size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{session.user?.name}</p>
                      <p className="text-xs text-white/70 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(session.user as { role?: string; email?: string | null })?.role === 'admin' && session.user?.email === 'admin@moonmart.com' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs bg-accent text-secondary font-bold px-3 py-1.5 rounded-lg flex-1 text-center"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="text-xs bg-white/20 text-white font-semibold px-3 py-1.5 rounded-lg flex-1 text-center"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Welcome!</p>
                    <p className="text-xs text-white/70">Login / Register</p>
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile Region Selector */}
            {mounted && (
              <div className="p-4 border-b border-border bg-slate-50">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Select region / currency
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setCountry('ALL'); setIsMobileMenuOpen(false); }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      country === 'ALL'
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-text-primary bg-white hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setCountry('US'); setIsMobileMenuOpen(false); }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      country === 'US'
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-text-primary bg-white hover:bg-slate-50'
                    }`}
                  >
                    🇺🇸 US
                  </button>
                  <button
                    onClick={() => { setCountry('UK'); setIsMobileMenuOpen(false); }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      country === 'UK'
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-text-primary bg-white hover:bg-slate-50'
                    }`}
                  >
                    🇬🇧 UK
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Categories */}
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-primary transition-colors group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color} shrink-0`}>
                    {cat.icon}
                  </span>
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Links */}
            <div className="border-t border-border py-2">
              <Link href="/flash-sale" className="flex items-center gap-3 px-4 py-3 text-sm text-error font-semibold">
                ⚡ Flash Sale
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm">
                <FiPackage size={16} /> Track Order
              </Link>
              <Link href="/help" className="flex items-center gap-3 px-4 py-3 text-sm">
                <FiLogOut size={16} /> Help Center
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
