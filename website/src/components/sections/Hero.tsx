'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ArrowDown, Flame, ShieldCheck, Award } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-16 bg-[var(--ks-lacquer-black)]">
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Mobile View: High-contrast focus on the golden crispy chicken */}
        <div className="relative w-full h-full sm:hidden">
          <Image
            src="/images/hero/hero-fried-chicken-mobile.webp"
            alt="Five Star Crispy Fried Chicken Banner"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top filter brightness-[0.45] contrast-[1.12]"
          />
        </div>

        {/* Desktop View: Full widescreen panoramic immersion */}
        <div className="hidden sm:block relative w-full h-full">
          <Image
            src="/images/hero/hero-fried-chicken-banner.webp"
            alt="Five Star Crispy Fried Chicken Panoramic Banner"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_60%] filter brightness-[0.42] contrast-[1.14]"
          />
        </div>

        {/* Cinematic Vignette Overlays for Maximum Legibility & Brand Mood */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ks-lacquer-black)] via-[var(--ks-lacquer-black)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--ks-lacquer-black)]/85 via-transparent to-[var(--ks-lacquer-black)]" />
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[var(--ks-lacquer-black)]/85 via-[var(--ks-lacquer-black)]/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Large Architectural Display Headline (Alumni Sans weight 100/300, no gradient text, no kicker) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-thin tracking-[-0.01em] text-[var(--ks-champagne)] max-w-5xl leading-[1.08] sm:leading-[1.01]"
        >
          CRUNCH IN GOLD.
          <br />
          <span className="font-normal text-[var(--ks-kinpaku)]">JUICY TO THE BONE.</span>
        </motion.h1>

        {/* Subtitle with measure 65-75ch */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[var(--ks-text-muted)] max-w-2xl leading-relaxed font-body"
        >
          The upgraded full-service dine-in restaurant by Five Star Chicken. Authentic pressure-fried crispy chicken, fiery peri-peri buckets, gourmet burgers, rice bowls, and sizzling desserts in Nelamangala.
        </motion.p>

        {/* Dual CTAs (2px radius, crisp hairlines, high contrast, full width on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href="#menu"
            className="w-full sm:w-auto ks-btn-primary min-h-[46px] px-8 text-center justify-center"
          >
            <span>Order Online Now</span>
          </a>

          <a
            href="#signature"
            className="w-full sm:w-auto ks-btn-secondary min-h-[46px] px-8 text-center justify-center"
          >
            <span>Explore Bestsellers</span>
          </a>
        </motion.div>

        {/* Structured Bento Grid Proof Tiles (No nested cards, 1px gold hairline, 6px radius) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 sm:mt-18 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-4xl"
        >
          <div className="ks-tile p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[var(--ks-kinpaku)] mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[var(--ks-kinpaku)]" />
              ))}
            </div>
            <div className="font-mono-num text-xs sm:text-base font-semibold text-[var(--ks-champagne)]">
              4.9 ★ Rating
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--ks-text-muted)] font-mono mt-0.5">5,000+ Patrons</div>
          </div>

          <div className="ks-tile p-3 sm:p-4 text-center border-[oklch(70%_0.12_188_/_0.3)] bg-[oklch(70%_0.12_188_/_0.06)]">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ks-patina)] mx-auto mb-1" />
            <div className="font-mono-num text-xs sm:text-base font-semibold text-[var(--ks-patina)]">
              100% Halal Cut
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--ks-text-muted)] font-mono mt-0.5">Fresh Farm Poultry Daily</div>
          </div>

          <div className="ks-tile p-3 sm:p-4 text-center">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ks-kinpaku)] mx-auto mb-1" />
            <div className="text-xs sm:text-base font-semibold text-[var(--ks-champagne)] font-title">
              Secret Herbs
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--ks-text-muted)] font-mono mt-0.5">Pressure-Fry Sealed</div>
          </div>

          <div className="ks-tile p-3 sm:p-4 text-center">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ks-kinpaku)] mx-auto mb-1" />
            <div className="font-mono-num text-xs sm:text-base font-semibold text-[var(--ks-champagne)]">
              10,000+ Stores
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--ks-text-muted)] font-mono mt-0.5">Global Heritage</div>
          </div>
        </motion.div>

        {/* Subtle Scroll Down Anchor */}
        <div className="mt-12 text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] transition-colors">
          <a href="#signature" aria-label="Scroll to Signature Dishes" className="flex flex-col items-center gap-1.5">
            <span className="text-xs uppercase font-mono tracking-[0.16em]">Explore Offerings</span>
            <ArrowDown className="w-3.5 h-3.5 text-[var(--ks-kinpaku)]" />
          </a>
        </div>
      </div>
    </section>
  );
}
