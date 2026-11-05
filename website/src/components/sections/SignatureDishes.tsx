'use client';

import { ArrowRight } from 'lucide-react';
import { menuItems } from '@/data/menu';
import DishCard from '@/components/menu/DishCard';

export default function SignatureDishes() {
  const bestsellers = menuItems.filter((item) => item.isBestseller).slice(0, 6);

  return (
    <section id="signature" className="py-20 sm:py-24 bg-[var(--ks-lacquer-deep)] border-t border-[var(--ks-gold-hairline)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Direct H2 without eyebrow or gradient text */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
              Signature Masterpieces
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] max-w-xl font-body">
              Hand-picked culinary gems crafted with our international marinade, pressure-fried to seal in gold-standard crispness.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ks-kinpaku)] hover:text-[var(--ks-champagne)] transition-colors group"
            >
              <span>Explore Complete Menu</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--ks-kinpaku)] group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bestseller Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
