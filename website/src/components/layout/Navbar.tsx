'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu as MenuIcon, X, Phone, Clock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { siteConfig } from '@/config/site';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const itemsCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Menu', href: '/#menu' },
    { name: 'Signature Dishes', href: '/#signature' },
    { name: 'Our Craft', href: '/#story' },
    { name: 'Ambiance', href: '/#gallery' },
    { name: 'Reviews', href: '/#reviews' },
    { name: 'Visit Us', href: '/#visit' },
  ];

  return (
    <>
      {/* 1px Kinpaku Gold Reading Progress Rule */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-[60] bg-transparent">
        <div
          className="h-full bg-[var(--ks-kinpaku)] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'border-b border-[var(--ks-gold-hairline)] py-2.5 sm:py-3 shadow-md'
            : 'bg-gradient-to-b from-[var(--ks-lacquer-deep)] via-[var(--ks-lacquer-black)]/80 to-transparent py-3 sm:py-4'
        }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(10, 9, 8, 0.98)' : undefined,
          backdropFilter: isScrolled ? 'blur(12px)' : undefined,
          WebkitBackdropFilter: isScrolled ? 'blur(12px)' : undefined,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Wordmark */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-[2px] overflow-hidden border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] group-hover:border-[var(--ks-kinpaku)] transition-colors shrink-0">
                <Image
                  src="/images/logo/five-star-emblem.png"
                  alt="Five Star Chicken"
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base sm:text-xl font-light tracking-[0.14em] text-[var(--ks-champagne)] uppercase flex items-center gap-1.5 sm:gap-2 leading-none">
                  Five Star <span className="font-mono text-[10px] sm:text-xs text-[var(--ks-kinpaku)] px-1 sm:px-1.5 py-0.5 rounded-[2px] border border-[var(--ks-gold-hairline-strong)] tracking-widest">RESTAURANT</span>
                </span>
                <span className="text-[10px] sm:text-xs tracking-[0.12em] text-[var(--ks-text-muted)] uppercase font-mono mt-0.5">
                  Dine-In & Takeaway • Nelamangala
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.14em] font-medium text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] transition-colors relative py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--ks-kinpaku)] group-hover:w-full transition-all duration-200" />
                </Link>
              ))}
            </nav>

            {/* Action Buttons: Cart & Order Now & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleCart}
                aria-label="Open Cart"
                className="relative p-2 min-w-[38px] min-h-[38px] rounded-[2px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-gold-hairline-strong)] text-[var(--ks-champagne)] transition-colors group flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 text-[var(--ks-kinpaku)]" />
                {mounted && itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-mono text-[11px] font-bold rounded-[2px] flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </button>

              {/* Kinpaku Gold "Order Now" CTA (Strictly desktop/tablet only, hidden on mobile) */}
              <Link
                href="/#menu"
                className="!hidden sm:!inline-flex ks-btn-primary text-xs py-2 px-5 min-h-[36px]"
              >
                Order Now
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-2 min-w-[38px] min-h-[38px] rounded-[2px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ backgroundColor: 'var(--ks-lacquer-deep)' }}
            className="fixed inset-0 z-40 bg-neutral-950 flex flex-col justify-between pt-24 pb-8 px-6 md:hidden overflow-y-auto border-b border-[var(--ks-gold-hairline)]"
          >
            <div className="flex flex-col space-y-6 pt-2">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--ks-gold-hairline)]">
                <Image
                  src="/images/logo/five-star-emblem.png"
                  alt="Five Star Chicken"
                  width={36}
                  height={36}
                  className="rounded-[2px] border border-[var(--ks-gold-hairline)]"
                />
                <div>
                  <h3 className="font-display text-xl font-light tracking-wide text-[var(--ks-champagne)]">
                    Five Star Chicken Restaurant
                  </h3>
                  <p className="text-xs text-[var(--ks-text-muted)] font-mono">Nelamangala Flagship • Dine-In</p>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xl font-headline font-light text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] tracking-wide transition-colors py-3 border-b border-[var(--ks-gold-hairline)] min-h-[46px] flex items-center"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 space-y-4 pb-4">
              <Link
                href="/#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full !flex items-center justify-center ks-btn-primary py-3.5 min-h-[46px] text-xs font-semibold tracking-wider uppercase text-center"
              >
                Order Online Now
              </Link>

              <div className="flex items-center justify-between pt-2 text-xs text-[var(--ks-text-muted)] border-t border-[var(--ks-gold-hairline)] font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--ks-kinpaku)]" />
                  <span>11:00 AM – 11:00 PM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--ks-patina)]" />
                  <span>{siteConfig.phone}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
