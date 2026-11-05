'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Flame, Sparkles, Check, AlertTriangle, Ban } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import DishPlaceholder from '@/components/ui/DishPlaceholder';

interface DishCardProps {
  item: MenuItem;
}

export default function DishCard({ item }: DishCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = item.stockStatus === 'out_of_stock';
  const isLowStock = item.stockStatus === 'low_stock';
  const maxAvailableStock = item.stockQuantity !== null && item.stockQuantity !== undefined ? item.stockQuantity : 99;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
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
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[2px] text-xs font-mono font-semibold uppercase tracking-wider bg-[oklch(58%_0.15_35_/_0.2)] text-[var(--ks-vermilion)] border border-[oklch(58%_0.15_35_/_0.4)]">
            <Flame className="w-3 h-3" />
            Peri-Peri
          </span>
        );
      case 'hot':
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[2px] text-xs font-mono font-semibold uppercase tracking-wider bg-[oklch(77%_0.13_82_/_0.2)] text-[var(--ks-kinpaku)] border border-[var(--ks-gold-hairline-strong)]">
            <Flame className="w-3 h-3" />
            Hot
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[2px] text-xs font-mono font-semibold tracking-wider bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] border border-[var(--ks-gold-hairline)]">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[2px] text-xs font-mono font-medium tracking-wider bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] border border-[var(--ks-gold-hairline)]">
            Mild
          </span>
        );
    }
  };

  return (
    <div
      className={`ks-tile rounded-[6px] overflow-hidden flex flex-col justify-between ${
        isOutOfStock ? 'opacity-70 grayscale-[25%]' : ''
      }`}
    >
      {/* Dish Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--ks-lacquer-deep)]">
        {item.image && !imgError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <DishPlaceholder name={item.name} category={item.category} isVeg={item.isVeg} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ks-raised-lacquer)] via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap max-w-[70%]">
            {/* Standard Veg / Non-Veg Indicator */}
            {item.isVeg ? (
              <span className="w-4 h-4 rounded-[2px] border border-emerald-500 bg-[var(--ks-lacquer-deep)] flex items-center justify-center shadow-sm shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-[2px] border border-red-600 bg-[var(--ks-lacquer-deep)] flex items-center justify-center shadow-sm shrink-0">
                <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-600" />
              </span>
            )}

            {/* Bestseller Badge */}
            {item.isBestseller && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-xs font-mono font-bold uppercase tracking-wider bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] shrink-0">
                <Sparkles className="w-3 h-3" /> Bestseller
              </span>
            )}

            {/* Sold Out Badge */}
            {isOutOfStock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-xs font-mono font-bold uppercase tracking-wider bg-[var(--ks-vermilion)] text-white shrink-0">
                <Ban className="w-3 h-3" /> Sold Out
              </span>
            )}

            {/* Low Stock Badge */}
            {isLowStock && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-xs font-mono font-semibold uppercase tracking-wider bg-[oklch(77%_0.13_82_/_0.2)] text-[var(--ks-kinpaku)] border border-[var(--ks-gold-hairline-strong)] shrink-0">
                <AlertTriangle className="w-3 h-3" /> Only {item.stockQuantity} Left
              </span>
            )}
          </div>

          {/* Spice Indicator Badge */}
          <div className="shrink-0">
            {getSpiceBadge()}
          </div>
        </div>

        {/* Portion / Serves Tag */}
        {item.serves && (
          <div className="absolute bottom-2 left-2.5 z-10">
            <span className="text-xs font-mono text-[var(--ks-champagne)] bg-[var(--ks-lacquer-black)]/90 px-1.5 py-0.5 rounded-[2px] border border-[var(--ks-gold-hairline)]">
              {item.serves}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-title text-base font-semibold text-[var(--ks-champagne)] group-hover:text-[var(--ks-kinpaku)] transition-colors line-clamp-1">
              {item.name}
            </h3>
            <span className="font-mono-num text-base font-bold text-[var(--ks-kinpaku)] shrink-0">
              ₹{item.price}
            </span>
          </div>

          <p className="text-xs text-[var(--ks-text-muted)] line-clamp-2 leading-relaxed mb-3 font-body">
            {item.description}
          </p>

          {/* Pure Vegetarian Indicator */}
          {item.isVeg && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-emerald-950/30 border border-emerald-500/20 text-xs font-mono text-emerald-400/80 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>100% Pure Vegetarian</span>
            </div>
          )}
        </div>

        {/* Action Row: Quantity Stepper & Add to Cart Button */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--ks-gold-hairline)]">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[var(--ks-graphite)] rounded-[2px] border border-[var(--ks-gold-hairline)] p-0.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-[2px] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] active:bg-white/10 disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-num text-xs font-semibold text-[var(--ks-champagne)] px-2 min-w-[22px] text-center">
              {isOutOfStock ? 0 : quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxAvailableStock, q + 1))}
              disabled={isOutOfStock || quantity >= maxAvailableStock}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-[2px] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] active:bg-white/10 disabled:opacity-30 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="flex-1 py-2 px-3 rounded-[2px] text-xs font-mono font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 bg-[var(--ks-graphite)] text-[var(--ks-text-mute-deep)] border border-[var(--ks-gold-hairline)] cursor-not-allowed min-h-[38px]"
            >
              <Ban className="w-3 h-3" /> Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2 px-3 rounded-[2px] text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors duration-150 min-h-[38px] ${
                isAdded
                  ? 'bg-[var(--ks-patina)] text-[var(--ks-dark-ink)] font-semibold'
                  : 'ks-btn-primary'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added!
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add to Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
