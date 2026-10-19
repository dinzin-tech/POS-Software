'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, Heart, ArrowUp, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const [year, setYear] = useState('2026');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-[#C9A24B]/20 text-[#A69F96] pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#C9A24B]/40 shadow-lg">
                <Image
                  src="/images/logo/five-star-emblem.png"
                  alt="Five Star Chicken"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h3 className="font-serif-lux text-xl font-bold text-white uppercase tracking-wider">
                  Five Star Chicken
                </h3>
                <p className="text-xs text-[#E8C979] font-medium">{siteConfig.branch}</p>
              </div>
            </div>

            <p className="text-xs text-[#A69F96] leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-[#E8C979]">
              <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
              <span>100% Halal Certified • Fresh Farm Poultry Daily</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-lux text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#menu" className="hover:text-[#E8C979] transition-colors">
                  Our Menu
                </a>
              </li>
              <li>
                <a href="#signature" className="hover:text-[#E8C979] transition-colors">
                  Signature Buckets
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-[#E8C979] transition-colors">
                  Our Craft & Story
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#E8C979] transition-colors">
                  Store Ambiance
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#E8C979] transition-colors">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="#visit" className="hover:text-[#E8C979] transition-colors">
                  Find Our Branch
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours Summary */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-lux text-sm font-bold text-white uppercase tracking-wider">
              Service Hours
            </h4>
            <div className="space-y-1.5 text-xs">
              <p className="text-white font-medium">Monday – Sunday</p>
              <p className="text-[#E8C979]">11:00 AM – 11:00 PM</p>
              <p className="text-[11px] text-[#6E675F] pt-1">
                Dine-in, Counter Takeaway & WhatsApp Delivery
              </p>
            </div>
          </div>

          {/* VIP Club / Newsletter */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-lux text-sm font-bold text-white uppercase tracking-wider">
              The Feast Club
            </h4>
            <p className="text-xs text-[#A69F96] leading-relaxed">
              Get exclusive weekend combo offers, secret menu drops, and festival discounts.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
                🎉 Welcome to the Five Star Feast Club!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-xs text-white placeholder-[#6E675F] focus:border-[#C9A24B] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gold-gradient text-black hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E675F]">
          <div>
            © {year} {siteConfig.name}. All rights reserved.
          </div>

          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-[#D32314] text-[#D32314]" />
            <span>for fried chicken lovers in Nelamangala</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-[#A69F96] hover:text-[#E8C979] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
