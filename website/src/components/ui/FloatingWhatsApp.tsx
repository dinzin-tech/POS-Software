'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello Five Star Chicken Nelamangala! I would like to place an order / inquire about table reservation.`
  )}`;

  return (
    <motion.aside
      aria-label="WhatsApp quick ordering"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 flex items-center group"
    >
      {/* Tooltip on hover */}
      <span className="hidden sm:inline-block mr-2.5 px-2.5 py-1 rounded-[2px] text-xs font-mono font-medium bg-[var(--ks-lacquer-deep)] text-[var(--ks-champagne)] border border-[var(--ks-gold-hairline)] shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        WhatsApp Order & Support
      </span>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Order"
        className="relative flex items-center justify-center w-12 h-12 rounded-[4px] bg-[#25D366] text-white shadow-lg hover:brightness-105 active:scale-95 transition-all duration-150 border border-white/20"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
      </a>
    </motion.aside>
  );
}
