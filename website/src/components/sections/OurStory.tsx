'use client';

import Image from 'next/image';
import { Award, ShieldCheck, Sparkles, Utensils } from 'lucide-react';

export default function OurStory() {
  return (
    <section id="story" className="py-20 sm:py-24 bg-[var(--ks-lacquer-deep)] border-t border-[var(--ks-gold-hairline)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] group">
              <Image
                src="/images/interior/neon-chicken-wall.jpg"
                alt="Five Star Chicken Nelamangala Neon Wall"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ks-lacquer-black)]/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Architectural Badge on Image */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-[4px] bg-[var(--ks-lacquer-deep)]/95 border border-[var(--ks-gold-hairline)] flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-mono tracking-widest text-[var(--ks-kinpaku)] font-semibold">
                    Nelamangala Flagship
                  </p>
                  <p className="text-sm font-title font-semibold text-[var(--ks-champagne)]">
                    The Upgraded Dine-In Restaurant
                  </p>
                </div>
                <div className="w-8 h-8 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] flex items-center justify-center text-[var(--ks-kinpaku)]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story Copy & Craft */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h2 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide leading-tight">
              The Evolution of Five Star Chicken
            </h2>

            <p className="mt-5 text-sm sm:text-base text-[var(--ks-text-muted)] font-body leading-relaxed">
              Backed by the global heritage of Five Star Chicken across 10,000+ locations worldwide, our Nelamangala branch represents an exciting upgrade of the classic outlet concept into a premier, full-service dine-in restaurant.
            </p>

            <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] font-body leading-relaxed">
              We pair the world-famous secret recipe and precision pressure-frying of Five Star Chicken with an elevated dining experience: comfortable family seating, modern ambiance, table reservations, and an expanded chef menu featuring gourmet burgers, rice bowls, and artisan desserts alongside our iconic crispy buckets.
            </p>

            {/* Quality Standard List */}
            <div className="mt-8 space-y-4 border-t border-[var(--ks-gold-hairline)] pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--ks-patina)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ks-champagne)] flex items-center gap-2">
                    <span>Farm-Fresh Poultry Standards</span>
                    <span className="ks-badge-patina text-xs py-0.5 px-2">Certified</span>
                  </h3>
                  <p className="text-xs text-[var(--ks-text-muted)] mt-1 font-body">
                    Ethically farm-sourced, delivered fresh daily, and prepared under rigorous FSSAI food hygiene standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Utensils className="w-5 h-5 text-[var(--ks-kinpaku)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ks-champagne)]">
                    Precision Pressure Frying
                  </h3>
                  <p className="text-xs text-[var(--ks-text-muted)] mt-1 font-body">
                    High-pressure thermal seal locks in tenderness while creating an ultra-crisp, non-greasy golden bite.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[var(--ks-kinpaku)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ks-champagne)]">
                    Direct Kitchen Transparency
                  </h3>
                  <p className="text-xs text-[var(--ks-text-muted)] mt-1 font-body">
                    Open kitchen counters with real-time DinZin POS order status tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
