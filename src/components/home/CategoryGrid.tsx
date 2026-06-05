'use client';

import React from 'react';
import Link from 'next/link';
import {
  FiSmartphone,
  FiTag,
  FiHome,
  FiFeather,
  FiActivity,
  FiCoffee,
  FiGift,
  FiTool,
  FiBookOpen,
  FiMonitor
} from 'react-icons/fi';

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: <FiSmartphone />, color: 'from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-500/15 hover:border-blue-500/40 shadow-blue-500/5' },
  { name: 'Fashion', slug: 'fashion', icon: <FiTag />, color: 'from-pink-500/10 to-pink-600/10 text-pink-600 border-pink-500/15 hover:border-pink-500/40 shadow-pink-500/5' },
  { name: 'Home & Living', slug: 'home-living', icon: <FiHome />, color: 'from-amber-500/10 to-amber-600/10 text-amber-600 border-amber-500/15 hover:border-amber-500/40 shadow-amber-500/5' },
  { name: 'Beauty', slug: 'beauty-health', icon: <FiFeather />, color: 'from-purple-500/10 to-purple-600/10 text-purple-600 border-purple-500/15 hover:border-purple-500/40 shadow-purple-500/5' },
  { name: 'Sports', slug: 'sports-outdoors', icon: <FiActivity />, color: 'from-green-500/10 to-green-600/10 text-green-600 border-green-500/15 hover:border-green-500/40 shadow-green-500/5' },
  { name: 'Groceries', slug: 'groceries', icon: <FiCoffee />, color: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600 border-emerald-500/15 hover:border-emerald-500/40 shadow-emerald-500/5' },
  { name: 'Baby & Toys', slug: 'baby-toys', icon: <FiGift />, color: 'from-rose-500/10 to-rose-600/10 text-rose-600 border-rose-500/15 hover:border-rose-500/40 shadow-rose-500/5' },
  { name: 'Automotive', slug: 'automotive', icon: <FiTool />, color: 'from-slate-500/10 to-slate-600/10 text-slate-600 border-slate-500/15 hover:border-slate-500/40 shadow-slate-500/5' },
  { name: 'Books', slug: 'books', icon: <FiBookOpen />, color: 'from-indigo-500/10 to-indigo-600/10 text-indigo-600 border-indigo-500/15 hover:border-indigo-500/40 shadow-indigo-500/5' },
  { name: 'Gaming', slug: 'gaming', icon: <FiMonitor />, color: 'from-red-500/10 to-red-600/10 text-red-600 border-red-500/15 hover:border-red-500/40 shadow-red-500/5' },
];

export default function CategoryGrid() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Shop by Category
        </h2>
        <Link
          href="/categories"
          className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar snap-x pb-4 sm:pb-0 sm:grid sm:grid-cols-5 md:grid-cols-10 gap-4 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2 cursor-pointer shrink-0 w-[72px] sm:w-auto snap-center"
          >
            <div
              className={`w-16 h-16 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} border flex items-center justify-center text-2xl sm:text-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 active:scale-95 transition-all duration-300`}
            >
              <div className="group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
            </div>
            <span className="text-xs sm:text-xs font-semibold text-text-secondary text-center leading-tight group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
