'use client';

import React from 'react';
import { Drumstick, Sandwich, Coffee, CakeSlice, Salad, Flame } from 'lucide-react';

interface DishPlaceholderProps {
  name: string;
  category?: string;
  isVeg?: boolean;
  className?: string;
}

export default function DishPlaceholder({ name, category = 'all', isVeg = false, className = '' }: DishPlaceholderProps) {
  const cat = (category || '').toLowerCase();

  const getCategoryDetails = () => {
    if (isVeg || cat.includes('veg')) {
      return {
        icon: Salad,
        accent: 'text-[var(--ks-patina)]',
        label: 'Pure Veg',
      };
    }
    if (cat.includes('burger') || cat.includes('sandwich') || cat.includes('bowl')) {
      return {
        icon: Sandwich,
        accent: 'text-[var(--ks-kinpaku)]',
        label: 'Artisan Burger',
      };
    }
    if (cat.includes('beverage') || cat.includes('drink') || cat.includes('sip')) {
      return {
        icon: Coffee,
        accent: 'text-[var(--ks-patina)]',
        label: 'Refreshment',
      };
    }
    if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('treat')) {
      return {
        icon: CakeSlice,
        accent: 'text-[var(--ks-champagne)]',
        label: 'Dessert',
      };
    }
    if (cat.includes('peri') || cat.includes('spicy') || cat.includes('hot')) {
      return {
        icon: Flame,
        accent: 'text-[var(--ks-vermilion)]',
        label: 'Fiery Recipe',
      };
    }
    return {
      icon: Drumstick,
      accent: 'text-[var(--ks-kinpaku)]',
      label: 'Fresh Farm Chicken',
    };
  };

  const details = getCategoryDetails();
  const IconComponent = details.icon;

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center bg-[var(--ks-lacquer-deep)] p-4 select-none ${className}`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] flex items-center justify-center mb-2">
          <IconComponent className={`w-6 h-6 ${details.accent}`} />
        </div>

        <span className="font-mono text-xs uppercase tracking-wider text-[var(--ks-text-muted)]">
          {details.label}
        </span>

        <p className="mt-1 text-xs font-title font-semibold text-[var(--ks-champagne)] text-center line-clamp-1 max-w-[180px]">
          {name}
        </p>
      </div>
    </div>
  );
}
