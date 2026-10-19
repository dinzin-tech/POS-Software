'use client';

import { motion } from 'framer-motion';
import { menuCategories } from '@/data/menu';

interface MenuTabsProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function MenuTabs({
  activeCategory,
  onSelectCategory,
}: MenuTabsProps) {
  return (
    <div className="relative border-b border-white/10 pb-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {menuCategories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`relative px-4 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors duration-200 shrink-0 ${
                isActive ? 'text-[#0A0A0A]' : 'text-[#A69F96] hover:text-[#F7F3EE]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-[#ebdd0b] rounded-full shadow-[0_0_20px_rgba(235,221,11,0.35)] z-0"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
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
