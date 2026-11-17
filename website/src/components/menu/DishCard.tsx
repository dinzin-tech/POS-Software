'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Flame, Sparkles, AlertTriangle, Ban } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import DishPlaceholder from '@/components/ui/DishPlaceholder';

interface DishCardProps {
  item: MenuItem;
}

export default function DishCard({ item }: DishCardProps) {
  const [imgError, setImgError] = useState(false);

  const cartItem = useCartStore((state) => state.items.find((i) => i.item.id === item.id));
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isOutOfStock = item.stockStatus === 'out_of_stock';
  const isLowStock = item.stockStatus === 'low_stock';
  const maxAvailableStock = item.stockQuantity !== null && item.stockQuantity !== undefined ? item.stockQuantity : 99;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(item, 1, '', false);
  };

  const handleIncrement = () => {
    if (isOutOfStock || qtyInCart >= maxAvailableStock) return;
    updateQuantity(item.id, qtyInCart + 1);
  };

  const handleDecrement = () => {
    if (qtyInCart <= 0) return;
    updateQuantity(item.id, qtyInCart - 1);
  };

  const getSpiceBadge = () => {
    switch (item.spiceLevel) {
      case 'peri-peri':
        return (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[2px] text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider bg-[oklch(58%_0.15_35_/_0.2)] text-[var(--ks-vermilion)] border border-[oklch(58%_0.15_35_/_0.4)]">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Peri-Peri
          </span>
        );
      case 'hot':
        return (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[2px] text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider bg-[oklch(77%_0.13_82_/_0.2)] text-[var(--ks-kinpaku)] border border-[var(--ks-gold-hairline-strong)]">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Hot
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[2px] text-[10px] sm:text-xs font-mono font-semibold tracking-wider bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] border border-[var(--ks-gold-hairline)]">
            Medium
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`ks-tile rounded-xl sm:rounded-[6px] overflow-hidden border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] transition-all flex flex-row sm:flex-col justify-between p-3.5 sm:p-0 gap-3 sm:gap-0 ${
        isOutOfStock ? 'opacity-70 grayscale-[25%]' : 'hover:border-[var(--ks-gold-hairline-strong)]'
      }`}
    >
      {/* ======================================================== */}
      {/* MOBILE LEFT / DESKTOP BOTTOM CONTENT                     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-between min-w-0 order-1 sm:order-2 sm:p-4 sm:flex-1">
        <div>
          {/* Top Metadata row: Veg Badge + Bestseller + Spice */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1 sm:mb-2">
            {/* Standard Veg / Non-Veg Indicator */}
            {item.isVeg ? (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] border border-emerald-500 bg-[var(--ks-lacquer-deep)] flex items-center justify-center shadow-xs shrink-0" title="Pure Veg">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] border border-red-600 bg-[var(--ks-lacquer-deep)] flex items-center justify-center shadow-xs shrink-0" title="Non-Veg">
                <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] sm:border-b-[6px] border-b-red-600" />
              </span>
            )}

            {/* Bestseller Badge */}
            {item.isBestseller && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] shrink-0">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Bestseller
              </span>
            )}

            {/* Spice Badge */}
            {getSpiceBadge()}

            {/* Low Stock Badge */}
            {isLowStock && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider bg-[oklch(77%_0.13_82_/_0.2)] text-[var(--ks-kinpaku)] border border-[var(--ks-gold-hairline-strong)] shrink-0">
                <AlertTriangle className="w-2.5 h-2.5" /> Only {item.stockQuantity} Left
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h3 className="font-title text-sm sm:text-base font-semibold text-[var(--ks-champagne)] group-hover:text-[var(--ks-kinpaku)] transition-colors line-clamp-2 leading-snug">
            {item.name}
          </h3>

          {/* Price */}
          <div className="font-mono-num text-sm sm:text-base font-bold text-[var(--ks-kinpaku)] mt-1">
            ₹{item.price}
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--ks-text-muted)] line-clamp-2 leading-relaxed mt-1 font-body">
            {item.description}
          </p>

          {/* Serves / Portion */}
          {item.serves && (
            <div className="mt-1.5">
              <span className="text-[10px] font-mono text-[var(--ks-text-muted)] bg-[var(--ks-lacquer-black)] px-1.5 py-0.5 rounded-[2px] border border-[var(--ks-gold-hairline)]">
                {item.serves}
              </span>
            </div>
          )}
        </div>

        {/* Desktop-only Action Row */}
        <div className="hidden sm:flex items-center gap-2 pt-3 border-t border-[var(--ks-gold-hairline)] mt-3">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 px-3 rounded-[3px] text-xs font-mono font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] border border-[var(--ks-gold-hairline)] cursor-not-allowed min-h-[36px]"
            >
              <Ban className="w-3.5 h-3.5" /> Out of Stock
            </button>
          ) : qtyInCart > 0 ? (
            <div className="w-full flex items-center justify-between bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] rounded-[3px] px-3 py-1.5 shadow-sm font-mono text-xs font-bold min-h-[36px]">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="font-extrabold text-sm min-w-[20px] text-center">
                {qtyInCart}
              </span>
              <button
                onClick={handleIncrement}
                disabled={qtyInCart >= maxAvailableStock}
                className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded transition-colors active:scale-90 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="ks-btn-primary w-full py-2 px-4 rounded-[3px] text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to Order</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE RIGHT / DESKTOP TOP IMAGE + ACTION                */}
      {/* ======================================================== */}
      <div className="relative shrink-0 flex flex-col items-center justify-start sm:w-full sm:order-1">
        {/* Thumbnail Image Container */}
        <div className="relative w-28 h-28 sm:w-full sm:h-auto sm:aspect-[4/3] rounded-xl sm:rounded-none overflow-hidden bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)]/60">
          {item.image && !imgError ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <DishPlaceholder name={item.name} category={item.category} isVeg={item.isVeg} />
          )}

          {/* Desktop Gradient & Sold Out Overlay */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[var(--ks-raised-lacquer)] via-transparent to-black/20 pointer-events-none" />

          {/* Sold Out Overlay for Image */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white bg-red-600/90 px-1.5 py-0.5 rounded">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Mobile-Only Swiggy / Zomato Overlapping Button */}
        <div className="sm:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 w-[92px] shadow-lg">
          {isOutOfStock ? (
            <div className="w-full py-1 rounded-md text-[10px] font-mono font-bold uppercase text-center bg-neutral-800 text-neutral-400 border border-neutral-700">
              Sold Out
            </div>
          ) : qtyInCart > 0 ? (
            <div className="w-full flex items-center justify-between bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] rounded-lg px-2 py-1 shadow-md font-mono text-xs font-bold">
              <button
                onClick={handleDecrement}
                className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="font-extrabold text-xs min-w-[16px] text-center">
                {qtyInCart}
              </span>
              <button
                onClick={handleIncrement}
                disabled={qtyInCart >= maxAvailableStock}
                className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded transition-colors active:scale-90 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-1.5 px-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1 bg-[var(--ks-lacquer-black)] text-[var(--ks-kinpaku)] border-2 border-[var(--ks-kinpaku)] hover:bg-[var(--ks-kinpaku)] hover:text-[var(--ks-dark-ink)] shadow-md transition-all active:scale-95"
              aria-label={`Add ${item.name}`}
            >
              <span>ADD</span>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
