'use client';

import { motion } from 'framer-motion';
import { menuCategories } from '@/data/menu';

interface MenuTabsProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  categories?: { id: string; name: string }[];
}

export default function MenuTabs({
  activeCategory,
  onSelectCategory,
  categories = [...menuCategories],
}: MenuTabsProps) {
  const displayCategories = categories.length > 0 ? categories : menuCategories;

  return (
    <div className="relative border-b border-[var(--ks-gold-hairline)] pb-2">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 touch-pan-x">
        {displayCategories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`relative px-3.5 py-2 rounded-[2px] text-xs font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-all duration-150 shrink-0 border min-h-[36px] flex items-center active:scale-[0.98] ${
                isActive
                  ? 'border-[var(--ks-kinpaku)] bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-semibold'
                  : 'border-[var(--ks-gold-hairline)] bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] hover:border-[var(--ks-gold-hairline-strong)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-[var(--ks-kinpaku)] rounded-[2px] z-0"
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative z-10">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
