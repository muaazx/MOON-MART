import React from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiGift, FiPercent } from 'react-icons/fi';

const banners = [
  {
    id: 1,
    title: 'New Arrivals',
    subtitle: 'Trending products this week',
    icon: FiTrendingUp,
    href: '/new-arrivals',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 2,
    title: 'Gift Cards',
    subtitle: 'Perfect present for anyone',
    icon: FiGift,
    href: '/gift-cards',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 3,
    title: 'Coupon Center',
    subtitle: 'Collect vouchers & save',
    icon: FiPercent,
    href: '/coupons',
    gradient: 'from-amber-500 to-orange-600',
  },
];

export default function PromoBanners() {
  return (
    <section className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${banner.gradient} p-5 sm:p-6 text-white group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="relative z-10">
              <banner.icon size={28} className="mb-2 opacity-80" />
              <h3 className="font-bold text-lg">{banner.title}</h3>
              <p className="text-sm text-white/70 mt-1">{banner.subtitle}</p>
            </div>
            {/* Decorative */}
            <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-white/10 translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute right-8 top-0 w-16 h-16 rounded-full bg-white/5 -translate-y-4 group-hover:scale-125 transition-transform duration-500" />
          </Link>
        ))}
      </div>
    </section>
  );
}
