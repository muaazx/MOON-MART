'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bgGradient: string;
  image: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: 'Mega Flash Sale ⚡',
    subtitle: 'Up to 70% off on Electronics, Fashion & Accessories',
    cta: 'Shop Now',
    href: '/flash-sale',
    bgGradient: 'from-orange-600/90 via-orange-500/70 to-secondary/80',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'New Season Collection 👗',
    subtitle: 'Discover the latest trends in fashion and style',
    cta: 'Explore Collection',
    href: '/category/fashion',
    bgGradient: 'from-violet-950/90 via-indigo-900/70 to-secondary/80',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Free Delivery 🚚',
    subtitle: 'On all orders above Rs. 2,000 across the region',
    cta: 'Start Shopping',
    href: '/products',
    bgGradient: 'from-emerald-950/90 via-emerald-800/70 to-secondary/80',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-[220px] sm:h-[320px] md:h-[400px] group shadow-lg"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-[1.02] pointer-events-none'
          }`}
        >
          {/* Slide Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={index === 0}
              className={`object-cover transition-transform duration-[10000ms] ease-out ${
                index === currentSlide ? 'scale-105' : 'scale-100'
              }`}
              sizes="100vw"
            />
            {/* Gradient Dark/Blur Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgGradient} backdrop-blur-[0.5px]`} />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="container-main w-full px-4 sm:px-8">
              <div className={`max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-7 text-white shadow-2xl transition-all duration-700 delay-200 ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-1.5 sm:mb-3 leading-tight tracking-tight drop-shadow-sm">
                  {banner.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-white/95 mb-4 sm:mb-6 font-medium leading-relaxed">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.href}
                  className="inline-flex items-center gap-1.5 bg-white text-secondary hover:bg-accent hover:text-secondary font-bold px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <span>{banner.cta}</span>
                  <FiChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer"
        aria-label="Previous slide"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer"
        aria-label="Next slide"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide
                ? 'w-6 bg-accent'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
