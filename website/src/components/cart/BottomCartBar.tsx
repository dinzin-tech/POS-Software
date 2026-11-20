'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useLiveMenu } from '@/lib/useLiveMenu';

export default function BottomCartBar() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const { storeStatus } = useLiveMenu();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getTotal();

  if (totalItems === 0 || isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 90, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 90, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="fixed bottom-3 inset-x-3 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:w-[380px] z-40 select-none"
      >
        <button
          onClick={openCart}
          className={`w-full ${!storeStatus.isOpen ? 'bg-[#2a2a2a] text-[#ddd]' : 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] hover:bg-[#ecd078]'} active:scale-[0.98] transition-all rounded-xl p-3 sm:p-3.5 shadow-2xl flex items-center justify-between gap-3 border ${!storeStatus.isOpen ? 'border-red-900/50' : 'border-[var(--ks-gold-hairline-strong)]'}`}
          aria-label="View Cart"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 rounded-lg ${!storeStatus.isOpen ? 'bg-red-900/30 text-red-400' : 'bg-[var(--ks-dark-ink)]/15 text-[var(--ks-dark-ink)]'} flex items-center justify-center shrink-0`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-left font-mono leading-tight">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                <span>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                {!storeStatus.isOpen && (
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1 py-0.2 rounded font-bold">
                    CLOSED
                  </span>
                )}
              </div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight">
                ₹{totalPrice}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider ${!storeStatus.isOpen ? 'bg-neutral-800 text-neutral-300' : 'bg-[var(--ks-dark-ink)] text-[var(--ks-kinpaku)]'} px-3 py-2 rounded-lg shadow-sm`}>
            <span>{!storeStatus.isOpen ? 'Cart (Closed)' : 'View Cart'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

