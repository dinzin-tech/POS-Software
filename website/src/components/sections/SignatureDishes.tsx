'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { menuItems } from '@/data/menu';
import DishCard from '@/components/menu/DishCard';

export default function SignatureDishes() {
  const bestsellers = menuItems.filter((item) => item.isBestseller).slice(0, 6);

  return (
    <section id="signature" className="py-20 sm:py-28 bg-[#0A0908] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A24B] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Chef's Hall of Fame</span>
            </div>
            <h2 className="font-serif-lux text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F3EE]">
              Signature <span className="text-gold-gradient">Masterpieces</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#A69F96] max-w-xl">
              Hand-picked culinary gems crafted with our secret international marinade, pressure-fried to seal in unbelievable crispness and flavor.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8C979] hover:text-white group transition-colors"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bestseller Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {bestsellers.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <DishCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
