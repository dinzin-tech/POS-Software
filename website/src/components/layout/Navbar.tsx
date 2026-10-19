'use client';

import { useState, useEffect } from 'react';
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

  const itemsCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Menu', href: '#menu' },
    { name: 'Signature Dishes', href: '#signature' },
    { name: 'Our Story', href: '#story' },
    { name: 'Ambiance', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Visit Us', href: '#visit' },
  ];

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#D32314] via-[#C9A24B] to-[#E8C979] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-[#C9A24B]/30 shadow-md group-hover:border-[#C9A24B] transition-colors">
                <Image
                  src="/images/logo/five-star-emblem.png"
                  alt="Five Star Chicken Logo"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-lux text-lg sm:text-xl font-bold tracking-wider text-[#F7F3EE] uppercase flex items-center gap-1.5">
                  Five Star <span className="text-[#C9A24B] text-xs font-sans-lux px-1.5 py-0.5 rounded border border-[#C9A24B]/40">Nelamangala</span>
                </span>
                <span className="text-[10px] tracking-widest text-[#A69F96] uppercase font-sans-lux">
                  Crispy • Juicy • Legendary
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-7">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs uppercase tracking-widest font-medium text-[#A69F96] hover:text-[#E8C979] transition-colors relative py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#C9A24B] to-[#E8C979] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Action Buttons: Cart & Order Now */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleCart}
                aria-label="Open Cart"
                className="relative p-2.5 rounded-full bg-[#1A1816] border border-[#C9A24B]/20 hover:border-[#C9A24B]/60 hover:bg-[#25221F] text-[#F7F3EE] transition-all group"
              >
                <ShoppingBag className="w-5 h-5 text-[#E8C979] group-hover:scale-110 transition-transform" />
                {itemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-[#D32314] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#080808] shadow-sm animate-pulse"
                  >
                    {itemsCount}
                  </motion.span>
                )}
              </button>

              {/* Gold "Order Now" CTA */}
              <a
                href="#menu"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#0A0A0A] bg-gold-gradient hover:opacity-95 shadow-[0_0_20px_rgba(201,162,75,0.25)] hover:shadow-[0_0_30px_rgba(201,162,75,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Order Now
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-2 rounded-lg bg-[#141210] border border-[#C9A24B]/20 text-[#F7F3EE] hover:text-[#E8C979]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[#0A0908]/98 backdrop-blur-2xl flex flex-col justify-between pt-24 pb-8 px-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col space-y-6 pt-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#C9A24B]/15">
                <Image
                  src="/images/logo/five-star-emblem.png"
                  alt="Five Star Chicken"
                  width={40}
                  height={40}
                  className="rounded-md"
                />
                <div>
                  <h3 className="font-serif-lux text-lg font-bold text-white">Five Star Chicken</h3>
                  <p className="text-xs text-[#A69F96]">Nelamangala, Bengaluru</p>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-serif-lux text-[#F7F3EE] hover:text-[#C9A24B] tracking-wide transition-colors py-2 border-b border-white/5"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <a
                href="#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block py-3.5 text-center text-sm font-bold tracking-wider uppercase text-[#0A0A0A] bg-gold-gradient rounded-full shadow-lg"
              >
                Order Online Now
              </a>

              <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#A69F96]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C9A24B]" />
                  <span>11:00 AM – 11:00 PM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#D32314]" />
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
