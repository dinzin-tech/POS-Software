'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, ArrowUp, ShieldCheck, MapPin, FileText, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const year = '2026';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    <footer className="bg-[var(--ks-lacquer-deep)] border-t border-[var(--ks-gold-hairline)] text-[var(--ks-text-muted)] pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-[var(--ks-gold-hairline)]">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-[2px] overflow-hidden border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)]">
                <Image
                  src="/images/logo/five-star-emblem.png"
                  alt="Five Star Chicken"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-light tracking-[0.14em] text-[var(--ks-champagne)] uppercase">
                  Five Star Chicken Restaurant
                </h3>
                <p className="text-xs text-[var(--ks-kinpaku)] font-mono">{siteConfig.branch} • Dine-In & Takeaway</p>
              </div>
            </div>

            <p className="text-xs text-[var(--ks-text-muted)] leading-relaxed max-w-sm font-body">
              {siteConfig.description}
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-[var(--ks-text-muted)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--ks-patina)] shrink-0" />
                <span>FSSAI Registered: {siteConfig.fssaiNumber}</span>
              </div>
            </div>
          </div>

          {/* Compliance & Address */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-title text-xs font-semibold text-[var(--ks-champagne)] uppercase tracking-wider">
              Compliance & Address
            </h4>

            {/* GST Number List Above Address */}
            <div className="space-y-2 font-mono text-xs pt-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--ks-gold-hairline)]">
                <span className="text-[var(--ks-text-muted)]">GSTIN:</span>
                <span className="font-mono-num font-bold text-[var(--ks-kinpaku)] tracking-wider">
                  {siteConfig.gstin}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--ks-gold-hairline)]">
                <span className="text-[var(--ks-text-muted)]">FSSAI Lic:</span>
                <span className="font-mono-num font-semibold text-[var(--ks-champagne)] tracking-wider">
                  {siteConfig.fssaiNumber}
                </span>
              </div>
              <div className="text-xs text-[var(--ks-text-muted)] pt-0.5">
                Entity: <strong className="text-[var(--ks-champagne)]">{siteConfig.tradeName}</strong>
                <span className="block text-xs text-[var(--ks-text-faint)]">Prop. {siteConfig.legalName}</span>
              </div>
            </div>

            {/* Address */}
            <div className="text-xs text-[var(--ks-text-muted)] space-y-1.5 pt-2 font-body border-t border-[var(--ks-gold-hairline)]">
              <p className="font-medium text-[var(--ks-champagne)] flex items-center gap-1.5 font-mono text-xs">
                <MapPin className="w-3.5 h-3.5 text-[var(--ks-kinpaku)] shrink-0" />
                <span>Restaurant Address:</span>
              </p>
              <p className="text-xs leading-relaxed">
                {siteConfig.address}
              </p>
              <p className="text-xs text-[var(--ks-kinpaku)] font-mono">
                Landmark: {siteConfig.landmark}
              </p>
              <p className="text-xs text-[var(--ks-text-muted)] pt-0.5 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-[var(--ks-patina)]" />
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] font-semibold"
                >
                  {siteConfig.phone}
                </a>
              </p>
            </div>
          </div>

          {/* Quick & Legal Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-title text-xs font-semibold text-[var(--ks-champagne)] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-body">
              <li>
                <Link href="/#menu" className="hover:text-[var(--ks-kinpaku)] transition-colors">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link href="/#signature" className="hover:text-[var(--ks-kinpaku)] transition-colors">
                  Signature Buckets
                </Link>
              </li>
              <li>
                <Link href="/#story" className="hover:text-[var(--ks-kinpaku)] transition-colors">
                  Our Craft & Story
                </Link>
              </li>
              <li>
                <Link href="/#gallery" className="hover:text-[var(--ks-kinpaku)] transition-colors">
                  Store Ambiance
                </Link>
              </li>
              <li>
                <Link href="/#visit" className="hover:text-[var(--ks-kinpaku)] transition-colors">
                  Find Our Branch
                </Link>
              </li>
              <li className="pt-2 border-t border-[var(--ks-gold-hairline)]">
                <Link
                  href="/privacy-policy"
                  className="text-[var(--ks-kinpaku)] hover:text-[var(--ks-champagne)] transition-colors flex items-center gap-1 font-mono text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-[var(--ks-kinpaku)] hover:text-[var(--ks-champagne)] transition-colors flex items-center gap-1 font-mono text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Hours & Newsletter */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-title text-xs font-semibold text-[var(--ks-champagne)] uppercase tracking-wider">
              Hours & Updates
            </h4>
            <div className="space-y-1 font-mono text-xs">
              <p className="text-[var(--ks-champagne)] font-medium">Monday – Sunday</p>
              <p className="text-[var(--ks-kinpaku)] font-bold">11:00 AM – 11:00 PM</p>
              <p className="text-xs text-[var(--ks-text-muted)]">
                Dine-In & Takeaway: {siteConfig.phone}
              </p>
            </div>

            <p className="text-xs text-[var(--ks-text-muted)] leading-relaxed font-body">
              Join for verified menu drops and weekend dining updates.
            </p>

            {subscribed ? (
              <div className="ks-badge-patina w-full justify-center py-2 text-xs">
                Welcome to Five Star Club
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-3 pr-11 py-2.5 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] text-xs text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:border-[var(--ks-kinpaku)] focus:outline-none font-mono min-h-[40px]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-[2px] bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] hover:bg-[var(--ks-kinpaku-rich)] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal & Back to Top */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--ks-text-muted)] font-mono">
          <div>
            © {year} {siteConfig.name} • {siteConfig.tradeName}. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link href="/privacy-policy" className="hover:text-[var(--ks-kinpaku)] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-and-conditions" className="hover:text-[var(--ks-kinpaku)] transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <span>GSTIN: {siteConfig.gstin}</span>
            <span>•</span>
            <span>FSSAI: {siteConfig.fssaiNumber}</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-[var(--ks-text-muted)] hover:text-[var(--ks-kinpaku)] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
