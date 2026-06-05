import React from 'react';
import Link from 'next/link';
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from 'react-icons/fi';

const footerLinks = {
  'Customer Service': [
    { label: 'Help Center', href: '/help' },
    { label: 'How to Buy', href: '/how-to-buy' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Track Your Order', href: '/account/orders' },
  ],
  'Moon Mart': [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Sell on Moon Mart', href: '/seller' },
  ],
  'My Account': [
    { label: 'My Orders', href: '/account/orders' },
    { label: 'My Wishlist', href: '/wishlist' },
    { label: 'My Addresses', href: '/account/addresses' },
    { label: 'My Profile', href: '/account/profile' },
    { label: 'My Coupons', href: '/account/coupons' },
  ],
};

const trustBadges = [
  { icon: FiTruck, label: 'Free Shipping', desc: 'On orders over Rs. 2,000' },
  { icon: FiRefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: FiShield, label: 'Secure Payment', desc: '100% secure checkout' },
  { icon: FiCreditCard, label: 'Multiple Payments', desc: 'COD, Card, PayPal' },
];

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/80 mt-auto">
      {/* Trust Badges */}
      <div className="border-b border-white/10">
        <div className="container-main py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <badge.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs sm:text-sm">{badge.label}</p>
                  <p className="text-[11px] text-white/50">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-main py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white text-xs mb-4 uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold text-white text-xs mb-4 uppercase tracking-wider">
              Stay Connected
            </h3>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <FiMapPin size={14} className="text-primary shrink-0" />
                <span>Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <FiPhone size={14} className="text-primary shrink-0" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <FiMail size={14} className="text-primary shrink-0" />
                <span>support@moonmart.pk</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex shadow-sm">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-3 py-2 text-xs bg-white/10 border border-white/10 rounded-l-xl outline-none focus:border-primary text-white placeholder:text-white/30"
              />
              <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 text-xs font-semibold rounded-r-xl transition-all active:scale-95 cursor-pointer">
                Subscribe
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-4">
              {[FiFacebook, FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary hover:scale-105 active:scale-95 transition-all"
                  aria-label="Social media"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Moon Mart. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/40">We Accept:</span>
            <div className="flex items-center gap-2">
              {['Visa', 'Mastercard', 'PayPal', 'COD'].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 bg-white/10 rounded text-[10px] font-semibold text-white/60"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
