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
    <div className="relative pb-1">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 touch-pan-x scroll-smooth">
        {displayCategories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-150 shrink-0 border min-h-[36px] flex items-center active:scale-[0.97] ${
                isActive
                  ? 'border-[var(--ks-kinpaku)] bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] shadow-md'
                  : 'border-[var(--ks-gold-hairline)] bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] hover:border-[var(--ks-gold-hairline-strong)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-[var(--ks-kinpaku)] rounded-full z-0"
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
