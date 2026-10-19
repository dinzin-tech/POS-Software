'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ArrowDown, Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Cinematic Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/interior/dining-hall-world-map.jpg"
          alt="Five Star Chicken Nelamangala Ambiance"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.12]"
        />
        {/* Multilayered radial and gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-[#080808]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Floating Top Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1816]/90 border border-[#ebdd0b]/40 text-[#ebdd0b] text-xs font-semibold uppercase tracking-widest shadow-[0_0_20px_rgba(235,221,11,0.2)] mb-6 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ebdd0b]" />
          <span>Now Serving Nelamangala, Bengaluru</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
        </motion.div>

        {/* Big Serif Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif-lux text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#F7F3EE] max-w-5xl leading-[1.08]"
        >
          Legendary <span className="text-gold-gradient italic">Crunch.</span>
          <br />
          Five Star <span className="text-fire-gradient">Juiciness.</span>
        </motion.h1>

        {/* Tagline / Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-[#A69F96] max-w-2xl leading-relaxed font-light"
        >
          Experience pressure-fried fried chicken, fiery peri-peri buckets, and artisan burgers marinated with over four decades of global culinary heritage.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <a
            href="#menu"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white bg-fire-gradient hover:bg-fire-gradient-hover shadow-[0_0_30px_rgba(221,32,35,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
          >
            <Flame className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
            <span>Order Online Now</span>
          </a>

          <a
            href="#signature"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-[#F7F3EE] bg-[#161412]/80 hover:bg-[#201D1A] border border-[#ebdd0b]/40 hover:border-[#ebdd0b] backdrop-blur-md transition-all flex items-center justify-center"
          >
            Explore Bestsellers
          </a>
        </motion.div>

        {/* Floating Trust & Quality Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-4xl"
        >
          <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[#ebdd0b] mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#ebdd0b]" />
              ))}
            </div>
            <div className="text-sm sm:text-base font-bold text-white">4.9 ★ Rating</div>
            <div className="text-[10px] text-[#A69F96]">5,000+ Happy Foodies</div>
          </div>

          <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
            <ShieldCheck className="w-4 h-4 text-[#ebdd0b] mx-auto mb-1" />
            <div className="text-sm sm:text-base font-bold text-white">Fresh Daily</div>
            <div className="text-[10px] text-[#A69F96]">Never Frozen Cuts</div>
          </div>

          <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
            <Flame className="w-4 h-4 text-[#dd2023] mx-auto mb-1" />
            <div className="text-sm sm:text-base font-bold text-white">Secret Herbs</div>
            <div className="text-[10px] text-[#A69F96]">Signature Marinade</div>
          </div>

          <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
            <Sparkles className="w-4 h-4 text-[#ebdd0b] mx-auto mb-1" />
            <div className="text-sm sm:text-base font-bold text-white">10,000+ Stores</div>
            <div className="text-[10px] text-[#A69F96]">Worldwide Heritage</div>
          </div>
        </motion.div>

        {/* Animated Scroll Down Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="mt-12 text-[#A69F96] hover:text-[#ebdd0b] transition-colors"
        >
          <a href="#signature" aria-label="Scroll to Signature Dishes" className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll to Discover</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
