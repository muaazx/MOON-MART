import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import FlashSale from '@/components/home/FlashSale';
import PromoBanners from '@/components/home/PromoBanners';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function HomePage() {
  return (
    <div className="bg-bg-primary">
      <div className="container-main py-8 space-y-8">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Flash Sale */}
        <FlashSale />

        {/* Promo Banners */}
        <PromoBanners />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* "Just For You" Divider Banner */}
        <div className="py-6">
          <div className="bg-gradient-to-r from-primary via-primary-hover to-secondary rounded-xl p-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">🌙 Discover More on Moon Mart</h2>
            <p className="text-white/70 text-sm max-w-lg mx-auto">
              Explore thousands of products across all categories. New arrivals daily, exclusive deals, and free shipping on orders over Rs. 2,000!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
