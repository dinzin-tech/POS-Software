'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Minus, Flame, Sparkles, Check } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCartStore } from '@/store/useCartStore';

interface DishCardProps {
  item: MenuItem;
}

export default function DishCard({ item }: DishCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(item, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuantity(1);
    }, 1200);
  };

  const getSpiceBadge = () => {
    switch (item.spiceLevel) {
      case 'peri-peri':
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-500/40">
            <Flame className="w-3 h-3 fill-red-500 text-red-500" />
            <Flame className="w-3 h-3 fill-red-500 text-red-500 -ml-1.5" />
            Peri Peri
          </span>
        );
      case 'hot':
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-950/80 text-orange-400 border border-orange-500/40">
            <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
            Hot
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-500/40">
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#1A1816] text-[#A69F96] border border-white/10">
            Mild
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl bg-[#121110] border border-white/5 hover:border-[#C9A24B]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_12px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Dish Image Container with Zoom */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1A1816]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges: Veg/Non-Veg, Bestseller, Spice */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2">
            {/* Standard Indian Veg / Non-Veg Indicator */}
            {item.isVeg ? (
              <span className="w-5 h-5 rounded border border-emerald-500 bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded border border-red-600 bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-600" />
              </span>
            )}

            {/* Bestseller Badge */}
            {item.isBestseller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#D32314] to-[#C9A24B] text-white shadow-md">
                <Sparkles className="w-2.5 h-2.5" /> Bestseller
              </span>
            )}
          </div>

          {/* Spice Indicator Badge */}
          {getSpiceBadge()}
        </div>

        {/* Portion / Serves Tag */}
        {item.serves && (
          <div className="absolute bottom-2 left-3 z-10">
            <span className="text-[10px] font-semibold text-[#E8C979] bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-[#C9A24B]/30">
              {item.serves}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-serif-lux text-base sm:text-lg font-bold text-[#F7F3EE] group-hover:text-[#E8C979] transition-colors line-clamp-1">
              {item.name}
            </h3>
            <span className="text-base sm:text-lg font-extrabold text-[#E8C979] font-serif-lux shrink-0">
              ₹{item.price}
            </span>
          </div>

          <p className="text-xs text-[#A69F96] line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Action Row: Quantity Stepper & Add to Cart Button */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#1A1816] rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1 rounded-lg text-[#A69F96] hover:text-white disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-white px-2 min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-[#A69F96] hover:text-white"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-200 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gold-gradient hover:bg-gold-gradient-hover text-[#0A0A0A] shadow-[0_0_15px_rgba(201,162,75,0.2)]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" /> Added!
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add to Feast
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
